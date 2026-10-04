#!/usr/bin/env python3
"""Scrape festival/holiday items from Hamro Patro month pages into seed.json."""

from __future__ import annotations

import json
import re
import time
import unicodedata
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "src" / "data" / "festivals" / "seed.json"

UA = {
    "User-Agent": "MitiFestivalSeed/1.0 (+https://github.com/local/miti; offline calendar seed)"
}

SOURCE = "hamropatro.com/calendar (scraped HTML embedded month JSON)"


def fetch(year: int, month: int) -> str:
    url = f"https://www.hamropatro.com/calendar/{year}/{month}"
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=45) as response:
        return response.read().decode("utf-8", errors="ignore")


def extract_month_days(html: str, year: int, month: int) -> list[dict]:
    for match in re.finditer(r'\[\{\\"year_ad\\"', html):
        chunk = html[match.start() : match.start() + 100_000]
        unescaped = chunk.replace('\\"', '"')
        depth = 0
        end = None
        for i, ch in enumerate(unescaped):
            if ch == "[":
                depth += 1
            elif ch == "]":
                depth -= 1
                if depth == 0:
                    end = i + 1
                    break
        if end is None:
            continue
        try:
            data = json.loads(unescaped[:end])
        except json.JSONDecodeError:
            continue
        in_month = [
            day
            for day in data
            if day.get("inMonth")
            and day.get("year_bs") == year
            and day.get("month_bs") == month
        ]
        if in_month:
            return in_month
    return []


def slugify(text: str) -> str:
    normalized = unicodedata.normalize("NFKD", text)
    ascii_text = "".join(ch for ch in normalized if not unicodedata.combining(ch))
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", ascii_text.lower()).strip("-")
    return (slug[:72] or "event").rstrip("-")


def classify(title_en: str, title_np: str, is_holiday: bool) -> tuple[str, int]:
    blob = f"{title_en} {title_np}".lower()
    if is_holiday:
        return "festival", 5
    if any(token in blob for token in ("jayanti", "जयन्ती", "vrata", "व्रत", "ekadashi", "एकादशी")):
        return "religious", 3
    if any(token in blob for token in ("day", "दिवस", "diwas")):
        return "national", 2
    return "cultural", 3


def scrape_years(years: list[int]) -> tuple[list[dict], list[dict]]:
    definitions: dict[str, dict] = {}
    occurrences: list[dict] = []
    seen_occ: set[str] = set()

    for year in years:
        for month in range(1, 13):
            print(f"Fetching {year}/{month} …", flush=True)
            html = fetch(year, month)
            days = extract_month_days(html, year, month)
            if not days:
                raise RuntimeError(f"No in-month days parsed for BS {year}-{month}")

            for day in days:
                pe = day.get("patroEvent") or {}
                items = pe.get("items") or []
                if not items:
                    continue

                for index, item in enumerate(items):
                    title_np = re.sub(r"\s+", " ", (item.get("titleNp") or "")).strip()
                    title_en = re.sub(r"\s+", " ", (item.get("titleEn") or "")).strip() or title_np
                    if not title_np and not title_en:
                        continue

                    is_holiday = bool(item.get("isHoliday"))
                    fest_type, importance = classify(title_en, title_np, is_holiday)
                    def_id = slugify(title_en if title_en else title_np)

                    if def_id not in definitions:
                        definitions[def_id] = {
                            "id": def_id,
                            "title_en": title_en,
                            "title_np": title_np or title_en,
                            "description_en": title_en,
                            "description_np": title_np or title_en,
                            "type": fest_type,
                            "importance": importance,
                            "is_national_holiday": is_holiday,
                        }
                    else:
                        existing = definitions[def_id]
                        if is_holiday and not existing.get("is_national_holiday"):
                            existing["is_national_holiday"] = True
                            existing["importance"] = max(existing["importance"], 5)
                            existing["type"] = "festival"

                    occ_id = (
                        f"{def_id}-{year}-{month:02d}-{day['day_bs']:02d}"
                        if index == 0
                        else f"{def_id}-{year}-{month:02d}-{day['day_bs']:02d}-{index}"
                    )
                    if occ_id in seen_occ:
                        continue
                    seen_occ.add(occ_id)

                    occurrences.append(
                        {
                            "id": occ_id,
                            "definition_id": def_id,
                            "bs_year": year,
                            "bs_month": month,
                            "bs_day": int(day["day_bs"]),
                            "ad_year": int(day["year_ad"]),
                            "ad_month": int(day["month_ad"]),
                            "ad_day": int(day["day_ad"]),
                            "title_en": title_en,
                            "title_np": title_np or title_en,
                            "type": fest_type,
                            "importance": importance,
                            "source": SOURCE,
                        }
                    )

            time.sleep(0.35)

    occurrences.sort(key=lambda o: (o["bs_year"], o["bs_month"], o["bs_day"], o["id"]))
    defs = sorted(definitions.values(), key=lambda d: d["id"])
    return defs, occurrences


def main() -> None:
    # Cover current BS year and the prior year (AD 2026 spans late 2082 → 2083).
    years = [2082, 2083]
    definitions, occurrences = scrape_years(years)

    seed = {
        "meta": {
            "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z",
            "source": SOURCE,
            "bs_years": years,
            "notes": [
                "Festival/holiday titles and dates scraped from Hamro Patro month pages.",
                "Each patroEvent item becomes one occurrence; English/Nepali titles preserved from source.",
                "Public holiday status uses Hamro Patro item.isHoliday flags.",
                "Cross-check national holidays against MoHA publications when accuracy is critical.",
            ],
        },
        "definitions": definitions,
        "occurrences": occurrences,
    }

    OUT.write_text(json.dumps(seed, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(
        f"Wrote {OUT.relative_to(ROOT)} — {len(definitions)} definitions, {len(occurrences)} occurrences"
    )


if __name__ == "__main__":
    main()
