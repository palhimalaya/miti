# Miti — Testing Strategy

> **Status:** Decisions locked (Phase 0 revision) — coding not started  
> **Depends on:** `PRD.md`, `CALENDAR_ENGINE.md`, `WIDGET_SPEC.md`, `DATA_MODEL.md`  
> **Last updated:** 2026-10-04

---

## 1. Purpose

Define what must be tested so calendar correctness, offline behavior, and widget parity remain trustworthy as the app evolves.

---

## 2. Scope

Unit, integration, UI, database, and widget testing. Excludes store release QA checklists (future).

---

## 3. Principles

1. **Calendar conversion correctness is critical** — strongest coverage lives in the domain engine.
2. Prefer pure unit tests for domain; fewer brittle UI tests.
3. Golden fixtures are the contract between TypeScript engine and Android widget.
4. Do not merge dataset changes without round-trip tests.
5. Test behavior offline (no network).

---

## 4. Tooling (proposed)

| Layer | Tool | Status |
|-------|------|--------|
| Domain unit tests | Vitest or Jest | **DECISION REQUIRED** |
| RN component tests | React Native Testing Library | Proposed |
| DB tests | Jest/Vitest + SQLite test db | Proposed |
| Widget | JUnit + Android instrumentation; manual device checks | **TODO** |
| E2E | Maestro/Detox | P2 |

---

## 5. Calendar engine tests (P0)

Mandatory:

| Suite | Examples |
|-------|----------|
| BS → AD | Known anchors across years |
| AD → BS | Known anchors |
| Round-trip | Sampled exhaustive years in range |
| Month boundaries | Day 1 and last day AD pairing |
| Year boundaries | Last Chaitra → Baishakh 1 |
| Variable lengths | Same month number different `daysInMonth` across years |
| Weekdays | Known historical/current dates |
| Invalid dates | Reject 32+ days, month 0/13, OOR years |
| Range edges | BS years **2000** and **2099** |
| Grid helper | Sunday-start padding (`weekStartsOn = 0`) |
| Timezone adapter | Kathmandu civil date vs system clock edge cases (unit-test adapter) |

### Golden fixtures

Generate JSON:

```json
{
  "bs": { "year": 2083, "month": 6, "day": 18 },
  "ad": { "year": 2026, "month": 10, "day": 4 },
  "weekdayIndex": 0
}
```

Native widget tests consume the same file. **VERIFY** concrete fixture list before coding (do not invent “known” dates without sources).

---

## 6. UI tests

| Case | Priority |
|------|----------|
| Month navigation updates BS title + grid | P0 |
| Date selection updates detail header (BS + AD) | P0 |
| Today button returns to current month/day | P0 |
| Festival indicator appears when occurrence exists | P0 |
| English (AD) date renders under BS | P0 |
| Nepali date/numeral rendering | P0 |
| Empty festival day still shows dual dates | P0 |
| Settings numeral toggle updates cells | P1 |

Avoid asserting exact animation frames.

---

## 7. Database tests

| Case | Priority |
|------|----------|
| Migrations apply cleanly on empty DB | P0 |
| Festival seed upsert idempotent | P0 |
| Occurrence query by BS month | P0 |
| Event CRUD + soft delete | P1 |
| Settings persist | P0 |
| Occurrence AD/BS consistency check vs engine | P0 |

---

## 8. Widget tests

| Case | Priority |
|------|----------|
| Initial state shows current Kathmandu month/today | P0 |
| Prev/next month across year boundary | P0 |
| Select date updates summary | P0 |
| Festival line/marker rendering | P0 |
| Shared state sync with app | P0 |
| Cold start / reboot without JS | P0 |
| Parity with golden fixtures | P0 |
| Deep link opens correct date | P0 |
| Large widget | P1 |

Manual checklist on a physical device is required for MVP widget acceptance.

---

## 9. Offline / privacy tests

- Airplane mode: calendar browse + festival detail works.
- No unexpected network calls on startup (**VERIFY** with tooling when available).
- Widget does not show note bodies when privacy setting is off.

---

## 10. Performance smoke (lightweight)

Not full benchmarks in MVP. Spot-check:

- Month swipe remains smooth on mid-tier Android.
- No per-cell SQLite queries (assert via repository API design + code review; optional logging test).

---

## 11. CI expectations (when repo is live)

```text
lint → domain tests → db tests → (optional) UI tests → android unit tests for widget math
```

Block merge on domain test failure.

---

## 12. Open questions

| ID | Question | Status |
|----|----------|--------|
| Q-X01 | Jest vs Vitest for domain? | **DECISION REQUIRED** |
| Q-X02 | Authoritative list of golden dates/sources? | **VERIFY** |
| Q-X03 | E2E framework later? | P2 |

---

## 13. Implementation guidance

1. Create engine tests before UI.
2. Generate golden fixtures as a versioned artifact.
3. Add seed validation tests next.
4. Widget parity tests as soon as native module exists.
5. Expand UI tests after calendar screen stabilizes.
