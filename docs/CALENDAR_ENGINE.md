# Miti — Calendar Engine

> **Status:** Decisions locked (Phase 0 revision) — coding not started  
> **Risk level:** Highest (correctness-critical)  
> **Depends on:** `PRD.md`, `ARCHITECTURE.md`  
> **Last updated:** 2026-10-04

---

## 1. Purpose

Specify the pure domain module that converts and constructs Nepali Bikram Sambat (BS) and Gregorian (AD) dates. This module is the **canonical calendar mathematics implementation for the React Native app**, and the contract baseline for the native Android widget via a shared vendored dataset and golden fixtures.

---

## 2. Scope

### In scope

- BS ↔ AD conversion for **BS 2000–2099**
- Month/year construction and boundaries
- Weekday resolution (Sunday = 0)
- Canonical date types
- Vendored month-length dataset requirements
- Testing requirements for conversion correctness
- Public API surface for app; parity contract for widget

### Out of scope

- UI rendering, numerals formatting (thin formatters may live outside engine)
- SQLite access
- Festival/holiday business rules (separate data pipeline)
- Timezone math inside the pure engine (adapter injects Kathmandu civil AD date)

---

## 3. Non-negotiable constraints

1. **Framework-independent:** no React, React Native, Zustand, SQLite, Expo.
2. **No assumed fixed Nepali month lengths** — use an explicit year→month-length table.
3. **No invented conversions** — every conversion path must be backed by dataset + tests.
4. **No opaque third-party library as the core engine** — vendor the table; own a small pure TS engine.
5. **No duplicated engines** in UI or random utils.
6. Deterministic: same inputs → same outputs on all platforms.
7. Supported range edges **2000** and **2099** must be tested explicitly.

---

## 4. Background (domain facts)

- Bikram Sambat months do **not** have a single universal length; day counts differ by year.
- Reliable engines use **year → [m1…m12] day-count tables** plus an epoch anchor.
- AD leap years follow Gregorian rules; BS variation is expressed via month lengths in the dataset.

### Separate from festivals

```text
Calendar mathematics
        ↓
Verified BS month-length dataset

Holidays/festivals
        ↓
Official Nepal government / verified cultural sources
```

Do not mix those responsibilities. The engine never embeds holiday schedules.

---

## 5. Decisions (locked)

### CE-01 — Pure module location

**Decision:** `src/domain/calendar/` with this shape:

```text
domain/calendar
 ├── conversion.ts
 ├── validation.ts
 ├── month.ts
 ├── weekday.ts
 └── data/
      └── bs-month-lengths-2000-2099.json
```

Extract to a package later only if sharing mechanics require it.

### CE-02 — Vendored month-length dataset (not runtime API, not opaque lib)

**Decision (locked):**

- Use a **verified vendored** BS month-length dataset committed in-repo.
- Do **not** depend on a runtime network API for conversion.
- Do **not** adopt an opaque third-party date library as Miti’s core engine.
- Write a small first-party TypeScript engine around the table.

**Candidate source (pre-vendoring):** [sushilldhakal/nepali-calendar](https://github.com/sushilldhakal/nepali-calendar) (`@sushill/bikram-sambat`)

| Claim from upstream README | Miti policy |
|----------------------------|-------------|
| MIT licensed | Compatible **if** LICENSE/attribution preserved — **VERIFY** before copy |
| **2000–2099** = “Official month-length lookup” | **Only this range** may be considered for MVP vendoring |
| 1700–1999 / 2100–2200 = Sankranti-based **estimation** | **Out of scope** — do not vendor estimated ranges as authoritative |

**Before copying any data:**

1. Inspect `packages/bikram-sambat/src/bs-calendar-data.json` (or equivalent) structure  
2. Confirm MIT `LICENSE` and required copyright notice  
3. Document provenance/attribution in-repo (e.g. `NOTICE` / dataset README)  
4. Extract **only** 2000–2099 month lengths (+ required epoch anchor fields)  
5. Cross-check a sample of years against independent known anchors  

**Status:** ✅ Vendored in Phase 1 — see `src/domain/calendar/data/bs-month-lengths-2000-2099.json` and `third_party/sushill-nepali-calendar/ATTRIBUTION.md`.

### CE-03 — Supported range

**Decision (locked):**

```ts
export const MIN_BS_YEAR = 2000
export const MAX_BS_YEAR = 2099
```

UI, widget, and validation derive bounds from these constants — never scatter magic numbers.

### CE-04 — Canonical types in domain

**Decision:** Export canonical `BsDate`, `AdDate`, `CalendarDay`, and error types from the domain module.

### CE-05 — Engine does not own festivals

**Decision:** Engine returns dates only. Festival attachment is a higher layer keyed by BS/AD date.

### CE-06 — “Today” injection; product timezone locked

**Product rule (locked):** Miti’s “today” is always the civil date in **`Asia/Kathmandu`**.

```text
System clock
     ↓
Asia/Kathmandu civil date   ← adapter outside engine
     ↓
AD date
     ↓
BS date
```

**Engine rule:** `getToday(adToday: AdDate)` accepts an explicit civil AD date. No scattered `new Date()` in UI for “today”; one adapter owns Kathmandu conversion.

### CE-07 — Week starts Sunday

**Decision (locked):** `weekday.index` **0 = Sunday** … **6 = Saturday**. Grid columns Sunday → Saturday.

### CE-08 — Widget parity

**Decision (locked):** Native widget uses the same vendored dataset and must match golden fixtures generated from this TS engine. Widget must not call the RN JS runtime for math.

---

## 6. Canonical types

```ts
export const MIN_BS_YEAR = 2000
export const MAX_BS_YEAR = 2099

/** Bikram Sambat civil date */
export type BsDate = {
  year: number
  month: number // 1–12 (Baishakh=1 … Chaitra=12)
  day: number
}

/** Gregorian civil date */
export type AdDate = {
  year: number
  month: number // 1–12
  day: number
}

export type Weekday = {
  index: number // 0 = Sunday (locked)
  nameEn: string
  nameNp: string
  shortEn: string
  shortNp: string
}

export type CalendarDay = {
  bs: BsDate & {
    monthNameEn: string
    monthNameNp: string
  }
  ad: AdDate & {
    monthNameEn: string
    monthNameNp?: string
  }
  weekday: Weekday
}

export type CalendarMonth = {
  bsYear: number
  bsMonth: number
  monthNameEn: string
  monthNameNp: string
  daysInMonth: number
  days: CalendarDay[]
}

export type CalendarErrorCode =
  | 'BS_OUT_OF_RANGE'
  | 'AD_OUT_OF_RANGE'
  | 'INVALID_BS_DATE'
  | 'INVALID_AD_DATE'
```

### Month naming (Nepali)

| # | Nepali | English (common) |
|---|--------|------------------|
| 1 | बैशाख | Baishakh |
| 2 | जेठ / जेष्ठ | Jestha |
| 3 | असार | Ashadh |
| 4 | साउन / श्रावण | Shrawan |
| 5 | भदौ | Bhadra |
| 6 | असोज / आश्विन | Ashwin |
| 7 | कात्तिक | Kartik |
| 8 | मंसिर | Mangsir |
| 9 | पुस / पौष | Poush |
| 10 | माघ | Magh |
| 11 | फागुन | Falgun |
| 12 | चैत | Chaitra |

**VERIFY:** Prefer one spelling set for UI copy; keep stable enum keys in code (`BAISHAKH`, …).

---

## 7. Public API

Minimum surface:

```ts
bsToAd(year: number, month: number, day: number): AdDate
adToBs(year: number, month: number, day: number): BsDate

getMonth(year: number, month: number): CalendarMonth
getDay(bs: BsDate): CalendarDay
getToday(adToday: AdDate): CalendarDay

getWeekday(ad: AdDate): Weekday

daysInBsMonth(year: number, month: number): number
isValidBsDate(year: number, month: number, day: number): boolean
isValidAdDate(year: number, month: number, day: number): boolean

getSupportedBsRange(): { minYear: number; maxYear: number } // 2000–2099

addBsDays(bs: BsDate, delta: number): BsDate
compareBs(a: BsDate, b: BsDate): number
formatBsKey(bs: BsDate): string // "bs:2083-06-18"

getMonthGrid(
  bsYear: number,
  bsMonth: number,
  options?: { weekStartsOn?: 0 } // MVP: Sunday only
): (CalendarDay | null)[]
```

### API rules

- Prefer `Result` / typed errors for invalid input — **propose Result**; finalize at implementation if ergonomics demand throws for internal helpers.
- Never silent-clamp invalid dates.
- All core functions pure except the Kathmandu today **adapter** (outside this module).

---

## 8. Algorithms & dataset

### Required capabilities

| Capability | Notes |
|------------|--------|
| Year/month/day | Validate against month length table |
| Month length | From dataset for that BS year |
| Month boundaries | day 1 and daysInMonth |
| Year boundaries | Chaitra end → next Baishakh |
| Weekday | Compute from AD side, then attach |
| Conversion both ways | Must round-trip for all valid dates in 2000–2099 |

### Round-trip invariant

For every valid BS date in range:

```text
ad = bsToAd(bs)
bs2 = adToBs(ad)
bs2 == bs
```

And inverse for every valid AD date that maps into supported BS range.

### Dataset shape (proposed)

```ts
type BsYearData = {
  year: number // 2000…2099
  monthDays: [
    number, number, number, number,
    number, number, number, number,
    number, number, number, number
  ]
}

// Plus epoch anchor documenting BS↔AD alignment used by conversion
```

Final JSON schema may match upstream after inspection — normalize into Miti’s shape at vendoring time.

---

## 9. Week grid construction

**Locked:** First column = Sunday.

Domain should expose `getMonthGrid` (or equivalent) so app and widget share one padding model and avoid off-by-one bugs.

Weekday header (bilingual Nepali-first UI):

```text
आइत   सोम   मंगल   बुध   बिहि   शुक्र   शनि
 Sun   Mon   Tue    Wed   Thu    Fri     Sat
```

---

## 10. Formatting boundary

Engine provides structural names. Numeral shaping (१८ vs 18) is presentation, driven by settings.

---

## 11. Data source & attribution

| Item | Status |
|------|--------|
| Approach: vendored 2000–2099 table + own TS engine | ✅ Done |
| Upstream: sushilldhakal/nepali-calendar / `@sushill/bikram-sambat` (MIT) | ✅ Used as table source only |
| LICENSE + copyright notice | ✅ `third_party/sushill-nepali-calendar/` |
| Official lookup vs estimated | ✅ Only 2000–2099 vendored; estimated bands excluded |
| Attribution documented | ✅ `ATTRIBUTION.md` |
| Spot-checks | ✅ 2082-01-01→2025-04-14; 2083-06-18→2026-10-04; continuity 2000–2100 Baishakh-1 anchors |
| Engine implementation | ✅ `src/domain/calendar/*` + golden fixtures + Vitest |

**Forbidden:** Hand-entering approximate months; shipping estimated 1700–1999 / 2100–2200 ranges as if authoritative; calling Patro/network APIs for core conversion; depending on `@sushill/bikram-sambat` at runtime.

---

## 12. Error handling

Invalid examples:

- BS day beyond that year’s month length
- BS year &lt; 2000 or &gt; 2099
- Month 0 or 13

Behavior: fail clearly; UI shows “Date not supported” rather than a wrong date.

---

## 13. Performance guidance

- Month length lookups O(1) per year.
- `getMonth` cheap enough for rapid navigation; feature-layer cache OK.
- Do not precompute unnecessary multi-century structures (range is only 100 years).

---

## 14. Testing requirements (engine)

Mandatory suites — details in `TESTING.md`:

1. Known anchors (**VERIFY** list from independent sources before coding)
2. Round-trip sampling across 2000–2099
3. Month length boundaries
4. Year boundaries (Chaitra → Baishakh)
5. Variable month lengths across years
6. Weekdays for known dates (`0 = Sunday`)
7. Invalid date rejection
8. Range edges: year 2000 and 2099
9. Golden JSON fixtures for native parity

**Rule:** Any change to dataset or conversion code requires engine tests to pass before merge.

---

## 15. Widget / native sharing contract

```text
Same month index meaning (Baishakh = 1)
Same key format bs:YYYY-MM-DD
Same supported range 2000–2099
Same weekday indexing (0 = Sunday)
Same month-length table bytes/content
```

Generate **golden JSON fixtures** from the TS engine; Kotlin tests must match.

---

## 16. Implementation guidance

1. Complete VERIFY checklist for candidate dataset; vendor 2000–2099 only with attribution.
2. Implement validation + `daysInBsMonth` using `MIN_BS_YEAR` / `MAX_BS_YEAR`.
3. Implement `bsToAd` / `adToBs` against epoch + totals.
4. Implement `getMonth` / `getDay` / weekday / `getMonthGrid`.
5. Lock with golden tests.
6. Only then wire UI and widget.

### Forbidden shortcuts

- Using JavaScript `Date` to approximate BS months
- Hardcoding “every month has 30 days”
- Copying conversion snippets into React components
- Depending on `@sushill/bikram-sambat` (or similar) as a black-box runtime core
- Shipping without range-edge tests

---

## 17. Locked decisions

| ID | Decision | Status |
|----|----------|--------|
| Q-C01 | Vendored verified month-length dataset; own TS engine; candidate MIT upstream for 2000–2099 only | ✅ Locked (copy pending VERIFY) |
| Q-C02 | Supported BS range = **2000–2099** | ✅ Locked |
| Q-C04 | Week starts Sunday (`index` 0) | ✅ Locked |
| Q-P02 | Today adapter uses Asia/Kathmandu (outside engine) | ✅ Locked |

## 18. Remaining verification / open items

| ID | Question | Status |
|----|----------|--------|
| Q-C03 | Month 1 = Baishakh | ✅ Confirmed (upstream + table semantics) |
| Q-C05 | Result type vs thrown errors | ✅ `Result` used in public API |
| Q-C06 | Keep `src/domain/calendar` (no monorepo yet) | ✅ |
| Q-C07 | English transliteration standard for month names | **TODO** (UI copy polish) |
| Q-C08 | Epoch anchor + spot-check against independent anchors | ✅ Phase 1 fixtures |
| Q-C09 | Upstream data file schema & attribution text | ✅ Done |

---

## 19. Acceptance criteria

Calendar engine is ready for UI integration when:

1. Bidirectional conversion works for BS 2000–2099 with round-trip tests.
2. `getMonth` returns correct lengths and AD pairing for each BS day.
3. Invalid / out-of-range dates are rejected.
4. Module has no framework imports.
5. Dataset provenance + MIT attribution documented.
6. Golden fixtures exist for native/widget parity checks.
7. Estimated ranges outside 2000–2099 are not present in the vendored MVP dataset.
