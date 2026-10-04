# Attribution — BS month-length dataset

Miti vendors a **slice** of Bikram Sambat calendar mathematics data derived from:

| Field | Value |
|-------|--------|
| Project | [sushilldhakal/nepali-calendar](https://github.com/sushilldhakal/nepali-calendar) |
| Package | `@sushill/bikram-sambat` |
| Upstream file | `packages/bikram-sambat/src/bs-calendar-data.json` |
| Upstream `source` field | `nepali-holiday-api/panchanga` |
| Upstream notes | `1700-1999, 2100-2200: sankranti estimated; 2000-2099: official lookup` |
| License | MIT — see `LICENSE` in this directory |
| Copyright | Copyright (c) 2026 NepaliCalendar contributors |

## What Miti vendored

Path in this repository:

```text
src/domain/calendar/data/bs-month-lengths-2000-2099.json
```

Includes:

- `month_lengths` for BS years **2000–2099** only
- `baisakh_1_ad` for BS years **2000–2100** (year 2100 is included solely to bound the end of BS 2099)

## What Miti did **not** vendor

- Estimated ranges **1700–1999** and **2100–2200**
- Festival / holiday datasets from `@sushill/bikram-sambat`
- The upstream conversion library as a runtime dependency

## Miti policy

Miti implements its own pure TypeScript calendar engine over this table. The Android widget must use the same table and match golden fixtures generated from that engine.

Festival and public-holiday content is a **separate** data pipeline (e.g. Nepal Ministry of Home Affairs schedules) and is not taken from this conversion dataset.

## VERIFY notes (Phase 1)

- MIT `LICENSE` confirmed present upstream and copied here.
- Upstream README/CHANGELOG state **2000–2099** is the official month-length lookup band.
- Spot-checks against upstream tests / civil anchors:
  - BS 2082-01-01 → AD 2025-04-14
  - BS 2083-06-18 → AD 2026-10-04
- Continuity: for every year 2000–2099, `baisakh_1_ad[y] + sum(month_lengths[y]) == baisakh_1_ad[y+1]` (including 2099→2100).
