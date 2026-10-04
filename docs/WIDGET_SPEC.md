# Miti — Android Widget Specification

> **Status:** Implemented for MVP via `react-native-android-widget` (Expo prebuild required). Pure Kotlin/Glance renderer remains an optional hardening path.  
> **Risk level:** Highest (platform + product)  
> **Depends on:** `PRD.md`, `ARCHITECTURE.md`, `CALENDAR_ENGINE.md`  
> **Last updated:** 2026-10-04

---

## 1. Purpose

Define the Android home-screen widget as a **first-class product surface**: what it shows, how users interact with it, how it shares calendar truth with the React Native app, and what must be verified before implementation.

---

## 2. Scope

### In scope

- Android widget sizes (small / medium / large)
- Interaction requirements
- Data shared with the app
- Native technology approach (Glance preferred, AppWidget fallback)
- B-lite shared dataset + golden fixtures
- Sync behavior and deep links
- MVP vs V1 widget scope
- Testing expectations

### Out of scope

- iOS widgets (future)
- Server-driven widget content
- Implementing RN “fake widgets” that cannot use system widget APIs
- Making the widget call the React Native JS runtime for date math

---

## 3. Product intent

Users must interact with the calendar **without opening the application** for core browsing actions.

Required interactions (P0 — small/medium as applicable):

```text
Previous month
Next month
Select date
View selected date information
```

The widget is **not** a static image or marketing screenshot.

---

## 4. Decisions

### W-01 — Platform

**Decision:** Android first (MVP). iOS later (P2/P3).

### W-02 — First-class surface / B-lite (locked)

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

```text
                 SOURCE DATA
                     │
             BS month-length table
              (2000–2099, vendored)
                     │
          ┌──────────┴──────────┐
          ↓                     ↓
    TypeScript engine       Kotlin widget
          │                     │
          └──────────┬──────────┘
                     ↓
               Golden fixtures
                     ↓
                 MUST MATCH
```

### W-03 — Native rendering

**Decision:** Use native Android widget APIs. Do not force React Native to render functionality that requires AppWidget/Glance APIs.

### W-04 — MVP sizes (locked)

| Size | Priority | Notes |
|------|----------|--------|
| Small | **P0** | Today-focused |
| Medium | **P0** | Month grid + nav + select — primary interactive surface |
| Large | **P1** | Full month + richer detail; does not block MVP |

### W-05 — Toolkit: Glance preferred, AppWidget fallback (spike)

**Decision (locked preference):**

> **Jetpack Glance is the preferred implementation; classic AppWidget/RemoteViews is the compatibility fallback.**

Do not permanently lock Glance until a spike proves P0 interactions work.

Spike must answer:

```text
Can Glance provide:

✓ clickable previous month
✓ clickable next month
✓ clickable date cells
✓ selected-date state
✓ 7-column calendar grid
✓ Nepali Unicode rendering
✓ acceptable widget size behavior
✓ reboot/offline behavior
✓ Expo CNG integration
✓ deep links
```

If yes → use Glance.  
If any P0 requirement is blocked → fall back to AppWidget/RemoteViews.

**Do not spend weeks debating this theoretically — build the smallest spike.**

---

## 5. Shared architecture

```text
Shared Calendar Dataset + Shared App State
        │
   ┌────┴────┐
   │         │
React Native Android Widget
   │         │
   └────┬────┘
        │
   Golden fixtures must match
```

### Shared data (minimum)

| Data | Owner | Notes |
|------|--------|--------|
| Visible BS month (y/m) | Shared preference / SQLite / widget_state | Widget navigates independently but reconciles |
| Selected BS date key | Shared | `bs:YYYY-MM-DD` |
| Today | Computed | **`Asia/Kathmandu`** civil date (same as app) |
| Festival markers for visible month | SQLite or cached payload | Precompute per month recommended |
| Numeral preference | Settings | Widget respects if feasible |
| Month-length table | Vendored asset | Same 2000–2099 bytes/content as TS engine |

### Independence requirement

Widget must remain useful after reboot **without** waiting for JS bundle:

- Correct dual dates for the visible month
- Month navigation across BS 2000–2099 using native tables
- Festival markers from on-device data (not network)

---

## 6. Size specifications

### 6.1 Small widget (P0)

**Job:** Answer “What Nepali date is today?” plus one highlight.

```text
असोज २०८३

१८
Oct 4

✦ घटस्थापना
```

Content:

- Current Nepali month/year
- Dominant BS day
- Secondary English date
- Major festival/holiday line if present (truncated)
- Tap body → open app on that date

### 6.2 Medium widget (P0)

**Job:** Browse a month and select a day from the home screen — the killer interactive surface.

Content:

- BS month/year + AD month/year context (bilingual Nepali-first)
- Previous / next month controls
- Grid with BS + AD per cell (Sunday → Saturday)
- Festival indicators
- Current day + selected day distinction
- Selected date summary line (festival title)

Interactions:

- Prev month / next month (no app open)
- Select date
- Show selected date summary on widget
- Deep link for full detail in app

### 6.3 Large widget (P1)

**Job:** Full month + richer selected-date detail without opening app.

Same interactions as medium, denser detail. Personal event titles only when P1 exists and privacy setting allows; never note bodies by default.

---

## 7. Visual rules (widget)

Aligned with `DESIGN_SYSTEM.md`:

- Nepali-first hierarchy preserved at small sizes
- Bilingual where space allows
- Do not overcrowd cells; indicators subtle
- Readable contrast
- Unicode Devanagari only — **VERIFY** font embedding on Glance/RemoteViews

---

## 8. Interaction & state machine

### States

```text
visibleMonth: { bsYear, bsMonth }   // clamped to 2000–2099
selectedDate: BsDate | null         // null => default today when in month
today: CalendarDay                  // Asia/Kathmandu
```

### Actions

| Action | Effect |
|--------|--------|
| `NEXT_MONTH` | Increment BS month with year rollover (within range) |
| `PREV_MONTH` | Decrement BS month with year rollover (within range) |
| `SELECT_DATE(bs)` | Set selectedDate; refresh detail |
| `OPEN_APP(bs)` | Deep link into RN calendar |
| `REFRESH` | Recompute today + reload markers |

### Sync with app

| Event | Behavior |
|-------|----------|
| User changes month in widget | Persist shared visible month; app reads on resume |
| User selects date in widget | Persist selected key; app opens/resumes to it |
| User changes month in app | Update shared state; widget refreshes on next update pass |
| Festival DB seed updates | Trigger widget data refresh |

**Conflict policy:** Last write wins for visible month/selection; stamp `updated_at` on writes.

---

## 9. Deep linking

Proposed:

```text
miti://calendar?bs=2083-06-18
```

**TODO:** Finalize scheme with Expo Router when scaffolding begins.

---

## 10. Expo / native integration constraints

Expected needs:

- Custom native Android code (Glance or AppWidget)
- Expo config plugin / CNG prebuild
- Bridge or shared storage for widget_state / settings
- Packaging BS month-length tables in Android assets (from same source as TS)

**VERIFY (spike):**

1. Expo SDK + Glance minSdk compatibility  
2. Whether `expo-sqlite` DB file is readable from widget process; if not, mirror festival markers / state  
3. Process isolation: native must not assume RN is alive  
4. Midnight Kathmandu rollover for “today”  
5. Devanagari font rendering  

---

## 11. Privacy on the home screen / lock screen

- Public festivals/holidays: OK to show  
- Personal events: P1 feature; when added, titles optional behind setting  
- Never show note bodies on widget by default  

**Default when P1 lands:** hide personal event titles on widget unless user enables them.

---

## 12. MVP acceptance criteria (widget)

1. User can add small and medium widgets.
2. Small widget shows correct BS + AD for Kathmandu today.
3. Medium widget shows dual-date month grid (Sunday start) for a BS month in 2000–2099.
4. Prev/next month updates without opening the app.
5. Selecting a date updates selected styling + summary on widget.
6. Tapping through opens the app on that date.
7. Works offline.
8. After reboot, widget still shows correct dates **without JS**.
9. Festival markers match app for the same month.
10. Native conversion matches TS golden fixtures.

---

## 13. Testing requirements

See also `TESTING.md`.

| Area | Cases |
|------|--------|
| Initial state | Current Kathmandu month/today |
| Navigation | Month boundaries, year rollover, range clamps |
| Selection | Select day, change month |
| Events | Festival render / truncation |
| Sync | App↔widget selected date + month |
| Offline / reboot | No JS required for basic render + nav |
| Parity | Golden dates match TS engine |

Physical device testing required before calling widget “done”.

---

## 14. Implementation guidance

1. Complete calendar engine + golden fixtures first (or in parallel with a trivial widget hello-world).
2. Spike Glance against the checklist in W-05.
3. Package shared 2000–2099 tables into Android assets.
4. Implement native month render + actions + persisted state.
5. Connect festival markers + deep links.
6. Polish to design tokens/intent.
7. Large widget after MVP (P1).

### Forbidden

- Widget that only opens the app and shows a bitmap
- Kotlin calling TypeScript/RN bridge for date math
- Untested divergent conversion code
- Blocking MVP on large widget
- Network dependency for widget dates

---

## 15. Locked decisions

| ID | Decision | Status |
|----|----------|--------|
| Q-W01 | Glance preferred; AppWidget fallback after spike | ✅ Preference locked; toolkit confirmed by spike |
| Q-W02 | B-lite shared dataset + golden fixtures; no JS runtime dependency | ✅ Locked |
| Q-W03 | Large widget = P1 | ✅ Locked |
| Q-W08 | Independent widget month with shared sync | ✅ Locked |

## 16. Remaining verification items

| ID | Question | Status |
|----|----------|--------|
| Q-W04 | Widget read path for Expo SQLite vs mirrored store | **VERIFY** |
| Q-W05 | Devanagari font in Glance/RemoteViews | **VERIFY** |
| Q-W06 | Midnight Asia/Kathmandu today-rollover | **TODO** in spike |
| Q-W07 | Personal event titles on widget default | Locked default = hidden (P1) |
| Q-W09 | Expo CNG/config plugin wiring | **VERIFY** |

---

## 17. Related documents

- `PRD.md` — widget as P0 product requirement  
- `ARCHITECTURE.md` — B-lite locked wording  
- `CALENDAR_ENGINE.md` — parity contracts + 2000–2099  
- `DESIGN_SYSTEM.md` — visual tokens  
- `DATA_MODEL.md` — persisted selection/settings  
- `TESTING.md` — widget test plan  
