# Festival seed attribution

`seed.json` for BS years **2082–2083** was scraped from Hamro Patro month pages:

- https://www.hamropatro.com/calendar/{bsYear}/{bsMonth}
- Embedded month JSON (`patroEvent.items` with `titleNp`, `titleEn`, `isHoliday`)
- Regenerated via `scripts/scrape-hamropatro-festivals.py`

Hamro Patro remains a third-party calendar product. Titles and holiday flags reflect what their pages publish at scrape time; they are not an official government gazette.

Public holidays should still be cross-checked against Nepal Ministry of Home Affairs schedules when accuracy is critical:

- https://moha.gov.np/en/page/government-and-public-holidays-in-2083

Do not invent festival dates. Expand the seed only from verified sources (re-run the scraper or MoHA publications).
