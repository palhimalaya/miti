# Miti — Features

> **Status:** Decisions locked (Phase 0 revision) — coding not started  
> **Depends on:** `PRD.md` (priorities win on conflict)  
> **Last updated:** 2026-10-04

---

## 1. Purpose

Inventory product features with priorities, dependencies, and acceptance notes so implementation does not expand silently beyond the PRD.

---

## 2. Scope

Feature list for MVP, V1, and later. Not API specs or pixel designs.

---

## 3. Priority legend

| Priority | Meaning |
|----------|---------|
| P0 | MVP must-have |
| P1 | V1 important |
| P2 | Later |
| P3 | Future / optional |

---

## 4. Feature inventory

### 4.1 Calendar core

| ID | Feature | Priority | Depends on | Notes |
|----|---------|----------|------------|--------|
| FE-CAL-01 | BS month grid | P0 | Engine | Variable month lengths |
| FE-CAL-02 | AD under each BS day | P0 | Engine | Secondary visual |
| FE-CAL-03 | BS↔AD conversion | P0 | Engine | Domain only |
| FE-CAL-04 | Prev/next month | P0 | FE-CAL-01 | Instant |
| FE-CAL-05 | Today action | P0 | Timezone policy | |
| FE-CAL-06 | Date selection | P0 | | |
| FE-CAL-07 | Today indicator | P0 | Distinct from selected | |
| FE-CAL-08 | Selected date detail header | P0 | Bilingual long form | |
| FE-CAL-09 | Nepali numerals display | P0 | Settings | Default Devanagari for BS |
| FE-CAL-10 | Weekday header Sun→Sat | P0 | Locked Sunday start | Nepali-first labels |
| FE-CAL-11 | Bilingual Nepali-first chrome | P0 | PRD Q-P03 | Locked MVP default |
| FE-CAL-12 | Range clamp 2000–2099 BS | P0 | Engine constants | |

### 4.2 Festivals & holidays

| ID | Feature | Priority | Depends on | Notes |
|----|---------|----------|------------|--------|
| FE-FEST-01 | Structured festival data | P0 | Dataset | No invented dates |
| FE-FEST-02 | Month indicators on cells | P0 | FE-FEST-01 | Subtle |
| FE-FEST-03 | Day detail occasions list | P0 | FE-FEST-01 | |
| FE-FEST-04 | Major festivals seed set | P0 | Verified source | Dashain, Tihar, Holi, Teej, Buddha Jayanti, Maha Shivaratri, Janai Purnima, Gaijatra, Indra Jatra, Maghe Sankranti, Chhath, national days, etc. — only with real dates |
| FE-FEST-05 | Expanded coverage | P1 | | More years/events |
| FE-FEST-06 | Festival themes | P2 | Design | |

### 4.3 Personal events & notes

| ID | Feature | Priority | Notes |
|----|---------|----------|--------|
| FE-EVT-01 | Create/edit/delete personal events | P1 | **Out of MVP** (locked) |
| FE-EVT-02 | Types: personal, reminder, birthday, anniversary | P1 | |
| FE-EVT-03 | Notes on date | P1 | Prefer field on event |
| FE-EVT-04 | Recurrence BS basis | P1 | **DECISION REQUIRED** model |
| FE-EVT-05 | Recurrence AD basis | P1 | |
| FE-EVT-06 | Show personal events in day detail | P1 | |
| FE-EVT-07 | Events tab list | P1 | Upcoming |

### 4.4 Widget

| ID | Feature | Priority | Notes |
|----|---------|----------|--------|
| FE-WDG-01 | Small widget | P0 | Today + highlight |
| FE-WDG-02 | Medium widget | P0 | Month + nav + select |
| FE-WDG-03 | Large widget | P1 | Full month + detail |
| FE-WDG-04 | Prev/next month on widget | P0 | Medium+ |
| FE-WDG-05 | Select date on widget | P0 | |
| FE-WDG-06 | Selected info on widget | P0 | Summary |
| FE-WDG-07 | Deep link to app | P0 | |
| FE-WDG-08 | App↔widget state sync | P0 | |
| FE-WDG-09 | iOS widgets | P3 | After iOS app |

### 4.5 Settings

| ID | Feature | Priority | Notes |
|----|---------|----------|--------|
| FE-SET-01 | Basic settings screen | P0 | |
| FE-SET-02 | Numeral system | P0/P1 | |
| FE-SET-03 | Theme light/dark/system | P1 | |
| FE-SET-04 | Week start | P1 | If exposed |
| FE-SET-05 | Widget privacy toggles | P1 | Personal titles |
| FE-SET-06 | Language preference (Bilingual / Np / En) | P1 | MVP ships Bilingual default only |

### 4.6 Notifications

| ID | Feature | Priority | Notes |
|----|---------|----------|--------|
| FE-NOT-01 | Local: festival tomorrow | P1 | Expo Notifications |
| FE-NOT-02 | Local: personal reminder | P1 | |
| FE-NOT-03 | Local: birthday tomorrow | P1 | |
| FE-NOT-04 | Cloud push | P3 | Needs accounts |

### 4.7 Search

| ID | Feature | Priority | Notes |
|----|---------|----------|--------|
| FE-SRCH-01 | Search festivals/events/dates | P2 | After core stable |

### 4.8 Social / sync

| ID | Feature | Priority | Notes |
|----|---------|----------|--------|
| FE-SYNC-01 | Accounts | P3 | |
| FE-SYNC-02 | Cloud sync | P3 | |
| FE-SYNC-03 | Friend sharing | P3 | |
| FE-SYNC-04 | Shared calendars | P3 | |

### 4.9 Platform

| ID | Feature | Priority | Notes |
|----|---------|----------|--------|
| FE-PLT-01 | Android app | P0 | |
| FE-PLT-02 | Offline core | P0 | |
| FE-PLT-03 | iOS app | P2/P3 | Portable architecture |
| FE-PLT-04 | Accessibility pass | P1 | |

---

## 5. MVP cut line (locked)

```text
MITI MVP
│
├── Calendar (BS grid, AD under each day, Sun→Sat, nav, today, selection, detail)
├── Festivals (structured, verified dates only)
├── Offline (SQLite, no network dependency)
├── Widget (small P0, medium P0, nav, select, festival info, deep link)
└── Settings (numeral preference + basic preferences)
```

**P1 (not MVP):** personal events, recurrence, notifications, dark mode polish, large widget, expanded festival data, language mode switcher beyond bilingual default.

Everything **P0** above is in MVP. Personal events are **hard P1**.

---

## 6. Acceptance mapping

| Feature cluster | Primary acceptance doc |
|-----------------|------------------------|
| Calendar core | `CALENDAR_ENGINE.md`, `TESTING.md` |
| Festivals | `DATA_MODEL.md`, PRD quality bar |
| Widget | `WIDGET_SPEC.md` |
| Design | `DESIGN_SYSTEM.md` |

---

## 7. Remaining items

Product decisions for language/timezone/range/widget sizes/personal events are **locked** (see PRD). Remaining: festival MVP seed curation (Q-P04), recurrence defaults (V1), Glance spike verification.

---

## 8. Implementation guidance

Implement in dependency order:

```text
Engine → Seeds/DB → Calendar UI → Settings → Widget spike → Widget complete → Events → Notifications → Search
```
