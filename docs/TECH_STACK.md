# Miti — Tech Stack

> **Status:** Decisions locked (Phase 0 revision) — coding not started  
> **Depends on:** `PRD.md`, `ARCHITECTURE.md`  
> **Last updated:** 2026-10-04

---

## 1. Purpose

Document chosen technologies, why they exist, alternatives rejected, and verification items before locking versions in code.

---

## 2. Scope

Runtime, libraries, tooling, native widget stack, and dependency policy. Not API design (no backend in v1).

---

## 3. Stack summary

| Layer | Choice | Status |
|-------|--------|--------|
| Mobile framework | React Native via Expo | ✅ Locked |
| Language | TypeScript (strict) | ✅ Locked |
| Routing | Expo Router | ✅ Locked |
| UI state | Zustand | ✅ Locked |
| Local DB | SQLite + Drizzle ORM | ✅ Locked |
| Animation | React Native Reanimated | ✅ Locked |
| Notifications | Expo Notifications | ✅ Locked for V1 local scheduling (P1) |
| Styling | **Typed StyleSheet + design tokens** (no NativeWind) | ✅ Locked |
| Android widget | **Glance preferred; AppWidget fallback** | ✅ Preference locked; confirm via spike |
| Calendar math | First-party TS engine + vendored BS 2000–2099 table | ✅ Locked |
| Tests | Jest/Vitest for domain; RNTL for UI; native widget tests TBD | **TODO** finalize runners |

Package ID: `com.uplixor.miti`

---

## 4. Decisions and rationale

### TS-01 — Expo + React Native + TypeScript

**Why:** Fast iteration, strong ecosystem, path to iOS, TypeScript safety for calendar-critical code.

**Constraint:** Interactive widgets require native Android code + likely config plugins / prebuild.

### TS-02 — Expo Router

**Why:** File-based navigation fits simple Calendar / Events / Settings IA.

### TS-03 — Zustand

**Why:** Lightweight global state without Context sprawl. Not a replacement for SQLite.

### TS-04 — SQLite + Drizzle

**Why:** Offline-first persistence, typed schema, migrations, SQL control without heavy abstraction.

**VERIFY:** Expo SQLite driver compatibility with Drizzle version chosen at init time.

### TS-05 — Reanimated

**Why:** Smooth month transitions / micro-interactions without jank. Use sparingly; correctness > motion.

### TS-06 — Expo Notifications

**Why:** Local festival/reminder scheduling in V1. No cloud push until accounts/sync.

### TS-07 — Single styling system (locked)

**Decision:** React Native `StyleSheet` + centralized tokens in `src/theme/` (`colors`, `typography`, `spacing`, `radii`, `elevation`).

**Rejected:** NativeWind — avoids Tailwind/nativewind config complexity while calendar + widget remain the hard problems. Widget is native anyway and only mirrors token intent.

---

## 5. Calendar data / libraries

| Concern | Approach | Status |
|---------|----------|--------|
| BS↔AD engine | First-party `domain/calendar` | ✅ Locked |
| Month lengths | Vendored JSON for **2000–2099 only** | ✅ Locked |
| Opaque npm date lib as core | **Rejected** | ✅ Locked |
| Candidate table provenance | Inspect MIT upstream [sushilldhakal/nepali-calendar](https://github.com/sushilldhakal/nepali-calendar) 2000–2099 slice; attribute before copy | **VERIFY** |
| Festivals/holidays | Separate seeds from MoHA / verified sources — not from conversion lib | ✅ Locked |

---

## 6. Fonts

- Unicode Devanagari supporting font(s)
- No Preeti / ANSI legacy encodings

**VERIFY:** Font license for app + embedding in Android widget assets.

Candidates to evaluate (not endorsed yet): Noto Sans Devanagari, other OFL Unicode families.

---

## 7. Tooling (proposed)

| Tool | Use |
|------|-----|
| pnpm or npm | Package manager — **DECISION REQUIRED** |
| ESLint + TypeScript ESLint | Lint |
| Prettier | Format (if team wants) |
| Expo Doctor | Env health |
| Maestro / Detox (later) | E2E optional P2 |

---

## 8. Native / widget stack

| Piece | Notes |
|-------|--------|
| Expo prebuild (CNG) | Expected |
| Kotlin | Widget implementation language (typical) |
| Jetpack Glance / AppWidget | Glance preferred; AppWidget fallback — **VERIFY** via spike |
| SharedPreferences or SQLite | Cross-process state — **VERIFY** |

---

## 9. Explicitly out of stack (v1)

- Backend frameworks
- Cloud databases
- Analytics SDKs (unless explicitly approved)
- Multiple CSS-in-JS systems
- Redux unless Zustand proves insufficient (unlikely for v1)
- Legacy Nepali font stacks

---

## 10. Dependency policy

1. Every new dependency needs a one-paragraph “why” in PR/docs.
2. Prefer stdlib / existing stack before new libraries.
3. Calendar correctness libraries require test parity review.
4. Do not add network-required SDKs to core calendar path.

---

## 11. Locked / remaining

| ID | Question | Status |
|----|----------|--------|
| Q-T01 | StyleSheet + tokens (no NativeWind) | ✅ Locked |
| Q-T05 | Glance preferred; AppWidget fallback | ✅ Preference locked |
| Q-T02 | Package manager? | **DECISION REQUIRED** at scaffold |
| Q-T03 | Exact Expo SDK version at project init? | **TODO** at kickoff |
| Q-T04 | Drizzle + expo-sqlite adapter maturity? | **VERIFY** |
| Q-T06 | Domain test runner (Jest vs Vitest)? | Propose Vitest if easy; else Jest |

---

## 12. Implementation guidance

- Initialize Expo app with TypeScript + Router only after PRD/architecture review.
- Add Reanimated/Notifications when features need them, not before.
- Treat widget native spike as a stack validation milestone, not an afterthought.
