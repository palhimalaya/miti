# Miti — Product Requirements Document

> **Status:** Decisions locked (Phase 0 revision) — coding not started  
> **Role:** Source of truth for product scope and priorities  
> **Package ID:** `com.uplixor.miti`  
> **Product name:** Miti  
> **Last updated:** 2026-10-04

---

## 1. Purpose

This PRD defines what Miti is, who it is for, what must ship first, and what must wait. All other documents refine implementation detail; when they conflict with this PRD on product intent or priority, **this PRD wins** until explicitly revised.

---

## 2. Scope

### In scope (product definition)

- Nepali-first dual calendar (Bikram Sambat + Gregorian)
- Offline-first personal use on Android (initially)
- Festivals, public holidays, cultural/religious occasions from structured data
- Polished calendar UI and interactive Android home-screen widget
- Local personal events/notes (**P1 / V1** — not MVP)
- Architecture that can later support friends, sync, accounts, and iOS

### Out of scope (until explicitly promoted)

- Backend, accounts, cloud sync
- Social/friend sharing
- Push notifications from a server
- Search as a primary feature before core calendar is stable
- Multiple competing calendar systems beyond BS + AD
- Invented or approximate festival dates

---

## 3. Vision

Miti is a **beautiful, offline-first Nepali calendar** for personal use first, with a path to friends and eventual public release.

It is **not** a bare date-conversion utility. It should feel like a modern, premium Nepali calendar: warm, minimal, culturally recognizable, and fast.

### Core experience

> Nepali date first, English date directly underneath.

Example calendar cell:

```text
┌─────────┐
│   १८    │  ← BS date (dominant)
│    4    │  ← AD date (secondary)
│    •    │  ← event/festival indicator
└─────────┘
```

---

## 4. Target users

| Phase | Users | Notes |
|-------|--------|--------|
| Personal / MVP | Individual (initially the maker and close circle) | Local-only, no account |
| Friends | Small trusted group | Future sync/sharing |
| Public | General Nepali / diaspora users | Store release readiness |

### Primary jobs-to-be-done

1. See **today’s Nepali date** instantly (app + widget).
2. Browse months with **BS dominant, AD always present**.
3. Know **festivals and holidays** on a given day without searching the web.
4. Glance at the home screen without opening the app (**interactive widget**).
5. Later: keep personal events/reminders on the same calendar.

---

## 5. Product principles

| Principle | Meaning |
|-----------|---------|
| Nepali-first | BS hierarchy wins visually and in copy |
| Dual-calendar | BS and AD stay clearly linked everywhere |
| Offline-first | Core calendar works with zero network |
| Beautiful | Modern premium UI; subtle cultural cues, not kitsch |
| Fast | Month nav and selection feel instantaneous |
| Data-driven | Festivals/holidays from structured data, not UI hardcoding |
| Extensible | Widget, sync, accounts, iOS possible without rewrite |

### Priority when requirements conflict

```text
Correctness
> Data integrity
> Offline reliability
> UX
> Maintainability
> Performance
> Convenience
```

---

## 6. Platform

| Item | Decision | Status |
|------|----------|--------|
| Initial platform | Android | Locked |
| App stack | React Native, Expo, TypeScript, Expo Router | Locked |
| Portability | Keep domain + data portable for iOS later | Locked |
| Widget (MVP) | Android interactive home-screen widget (small + medium) | Locked |
| Styling | Typed StyleSheet + design tokens (not NativeWind) | Locked |
| UI language | Bilingual default, Nepali-first hierarchy | Locked |
| Week start | Sunday → Saturday (`weekday.index` 0 = Sunday) | Locked |
| “Today” timezone | Always `Asia/Kathmandu` civil date | Locked |
| BS support range | **2000–2099 BS** | Locked |
| Personal events | **P1** (not MVP) | Locked |
| Large widget | **P1** (not MVP) | Locked |

**VERIFY (not a product decision):** Expo CNG / config plugin workflow required for Glance or AppWidget — see `WIDGET_SPEC.md`.

---

## 7. Priority system

| Priority | Meaning |
|----------|---------|
| **P0** | Must have for MVP — ship-blocking |
| **P1** | Important for V1 soon after MVP |
| **P2** | Later / polish / deferred features |
| **P3** | Future / optional / speculative |

---

## 8. MVP (P0)

Small enough to finish; correctness and dual-date UX over feature breadth.

| ID | Requirement | Notes |
|----|-------------|--------|
| MVP-01 | BS month calendar grid | Variable month lengths handled correctly |
| MVP-02 | AD date under each BS date | Always associated; secondary visual weight |
| MVP-03 | BS ↔ AD conversion via domain engine | Pure module; no UI conversion logic |
| MVP-04 | Previous / next month navigation | Instant feel |
| MVP-05 | Today action | Based on `Asia/Kathmandu`; jump to current BS month + highlight today |
| MVP-06 | Date selection + detail panel | Selected date shows BS + AD + occasions |
| MVP-07 | Current date indicator | Distinct from selected date |
| MVP-08 | Festival/holiday info for selected day | From structured bundled data (gov sources for holidays) |
| MVP-09 | Offline operation | No network required for core flows |
| MVP-10 | Local SQLite persistence | Settings + seed data; schema sync-ready |
| MVP-11 | Beautiful calendar UI | Per `DESIGN_SYSTEM.md`; bilingual Nepali-first |
| MVP-12 | Basic settings | Numeral preference + basic preferences |
| MVP-13 | Android widget (first-class) | Small + medium interactive; large is P1 |

**Locked MVP deferrals (P1):** Personal events/notes, recurrence, local notifications, dark mode polish, large widget, expanded festival coverage beyond the curated MVP seed.

### MVP non-goals

- Accounts / API / sync
- Search
- Cloud push
- Friend sharing
- iOS app or iOS widgets
- Perfect festival coverage for every minor observance worldwide

---

## 9. V1 (P1) — immediately after MVP

| ID | Requirement | Priority |
|----|-------------|----------|
| V1-01 | Personal events (create/edit/delete) | P1 |
| V1-02 | Notes / reminders on a date | P1 |
| V1-03 | Event types: personal, reminder, birthday, anniversary | P1 |
| V1-04 | Large widget size (if not in MVP) | P1 |
| V1-05 | Local notifications (festival/event tomorrow) | P1 |
| V1-06 | Numeral preference (Nepali / Arabic) if not fully in MVP | P1 |
| V1-07 | Dark mode polish | P1 |
| V1-08 | Accessibility pass (labels, contrast, targets) | P1 |
| V1-09 | Broader festival/holiday dataset coverage | P1 |
| V1-10 | Recurring personal events (AD and/or BS) | P1 — dual recurrence model still open for V1 design |

---

## 10. Later / Future

### P2 — later

| ID | Feature |
|----|---------|
| F-01 | Search (Nepali date, English date, festival, event, person) |
| F-02 | Festival-specific seasonal themes |
| F-03 | Richer event metadata / attachments (local) |
| F-04 | Export/import local backup |
| F-05 | iOS app port |
| F-06 | iOS widgets |

### P3 — future / optional

| ID | Feature |
|----|---------|
| F-10 | Accounts and authentication |
| F-11 | Cloud synchronization |
| F-12 | Friend invitations / shared calendars |
| F-13 | Shared events + conflict resolution |
| F-14 | Server push notifications |
| F-15 | Additional calendar systems |
| F-16 | Public store release polish (legal, privacy policy, store assets) |

---

## 11. Feature details (product-level)

### 11.1 Calendar UI

Must include:

- Nepali month/year (primary)
- English month/year context (secondary)
- Previous / next month
- Today
- Calendar grid with BS + AD per cell
- Selected date state
- Festival/event indicators (subtle)
- Selected-date detail: occasions, holiday status, personal events (when available), notes

Selected date example:

```text
१८ असोज २०८३
Sunday · October 4, 2026

✦ घटस्थापना
Ghatasthapana
```

### 11.2 Language & numerals

**Locked:** Bilingual UI, Nepali-first hierarchy (not Nepali-only and not English-only).

Example:

```text
असोज २०८३
October 2026

१८
4
```

Selected date:

```text
१८ असोज २०८३
Sunday · October 4, 2026
```

Festival:

```text
घटस्थापना
Ghatasthapana
```

- Prefer Nepali (Devanagari) numerals for BS dates in default UI.
- Support user preference for Nepali vs Arabic numerals where appropriate.
- Later settings may offer Bilingual / नेपाली / English; **MVP default = Bilingual**.
- **Never** use legacy encodings (Preeti, etc.); Unicode only.

### 11.3 Festivals and holidays

Types (product taxonomy):

```text
festival | holiday | religious | cultural | national | personal | reminder | birthday | anniversary
```

Rules:

- Do **not** invent dates.
- Prefer separating **definition** from **occurrence** where useful.
- UI consumes structured data only.
- **Separate concerns:** calendar mathematics (month-length dataset) ≠ holiday/festival schedules (official Nepal government / verified cultural sources). Do not mix those pipelines.

**VERIFY:** Curate MVP holiday/festival occurrences from official sources (e.g. Ministry of Home Affairs public-holiday schedules) and other verified cultural calendars — never invent dates.

### 11.4 Widget

First-class surface, not a screenshot of the app.

Required interactions (product intent):

- Previous month
- Next month
- Select date
- View selected date information

Sizes: small, medium, large (as practical). Details in `WIDGET_SPEC.md`.

### 11.5 Navigation

Initial tabs/screens:

```text
Calendar | Events | Settings
```

Calendar is primary. Do not overcomplicate navigation in MVP/V1.

### 11.6 Privacy (v1 assumptions)

- Personal data stays on-device
- No account required
- No analytics unless explicitly added later
- Minimal permissions
- No location permission unless a future feature truly needs it

---

## 12. Quality bar

Prioritize, in order:

1. Correctness of calendar data  
2. Excellent date hierarchy (BS > AD)  
3. Smooth navigation  
4. Beautiful visual design  
5. Offline reliability  
6. Widget quality  
7. Maintainable architecture  

Do not ship a generic CRUD shell that happens to show dates.

---

## 13. Success criteria (MVP)

MVP is accepted when:

1. A user can browse months offline and always see correct BS + AD pairing.
2. Today is correct for the `Asia/Kathmandu` civil date (not device timezone).
3. Selecting a date shows structured festival/holiday info when present.
4. Settings persist locally.
5. Android widget shows current/selected month dual dates and supports month nav + date select without requiring a full app open for those actions.
6. Calendar conversion has automated tests for known dates and boundaries.
7. Visual hierarchy clearly reads as Nepali-first.

---

## 14. Locked product decisions

| ID | Decision | Status |
|----|----------|--------|
| Q-P01 | MVP BS range = **2000–2099** | ✅ Locked |
| Q-P02 | “Today” = **`Asia/Kathmandu`** civil date | ✅ Locked |
| Q-P03 | UI language = **bilingual, Nepali-first** (MVP default) | ✅ Locked |
| Q-P05 | Personal events = **P1** (out of MVP) | ✅ Locked |
| Q-P06 | Large widget = **P1**; small+medium = **P0** | ✅ Locked |

## 15. Remaining product/verification items

| ID | Question | Status |
|----|----------|--------|
| Q-P04 | Which festival/holiday list is in MVP vs V1? | **TODO** — curate from MoHA + verified sources |
| Q-P07 | Exact Expo/native plugin path for widget | **VERIFY** via spike |

---

## 16. Related documents

| Doc | Role |
|-----|------|
| `ARCHITECTURE.md` | System structure, boundaries |
| `CALENDAR_ENGINE.md` | BS/AD domain module |
| `WIDGET_SPEC.md` | Android widget product + tech |
| `DATA_MODEL.md` | SQLite / entities |
| `DESIGN_SYSTEM.md` | Visual language |
| `FEATURES.md` | Feature inventory mapped to priorities |
| `ROADMAP.md` | Sequencing |
| `PROJECT_RULES.md` | Agent/engineering constraints |
| `TECH_STACK.md` | Dependencies and rationale |
| `CODING_GUIDELINES.md` | Code conventions |
| `TESTING.md` | Test strategy |

---

## 17. Change control

- Product priority changes update this PRD first.
- Architecture/docs that diverge must note the PRD section they supersede and why.
- Silent scope expansion is not allowed.
