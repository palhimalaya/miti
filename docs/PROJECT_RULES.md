# Miti — Project Rules (AI Coding Agents & Humans)

> **Status:** Decisions locked (Phase 0 revision) — coding not started  
> **Depends on:** All docs; **PRD is product truth**  
> **Last updated:** 2026-10-04

---

## 1. Purpose

Hard rules for anyone (including AI coding agents) working on Miti. Violating these creates calendar incorrectness, widget drift, or scope creep.

---

## 2. Scope

Process, architecture, data integrity, dependency, and documentation behavior. Coding style details live in `CODING_GUIDELINES.md`.

---

## 3. Before writing code

1. Read relevant docs: at minimum `PRD.md`, `ARCHITECTURE.md`, `CALENDAR_ENGINE.md`, `WIDGET_SPEC.md` for calendar/widget work.
2. Do not begin implementation until documentation for the touched area is accepted or explicitly waived by the human owner.
3. Identify ambiguities; surface `DECISION REQUIRED` / `VERIFY` items rather than guessing silently.
4. If requirements conflict, prioritize:

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

## 4. Agent behavioral rules

1. **Read documentation before coding.**
2. **Never modify architecture without explaining why** and updating docs in the same change.
3. **Never invent festival dates.**
4. **Never implement calendar conversion based on assumptions** or copied unverified snippets.
5. **Never duplicate calendar logic** in UI, widgets, or random utils.
6. **Never add dependencies unnecessarily**; document why if added (`TECH_STACK.md`).
7. **Keep domain logic independent from UI.**
8. **Preserve offline-first behavior** — core flows must not require network.
9. **Add tests for calendar-domain changes.**
10. **Update documentation when architectural decisions change.**
11. **Keep components small and composable.**
12. **Prefer TypeScript strict typing.**
13. **Avoid `any`.**
14. **Avoid premature abstraction.**
15. **Do not create a backend unless explicitly requested.**
16. **Do not break Android widget functionality** while modifying calendar logic — update shared contracts/fixtures.
17. **Treat the widget as a first-class product surface.**
18. **Verify both BS and AD representations** whenever changing date-related functionality.

---

## 5. Architectural rules

### Rule 1 — No conversion in UI

UI components must not implement BS/AD conversion logic.

### Rule 2 — Framework-free domain

Calendar domain logic must remain free of React, React Native, Zustand, and SQLite.

### Rule 3 — No SQLite from components

Components must not manipulate SQLite directly. Use repositories/services.

### Rule 4 — Structured festivals

Festival information must come from structured data.

### Rule 5 — Single calculation source

Do not duplicate date calculations.

### Rule 6 — Minimal global state

Avoid global state unless multiple distant consumers need it.

### Rule 7 — Documented dependencies only

Do not introduce a dependency without documenting why.

### Rule 8 — Simplicity first

Prefer simple solutions over unnecessary abstractions.

### Rule 9 — No backend in v1

No API server unless explicitly required by the human owner.

### Rule 10 — Offline functional

The application must remain functional offline for core calendar features.

### Rule 11 — Widget parity

Native widget date math/data must match domain fixtures. Drift is a blocker. Widget must not depend on the RN JS runtime for conversion.

### Rule 12 — PRD priority

Do not implement P2/P3 features before P0 is solid unless the owner redirects. Personal events and large widget are **P1**.

### Rule 13 — Locked calendar product rules

- Supported BS range is **2000–2099** via `MIN_BS_YEAR` / `MAX_BS_YEAR`.
- “Today” is **`Asia/Kathmandu`** (adapter outside pure engine).
- Week starts **Sunday**.
- UI is **bilingual, Nepali-first**.
- Vendor month-length data; do not use an opaque third-party lib as the core engine.
- Keep calendar math dataset separate from festival/holiday sources.

---

## 6. Data integrity rules

- Do not ship approximate BS month lengths.
- Seed AD/BS pairs must validate against the engine in tests.
- Invalid dates must error, not clamp quietly (unless a documented UX convenience API exists separately).
- User data must survive app updates via migrations.

---

## 7. Documentation rules

- PRD changes for scope/priority first.
- Mark unknowns as `TODO`, `DECISION REQUIRED`, or `VERIFY`.
- Do not invent decisions silently in code comments only.

---

## 8. Security & privacy rules

- No analytics unless explicitly approved.
- No unnecessary permissions.
- No location permission without a real feature need.
- Widget must not expose sensitive note bodies by default.

---

## 9. Review checklist (agent self-check)

Before finishing a task:

- [ ] Docs still accurate?
- [ ] Domain tests added/updated for date changes?
- [ ] Widget contracts considered?
- [ ] Offline path intact?
- [ ] No new undocumentated dependency?
- [ ] No festival dates invented?
- [ ] BS and AD both verified in UI/widget paths touched?

---

## 10. Open questions

None beyond those tracked in other docs; this file binds behavior around them.
