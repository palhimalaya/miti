# Miti — Widget Gallery & Theme Spec

> **Status:** Theme locked for MVP (Midnight). Gallery variants are future.  
> **Depends on:** `DESIGN_SYSTEM.md`, `WIDGET_SPEC.md`  
> **Last updated:** 2026-10-05

---

## 1. Core rule (locked)

> **Miti should feel Nepali through typography, hierarchy, color restraint, and subtle cultural references — not through decoration density.**

Level 3 decoration (photos, quotes, motifs, gradients) must **never** compete with Level 1 calendar content.

```text
Level 1 — MUST be readable
  BS month/year · BS date · AD date · today/selected

Level 2 — useful
  weekday · festival marker · month navigation

Level 3 — decorative (optional, later)
  texture · photograph · motif · quote
```

---

## 2. Color format pitfall (implementation)

`react-native-android-widget` treats **8-digit hex as `RRGGBBAA`**, not Android `AARRGGBB`.

| Written (intended AARRGGBB) | Interpreted (RRGGBBAA) | Result |
|----------------------------|------------------------|--------|
| `#FF141012` | alpha `0x12` (~7%) | Near-invisible red glass |
| `#33FFFFFF` | alpha `0xFF`, color cyan-ish | Cyan nav pills |

**Rule:** use **6-digit `#RRGGBB`** for opaque widget colors. Only use `#00000000` for true transparency.

---

## 3. Locked MVP theme — Midnight

Modern Nepali editorial. No wallpaper inside the widget. Vermilion only for selection/actions.

| Token | Hex | Role |
|-------|-----|------|
| `bg` | `#151413` | Solid card surface |
| `surface` | `#242220` | Nav buttons |
| `strip` | `#1C1B19` | Selected-date footer |
| `text` | `#F7F4EE` | BS dates, titles |
| `textMuted` | `#A8A29A` | AD / captions |
| `selected` | `#9B1C31` | Selected day fill |
| `saturday` | `#D4A39A` | Saturday (muted, readable) |
| `accent` | `#C4A35A` | Festival marker only |
| `todayBorder` | `#6F9473` | Today ring |

**Forbidden in Midnight MVP**

- Photograph / wallpaper as widget background
- Quotes or decorative typography inside the widget
- Red/maroon as the whole surface
- Gold dots everywhere
- Translucent glass over wallpaper

---

## 4. MVP widget family (sizes only — one theme)

| Widget | Size | Job |
|--------|------|-----|
| **Today** (`MitiSmall`) | 2×2 | Large BS day + weekday + AD |
| **Month** (`MitiMedium`) | 4×3 | Full month grid only (no footer card) |
| **Calendar** (`MitiLarge`) | 4×3 | Month grid + selected strip / festival |

Same engine, same Midnight theme. Presentation differs by density only.

---

## 5. Future themes (do not implement yet)

```text
01 Paper      — warm ivory + charcoal + vermilion
02 Midnight   — LOCKED for MVP
03 Himalayan  — slate + mist + muted red
04 Terracotta — clay + cream + deep brown
05 Heritage   — cream + dark brown + restrained gold
06 Monochrome — black/white + tiny vermilion
```

Future **visual variants** (Classic / Premium / Nepali / Wallpaper / Minimal) must:

1. Share the calendar data model
2. Declare Level 1–3 hierarchy explicitly
3. Pass a readability check on busy wallpapers (solid overlay ≥ opaque)

Wallpaper variant composition (when built):

```text
IMAGE → DARK/GRADIENT OVERLAY → CALENDAR SURFACE → CONTENT → optional decoration
```

---

## 6. Gallery checklist (per future variant)

```text
Widget name / purpose / size
Information hierarchy
Layout · typography · colors · background
Calendar density · navigation
Today / selected / festival states
Interactions · what is forbidden
```
