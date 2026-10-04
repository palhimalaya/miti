# Miti — Architecture

> **Status:** Decisions locked (Phase 0 revision) — coding not started  
> **Depends on:** `PRD.md` (product truth)  
> **Last updated:** 2026-10-04

---

## 1. Purpose

Define system boundaries, module responsibilities, data flow, and the rules that keep calendar correctness, offline operation, and the Android widget coherent as the app grows.

---

## 2. Scope

### In scope

- Application architecture for React Native (Expo) Android app
- Pure calendar domain module
- Local persistence (SQLite / Drizzle)
- Festival/event data pipeline
- Shared core used by app + Android widget
- Future sync extension points (documented only)

### Out of scope

- Implementing backend services in v1
- Final festival dataset curation (see open questions)
- Pixel-level UI (see `DESIGN_SYSTEM.md`)

---

## 3. System overview

```text
                    MITI
                     │
             ┌───────┴────────┐
             │                │
       Calendar Domain     Application
             │                │
        BS ↔ AD Engine    React Native
             │                │
          Festival         SQLite/Drizzle
           Data                │
             │                │
             └───────┬────────┘
                     │
              Android Widget
```

**Intent:** The calendar domain is reusable independently of React Native UI. The widget must not reimplement conversion logic.

---

## 4. Architectural decisions

### AD-01 — Canonical TypeScript engine + native widget consumer

**Decision (locked):**

```text
The TypeScript calendar engine is the canonical implementation
for the React Native application.

The Android widget is a separate native consumer.

The widget MUST NOT depend on the React Native JS runtime.

The widget uses the same vendored calendar dataset and is
validated against shared golden fixtures.

Any native calendar calculation that diverges from the
TypeScript engine is a release blocker.
```

- App conversion/month logic lives in pure TypeScript under `domain/calendar` with **zero** React / RN / Zustand / SQLite dependencies.
- Do **not** make Kotlin call TypeScript at runtime.
- Do **not** adopt an opaque third-party date library as the core engine; vendor an explicit month-length dataset and own the engine.

**Why:** Correctness, testability, reboot/offline widget autonomy, future iOS.

**Status:** ✅ Locked (B-lite). See §8.

### AD-02 — Offline-first local source of truth

**Decision:** SQLite on device is the persistence source of truth for settings, personal events, notes, and installed festival occurrence data. No network required to render the calendar.

**Why:** PRD offline-first principle.

### AD-03 — Structured festival data

**Decision:** Festivals/holidays are data (definitions + occurrences), not hardcoded UI strings/branches.

### AD-04 — Feature/domain folder orientation

**Decision:** Organize by feature/domain (`features/*`, `domain/calendar`) rather than a flat `utils/` dumping ground.

### AD-05 — State: Zustand for truly global UI state

**Decision:** Use Zustand for cross-screen UI state (selected date, visible month, settings cache). Avoid stuffing everything into React Context. Prefer local component state when possible.

### AD-06 — Data access via repositories/services

**Decision:** UI never opens SQLite directly. Features call repository/service APIs.

### AD-07 — No backend in v1

**Decision:** No API server unless explicitly requested later. Schema and IDs should still be sync-friendly.

### AD-08 — Widget as peer surface

**Decision:** Widget is a first-class client of shared calendar + shared data, not a WebView screenshot of RN.

### AD-09 — Single styling system

**Decision (locked):** React Native `StyleSheet` + centralized design tokens under `src/theme/`. Do **not** use NativeWind.

```text
theme/
├── colors.ts
├── typography.ts
├── spacing.ts
├── radii.ts
├── elevation.ts
└── index.ts
```

Widget styles are native and mirror token intent only.

### AD-10 — Today = Asia/Kathmandu

**Decision (locked):** Product “today” is always the civil date in `Asia/Kathmandu`. Device timezone must not change the meaning of today.

Timezone conversion lives in a thin adapter outside the pure engine; the engine receives an explicit AD civil date.

### AD-11 — Week starts Sunday

**Decision (locked):** Calendar grids are Sunday → Saturday. `weekday.index` **0 = Sunday**.

### AD-12 — Separate math data from festival data

**Decision (locked):**

```text
Calendar mathematics  →  verified BS month-length dataset
Holidays/festivals    →  official Nepal government / verified cultural sources
```

Do not mix those responsibilities or pipelines.

---

## 5. Proposed source layout

```text
src/
├── app/                 # Expo Router screens / navigation
├── components/          # Shared presentational UI (no domain conversion)
├── features/
│   ├── calendar/        # Calendar screen, month grid, selection UI
│   ├── events/          # Personal events (V1)
│   ├── festivals/       # Festival presentation helpers (consume data)
│   ├── settings/
│   └── widget/          # RN-side widget bridge / sync helpers
├── domain/
│   └── calendar/        # Pure BS↔AD engine (canonical for RN)
│       ├── conversion.ts
│       ├── validation.ts
│       ├── month.ts
│       ├── weekday.ts
│       └── data/
│           └── bs-month-lengths-2000-2099.json
├── data/
│   └── festivals/       # Bundled seed definitions & occurrences (separate from math)
├── db/
│   ├── schema/          # Drizzle schema
│   ├── migrations/
│   └── repositories/    # CRUD / queries
├── stores/              # Zustand stores
├── services/            # Orchestration (Kathmandu today adapter, seeding, etc.)
├── hooks/
├── theme/               # StyleSheet design tokens (colors, typography, spacing, …)
├── utils/               # Truly generic helpers only (formatting glue OK; no BS math)
└── types/
```

**Constraint:** Business calendar logic does **not** live under `utils/`.

Native Android widget project/module (exact path **TODO** pending Expo/Glance spike):

```text
android/…/widget/        # Glance preferred; AppWidget fallback
```

Native side also packages the **same** BS 2000–2099 month-length table (generated/copied from the vendored source dataset) plus golden fixtures for parity tests.

---

## 6. Layering rules

```text
UI (screens/components)
    ↓
Hooks / Stores (UI state)
    ↓
Services / Repositories
    ↓
SQLite  |  Domain Calendar Engine  |  Bundled static data
```

| Layer | May depend on | Must not depend on |
|-------|---------------|--------------------|
| `domain/calendar` | Pure TS, bundled calendar tables | React, RN, DB, stores, UI |
| `db/repositories` | Drizzle, schema, domain types | UI components |
| `features/*` | hooks, services, domain APIs, theme | Raw SQL, conversion algorithms |
| `app/` | features, components | Domain internals |
| Widget native UI | Same vendored dataset + shared state/DB | RN JS runtime; divergent undocumented math |

---

## 7. Core flows

### 7.1 Render a month

1. UI requests `getMonth(bsYear, bsMonth)` from domain.
2. Domain returns ordered `CalendarDay[]` (and leading/trailing padding metadata if needed).
3. Feature layer batch-loads festivals/events for that BS month range via repository.
4. Grid cells receive `{ day, indicators }` — no per-cell DB queries.

### 7.2 Select a date

1. Store updates `selectedDay` (canonical `CalendarDay` or BS key).
2. Detail panel reads events for that day from repository cache/query.
3. Widget selection sync uses the same canonical key (see §9).

### 7.3 Today

```text
System clock
     ↓
Asia/Kathmandu civil date   ← thin adapter (not inside pure engine)
     ↓
AD date
     ↓
BS date (domain engine)
```

1. Adapter resolves Kathmandu civil AD date from the system clock.
2. Domain `getToday(adToday)` → `CalendarDay`.
3. Navigate visible month + highlight.

### 7.4 Offline festival lookup

1. Seed festival definitions/occurrences into SQLite (or read immutable bundled data + overlay DB for user data).
2. Lookup by BS date key (preferred) and/or AD date key as documented in `DATA_MODEL.md`.

---

## 8. Shared core for app + widget (B-lite — locked)

### Goal

```text
                 SOURCE DATA
                     │
             BS month-length table
              (2000–2099, vendored)
                     │
          ┌──────────┴──────────┐
          ↓                     ↓
    TypeScript engine       Kotlin widget
    (canonical for RN)     (native consumer)
          │                     │
          └──────────┬──────────┘
                     ↓
               Golden fixtures
                     ↓
                 MUST MATCH
```

### Locked rules

1. **One authoritative calendar dataset** in-repo; generate/copy native tables from it.
2. **TS engine** is canonical for the React Native app.
3. **Kotlin widget** may have a separate execution implementation reading the same dataset.
4. Widget **must not** depend on the React Native JS runtime/bridge for date math.
5. Widget must render correct dual dates after reboot **without** JS.
6. Divergence from TS golden fixtures is a **release blocker**.

Rejected alternatives:

| Option | Why rejected |
|--------|----------------|
| A (JS-precomputed payloads only) | Weaker reboot autonomy; still may use for festival overlays, not as sole math path |
| C (Kotlin as source of truth) | Hurts Expo/RN simplicity and future iOS portability |
| Kotlin calling TypeScript at runtime | Couples widget to RN bridge; fails offline/reboot goals |

---

## 9. Canonical date model

One source of truth for date representation. UI and DB keys derive from it.

Canonical shape (detail in `CALENDAR_ENGINE.md`):

```ts
type CalendarDay = {
  bs: {
    year: number
    month: number // 1–12 (Baishakh=1)
    day: number
    monthName: string // locale-aware display may be separate
  }
  ad: {
    year: number
    month: number // 1–12
    day: number
    monthName: string
  }
  weekday: {
    index: number // 0 = Sunday (locked)
    name: string
    shortName: string
  }
}
```

**Stable key suggestion:**

```text
bs:YYYY-MM-DD
```

Use for selection, events, and widget sync. Store AD mirror fields for query convenience where justified; do not fork conversion logic.

---

## 10. State architecture

| State | Location |
|-------|----------|
| Visible BS month | Zustand calendar store |
| Selected day key | Zustand calendar store |
| Settings | SQLite + Zustand cache |
| Festival month cache | Feature query cache / store slice |
| Form draft state | Local component state |

**Rule:** Avoid global state unless multiple distant consumers need it.

---

## 11. Persistence architecture

See `DATA_MODEL.md` for schema.

Principles:

- Prefer computing month grids over storing every `calendar_days` row unless caching proves necessary.
- Store user data and curated festival occurrences.
- Use migrations for all schema changes.
- Assign stable UUIDs to user-created rows for future sync.
- Include `updated_at` / soft-delete or tombstone strategy for future sync (**document in data model**).

---

## 12. Future sync architecture (not v1)

```text
React Native
     │
    API
     │
 PostgreSQL
     │
 Redis / Queue
```

Local schema should anticipate:

- `id` (UUID)
- `updated_at`
- `deleted_at` or sync tombstones
- `owner_id` nullable until accounts exist
- conflict fields later

Do not build the API now.

---

## 13. Navigation architecture

Expo Router tabs:

```text
/(tabs)/calendar
/(tabs)/events
/(tabs)/settings
```

Deep links from widget → selected date on calendar tab.

---

## 14. Cross-cutting concerns

### Performance

- Build a month once per navigation.
- Batch event fetches per month.
- Memoize cells only when measured beneficial.
- Avoid global store updates on every hover/press noise.

### Accessibility

- Semantic labels for cells (“18 Ashwin 2083, October 4 2026, Ghatasthapana”).
- Do not use color alone for festivals.
- Large enough touch targets.

### Security / privacy

- On-device data; minimal permissions.
- Widget data is visible on lock screen — avoid sensitive note previews by default (personal events are P1; default hide note bodies when introduced).

---

## 15. Strict architectural rules (summary)

Full agent rules in `PROJECT_RULES.md`. Architecture-critical:

1. UI must not implement BS/AD conversion.
2. Domain calendar logic stays framework-independent.
3. Components do not touch SQLite directly.
4. Festivals come from structured data.
5. No duplicated date calculations.
6. No unnecessary global state.
7. No undocumented dependencies.
8. Prefer simple solutions over abstraction theater.
9. No backend in v1.
10. Offline core always works.
11. Widget must not break when calendar logic changes — share contracts + tests.

---

## 16. Locked architecture decisions

| ID | Decision | Status |
|----|----------|--------|
| Q-A01 | B-lite: one vendored dataset; TS canonical for RN; Kotlin widget separate; golden fixtures must match | ✅ Locked |
| Q-A02 | StyleSheet + typed design tokens (no NativeWind) | ✅ Locked |
| Q-A03 | Week starts Sunday | ✅ Locked |
| Q-A04 | Do **not** materialize full `calendar_days` table | ✅ Locked |

## 17. Remaining verification items

| ID | Question | Status |
|----|----------|--------|
| Q-A05 | Expo CNG / prebuild / config plugin needs for Glance (AppWidget fallback)? | **VERIFY** (spike) |
| Q-A06 | Native packaging path for month-length JSON/assets + fixture tests | **VERIFY** |
| Q-A07 | Expo SQLite readability from widget process vs mirrored store | **VERIFY** |

---

## 18. Implementation guidance

1. Vendor + attribute BS 2000–2099 month-length dataset; implement & test `domain/calendar` with golden fixtures.
2. Seed festival/holiday data (separate pipeline) and repository APIs.
3. Build calendar feature UI against domain APIs (StyleSheet + tokens).
4. Add settings persistence.
5. Spike Glance widget; fall back to AppWidget if needed; parity against fixtures.
6. Only then expand personal events / notifications (P1).

Do not start with screens that invent date math. Do not scaffold until Phase 0 verify list is acknowledged.
