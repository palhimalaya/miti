# Miti — Roadmap

> **Status:** Phases 0–6 implemented in repository (2026-10-04)  
> **Depends on:** `PRD.md`, `FEATURES.md`

---

## Phase status

| Phase | Goal | Status |
|-------|------|--------|
| 0 | Docs + locked decisions | ✅ |
| 1 | Vendored BS dataset + pure TS engine + fixtures | ✅ |
| 2 | SQLite/Drizzle + festival seed + repositories | ✅ |
| 3 | Expo calendar UI + settings | ✅ |
| 4 | Android widgets (S/M/L) + deep links | ✅ (via `react-native-android-widget`; requires prebuild) |
| 5 | Kathmandu today + hardening tests | ✅ |
| 6 | Personal events, notifications, dark mode, language prefs | ✅ |
| 7 | Search, backup, iOS port | ⏳ Future (P2) |
| 8 | Accounts/sync/sharing | ⏳ Future (P3) |

---

## Locked decisions (still in force)

| ID | Decision |
|----|----------|
| Q-C01 | Vendored 2000–2099 month-length dataset + own TS engine |
| Q-P01 | BS range 2000–2099 |
| Q-P02 | Today = Asia/Kathmandu |
| Q-P03 | Bilingual, Nepali-first |
| Q-C04 | Week starts Sunday |
| Q-P05 | Personal events shipped as P1 (implemented in Phase 6) |
| Q-P06 | Large widget P1 (implemented) |
| Q-A01 | Shared dataset + golden fixtures; widget must not invent math |
| Q-A02 | StyleSheet + design tokens |
| Q-W01 | Interactive Android widgets (library + shared domain data) |

---

## Widget implementation note

MVP widgets use `react-native-android-widget` so interactive prev/next/select can ship with Expo CNG. Date math for widget payloads still comes from the **same TypeScript domain engine + vendored dataset**, and golden fixtures remain the parity contract.

A future iteration may replace the widget renderer with pure Kotlin/Glance reading Android assets of the same JSON (stronger reboot/no-JS autonomy). Until then, a development build is required (`expo prebuild` / `expo run:android`); Expo Go is insufficient for widgets.

---

## Remaining VERIFY / follow-ups

- Broader festival years beyond 2026 AD seed (MoHA cross-check per BS year)
- Physical-device widget reboot QA
- Devanagari font packaging polish on all OEM launchers
- Pure Kotlin widget renderer (optional hardening)

---

## Commands

```bash
npm test
npm run typecheck
npm start
npx expo prebuild --platform android
npx expo run:android
```
