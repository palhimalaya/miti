# Miti — Coding Guidelines

> **Status:** Decisions locked (Phase 0 revision) — coding not started  
> **Depends on:** `ARCHITECTURE.md`, `PROJECT_RULES.md`, `TECH_STACK.md`  
> **Last updated:** 2026-10-04

---

## 1. Purpose

Practical coding conventions for consistent, strict, maintainable TypeScript/React Native code in Miti.

---

## 2. Scope

Style, typing, module boundaries, naming, error handling, and performance habits. Product rules remain in `PROJECT_RULES.md`.

---

## 3. Decisions

| ID | Decision |
|----|----------|
| CG-01 | TypeScript `strict` true |
| CG-02 | Prefer named exports for domain APIs |
| CG-03 | Feature folders own their UI + hooks; shared UI in `components/` |
| CG-04 | Absolute imports via configured aliases (`@/domain/...`) — **TODO** at scaffold |
| CG-05 | No `any`; prefer `unknown` + narrowing |

---

## 4. TypeScript

- Enable strict mode; avoid loosening for convenience.
- Model dates with domain types (`BsDate`, `AdDate`, `CalendarDay`), not loose `{y,m,d}` duplicates.
- Use `MIN_BS_YEAR` / `MAX_BS_YEAR` (2000–2099); never scatter range literals.
- Use discriminated unions for event types / results.
- Avoid non-null assertions unless locally proven.
- Prefer `as const` for month name tables.

```ts
// Good: domain API
const day = getDay({ year: 2083, month: 6, day: 18 })

// Bad: ad-hoc conversion in a component
const ad = guessAdFromBs(bs)
```

---

## 5. React / React Native

- Function components only.
- Keep components presentational when possible; hooks/services for logic.
- Do not put BS math in components.
- Local state by default; Zustand only for shared UI state.
- Avoid premature `useMemo` / `useCallback` unless measured or required for referential stability in lists.
- Keys for date cells: `bs:YYYY-MM-DD`.

---

## 6. Styling

- **Locked:** StyleSheet + centralized tokens in `src/theme/` only (no NativeWind).
- Consume design tokens; no random hex in deep feature code.
- Widget native styles mirror token intent, not the RN StyleSheet runtime.

---

## 7. Data access

```text
Component → hook → repository/service → SQLite / domain
```

- Repositories return plain data/DTOs.
- Map DB rows to domain-friendly types in one place.
- Batch month queries.

---

## 8. Naming

| Kind | Convention |
|------|------------|
| Files | `kebab-case.ts` or `PascalCase.tsx` for components — **pick one RN convention at scaffold and stick to it** |
| Types | `PascalCase` |
| Functions | `camelCase`, verb-led (`getMonth`, `bsToAd`) |
| BS keys | `bs:2083-06-18` |
| Constants | `UPPER_SNAKE` for true constants |

Proposed file convention: **components `PascalCase.tsx`, modules `camelCase.ts`**. **DECISION REQUIRED** only if team prefers all kebab.

---

## 9. Errors

- Domain: typed errors or `Result` (see calendar engine decision).
- UI: user-safe messages; log details in dev.
- Never swallow conversion errors and show a wrong date.

---

## 10. Internationalization

- Unicode Nepali strings in UTF-8 source/JSON.
- No Preeti.
- Store `title_en` / `title_np` in data; components choose display order from settings.

---

## 11. Performance habits

- Compute month once per navigation.
- Virtualize only if needed (month grids are small).
- Avoid recomputing festivals per cell.
- Animations via Reanimated; keep worklets light.

---

## 12. Testing expectations in code

- Domain functions pure and tested.
- Repositories testable with in-memory or test DB.
- Do not couple tests to pixel-perfect styles unless snapshot strategy agreed.

---

## 13. Git / PR hygiene (when coding begins)

- Small PRs: engine, seeds, UI, widget spike separately when possible.
- Include doc updates with architectural changes.
- Do not commit secrets.

---

## 14. Forbidden patterns

- `any` as escape hatch for dates
- Hardcoded festival lists in JSX
- Multiple competing date libraries
- Silent `try/catch` around conversion
- Giant `utils/index.ts` business logic
- Network calls on calendar render path

---

## 15. Open questions

| ID | Question | Status |
|----|----------|--------|
| Q-G01 | File naming convention final? | Propose PascalCase components |
| Q-G02 | Result vs throw in domain? | Align with `CALENDAR_ENGINE.md` |
| Q-G03 | i18n library now or hand-rolled dictionaries? | Propose dictionaries until scope grows |

---

## 16. Implementation guidance

Scaffold lint/format with the Expo TypeScript template, then enforce module boundaries via folder structure and review (optionally eslint restrictions later).
