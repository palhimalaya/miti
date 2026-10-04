# Miti — Data Model

> **Status:** Decisions locked (Phase 0 revision) — coding not started  
> **Depends on:** `PRD.md`, `ARCHITECTURE.md`, `CALENDAR_ENGINE.md`  
> **Last updated:** 2026-10-04

---

## 1. Purpose

Define local SQLite persistence: entities, fields, indexes, ownership, migrations, and how the schema stays ready for future sync without implementing a backend in v1.

---

## 2. Scope

- SQLite schema for settings, festivals/holidays, personal events, notes
- Seed/bundled data strategy
- What **not** to store (derived calendar grids)
- Future sync fields

Out of scope: PostgreSQL server schema (future sketch only).

---

## 3. Decisions

### DM-01 — SQLite as local source of truth

Accepted for persisted app data.

### DM-02 — Do not materialize all calendar days

**Decision:** Month grids are computed by the calendar engine. Do **not** require a full `calendar_days` table for every day unless profiling demands a cache.

Optional later: cache table for widget payloads — not a domain necessity.

### DM-03 — Separate festival definition from occurrence

**Decision:** Where a festival recurs or has multi-year instances, store definition + occurrence rows. One-off national holidays may be occurrence-only with inline titles if simpler — prefer consistency.

### DM-04 — Sync-friendly identifiers

**Decision:** User-generated rows use UUIDs. Include `created_at`, `updated_at`, and soft delete (`deleted_at`) early.

### DM-05 — Festivals are structured data

UI never hardcodes festival dates. Festival/holiday seeds are a **separate pipeline** from the BS month-length math dataset.

### DM-06 — Widget state table

**Decision (locked for MVP design):** Use dedicated `widget_state` table (or equivalent singleton row) rather than only opaque settings KV, to ease native mapping.

### DM-07 — Personal events timing

**Decision (locked):** Personal `events` schema may exist early for forward-compat, but **product feature is P1** — not required to ship MVP UI.

---

## 4. Entity overview

```text
festival_definitions
festival_occurrences
events              # personal + typed user events (V1)
notes               # optional; may merge into events metadata for MVP simplicity
settings
widget_state        # dedicated singleton table (locked)
```

Legacy name from brief `calendar_days`: **not required** for MVP (see DM-02).

---

## 5. Tables

> Field types are logical; Drizzle/SQLite mapping may use `text` for ISO datetimes and JSON.

### 5.1 `festival_definitions`

Curated catalog entries (Dashain, Tihar, …).

| Column | Type | Notes |
|--------|------|--------|
| `id` | text (stable slug or UUID) | e.g. `dashain_ghatasthapana` |
| `title_en` | text | |
| `title_np` | text | |
| `description_en` | text nullable | |
| `description_np` | text nullable | |
| `type` | text | `festival` / `holiday` / `religious` / `cultural` / `national` |
| `importance` | integer | e.g. 1–5 |
| `metadata_json` | text nullable | tags, regions, etc. |
| `created_at` | text | ISO |
| `updated_at` | text | ISO |

### 5.2 `festival_occurrences`

Concrete dates. **Do not invent.**

| Column | Type | Notes |
|--------|------|--------|
| `id` | text UUID/slug | |
| `definition_id` | text FK nullable | null for one-offs |
| `bs_year` | integer | |
| `bs_month` | integer | |
| `bs_day` | integer | |
| `ad_year` | integer | denormalized for query convenience |
| `ad_month` | integer | |
| `ad_day` | integer | |
| `title_en` | text nullable | override |
| `title_np` | text nullable | override |
| `type` | text | denormalized copy if needed |
| `importance` | integer | |
| `all_day` | integer | 1 default |
| `source` | text | dataset attribution key |
| `metadata_json` | text nullable | |
| `created_at` | text | |
| `updated_at` | text | |

**Indexes:**

- `(bs_year, bs_month, bs_day)`
- `(ad_year, ad_month, ad_day)`
- `(bs_year, bs_month)` for month batch queries
- `(definition_id)`

**Rule:** `ad_*` must match engine conversion for `bs_*`. Validate at seed time with tests.

### 5.3 `events` (personal — P1)

| Column | Type | Notes |
|--------|------|--------|
| `id` | text UUID | |
| `title` | text | |
| `notes` | text nullable | |
| `type` | text | `personal` `reminder` `birthday` `anniversary` … |
| `calendar_basis` | text | `bs` \| `ad` — **critical for recurrence** |
| `bs_year` | integer nullable | null if floating AD-only? prefer always store both |
| `bs_month` | integer | |
| `bs_day` | integer | |
| `ad_year` | integer | |
| `ad_month` | integer | |
| `ad_day` | integer | |
| `importance` | integer default | |
| `recurrence_json` | text nullable | see §7 |
| `metadata_json` | text nullable | |
| `deleted_at` | text nullable | soft delete |
| `created_at` | text | |
| `updated_at` | text | |
| `owner_id` | text nullable | future accounts |

**Indexes:** BS date, AD date, `(type)`, `(updated_at)`.

### 5.4 `notes`

**DECISION REQUIRED:** Separate table vs `events.notes` / type `note`.

Proposal for MVP simplicity: **no separate notes table**; use `events` with type `reminder`/`personal` and `notes` field. Add `notes` table only if freeform daily journal diverges.

### 5.5 `settings`

| Column | Type | Notes |
|--------|------|--------|
| `key` | text PK | |
| `value_json` | text | |
| `updated_at` | text | |

Known keys:

```text
numeral_system          # "devanagari" | "arabic" (MVP)
theme                   # "light" | "dark" | "system" (dark polish P1)
week_starts_on          # 0 = Sunday (locked product default)
ui_language             # "bilingual" (MVP default) | "np" | "en" (P1 switcher)
widget_show_personal    # boolean (P1; default false)
timezone_policy         # "asia_kathmandu" (locked product default; not user-facing in MVP)
```

### 5.6 `widget_state`

| Column | Type | Notes |
|--------|------|--------|
| `id` | text PK | single row `default` |
| `visible_bs_year` | integer | clamped 2000–2099 |
| `visible_bs_month` | integer | |
| `selected_bs_year` | integer nullable | |
| `selected_bs_month` | integer nullable | |
| `selected_bs_day` | integer nullable | |
| `updated_at` | text | |

**Locked:** dedicated table for native mapping (not settings-KV-only).

---

## 6. Relationships

```text
festival_definitions 1 ─── * festival_occurrences

events                 (standalone user data)
notes                  (optional)
settings               (KV)
widget_state           (singleton)
```

No FK from occurrences to engine tables (engine is not SQL).

---

## 7. Recurrence (V1 — careful)

Recurring across BS and AD is hard because anniversaries may mean:

- Same **BS** month/day every BS year (common for cultural birthdays), or
- Same **AD** month/day every Gregorian year

**Decision required before implementing recurrence:**

| Mode | Meaning |
|------|---------|
| `basis: 'bs'` | Repeat on BS month/day; AD shifts |
| `basis: 'ad'` | Repeat on AD month/day; BS shifts |

Proposed `recurrence_json`:

```json
{
  "freq": "yearly",
  "basis": "bs",
  "interval": 1,
  "until": null
}
```

Engine/helpers expand occurrences into query ranges; do not duplicate expansion logic in UI.

**Status:** Documented; implementation is P1. **DECISION REQUIRED** on default basis for birthdays.

---

## 8. Data ownership

| Data | Owner | Mutable by user |
|------|--------|-----------------|
| Festival definitions/occurrences | App-shipped seeds (+ future updates) | No (v1) |
| Events | User | Yes |
| Settings / widget state | User | Yes |
| Calendar month lengths | App-shipped domain dataset | No |

---

## 9. Seeding & updates

1. Bundle JSON/SQL seeds in the app binary.
2. On migrate/first launch, upsert festival data by stable `id`.
3. Never overwrite user `events`.
4. Attribute `source` on occurrences.
5. **VERIFY** legal/redistribution rights for holiday datasets.

---

## 10. Migrations

- All schema changes via Drizzle migrations.
- Migrations must be forward-only in production builds.
- Seed steps versioned (e.g. `seed_version` setting).

---

## 11. Future synchronization strategy

Not implemented in v1. Schema preparation:

- UUIDs on user data
- `updated_at`, `deleted_at`
- nullable `owner_id`
- Avoid irreversible destructive local shapes

Future server sketch:

```text
users, friendships, calendar_shares, events, sync_tokens
```

Conflict resolution: last-write-wins first; refine later. Local remains usable offline.

---

## 12. Query patterns

| Need | Approach |
|------|----------|
| Month markers | `WHERE bs_year=? AND bs_month=?` union personal events |
| Day detail | Query by exact BS date key |
| Widget payload | Same month query; optional denormalized cache file |

Avoid N+1 per cell.

---

## 13. Privacy

- DB file stays on device
- Widget reads limited fields
- No analytics tables by default

---

## 14. Open questions

| ID | Question | Status |
|----|----------|--------|
| Q-M01 | Separate `notes` table? | Propose no for MVP/V1 |
| Q-M02 | Always persist both BS and AD on events? | Propose yes |
| Q-M03 | Birthday default recurrence basis BS vs AD? | **DECISION REQUIRED** |
| Q-M04 | Festival years covered in first seed? | **TODO** |
| Q-M05 | Widget state table vs settings KV? | ✅ Dedicated `widget_state` |
| Q-M06 | Store `calendar_days` cache for widget? | Only if spike shows need |

---

## 15. Implementation guidance

1. Write Drizzle schema matching this doc.
2. Migration + seed pipeline with engine validation of occurrence AD/BS pairs.
3. Repositories: `FestivalRepository`, `EventRepository`, `SettingsRepository`, `WidgetStateRepository`.
4. No SQL from React components.
