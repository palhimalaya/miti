# Miti

Nepali-first offline calendar for Android (`com.uplixor.miti`).

BS date is primary; Gregorian date sits directly underneath. Today is always the civil date in **Asia/Kathmandu**.

## Status

Phases 1–6 implemented in-repo:

| Phase | Deliverable |
|-------|-------------|
| 0 | Product/architecture docs |
| 1 | Pure TS calendar engine (BS 2000–2099) + golden fixtures |
| 2 | SQLite/Drizzle + festival seed + repositories |
| 3 | Expo Router app: Calendar / Events / Settings |
| 4 | Android widgets (small/medium/large) via `react-native-android-widget` |
| 5 | Kathmandu today adapter + domain/adapter tests |
| 6 | Personal events, local notifications, dark mode, language prefs, large widget |

Not in this build (future): cloud sync, accounts, friend sharing, iOS widgets, search-first UX.

## Commands

```bash
npm install
npm test
npm run typecheck
npm start
```

Android native builds require **JDK 17** (JDK 25 breaks CMake/Gradle) and a
dev build for widgets (not Expo Go):

```bash
export JAVA_HOME=/home/cosine/.jdks/temurin-17   # or your JDK 17 path
export PATH="$JAVA_HOME/bin:$PATH"

npx expo prebuild --platform android
npx expo run:android
```

`react-native-android-widget` must be **≥ 0.22** for React Native 0.86
(`CSSBackgroundDrawable` was removed from RN core).

## Architecture

```text
src/domain/calendar     # pure BS↔AD engine
src/db                  # SQLite schema, seed, repositories
src/features            # calendar UI, widget handlers
src/services            # Kathmandu today, notifications, bootstrap
app/                    # Expo Router screens
docs/                   # PRD + architecture source of truth
```

## Attribution

- Calendar month lengths: `third_party/sushill-nepali-calendar/`
- Festival seed: `src/data/festivals/ATTRIBUTION.md`
