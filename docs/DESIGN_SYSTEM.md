# Miti — Design System

> **Status:** Decisions locked (Phase 0 revision) — coding not started  
> **Depends on:** `PRD.md`  
> **Last updated:** 2026-10-04

---

## 1. Purpose

Define the visual and interaction language so Miti feels like a **modern, premium Nepali calendar** — warm, minimal, culturally recognizable — not a generic converter and not an ornate “traditional calendar” pastiche.

---

## 2. Scope

Colors, typography, spacing, radii, elevation, iconography, component states, dark mode, accessibility, and cultural motif rules for app + widget (widget approximates tokens in native UI).

---

## 3. Design principles

1. **Nepali-first hierarchy** — BS numerals/names dominate; AD is clearly secondary.
2. **Modern, not museum** — subtle cultural cues; no screen-wide decoration.
3. **Calm density** — date cells stay breathable; indicators are quiet.
4. **Warm minimalism** — cream/neutral fields, restrained accent use.
5. **One job per surface** — calendar browses; detail explains; settings configure.

---

## 4. Brand & product feel

| Attribute | Target |
|-----------|--------|
| Tone | Elegant, warm, contemporary |
| Cultural signal | Recognizable without costume |
| Motion | Purposeful, short, non-gimmicky |
| Avoid | Purple-gradient SaaS look; newspaper clutter; heavy gold filigree everywhere |

---

## 5. Color

### 5.1 Core palette (initial)

| Token | Hex | Role |
|-------|-----|------|
| `color.deepRed` | `#9B1C31` | Primary actions, key emphasis |
| `color.vermilion` | `#C73E1D` | Secondary accent / active highlights |
| `color.warmGold` | `#D4A84F` | Important festivals / special marks |
| `color.cream` | `#FFF8EC` | Light backgrounds |
| `color.charcoal` | `#252525` | Primary text |
| `color.mutedGreen` | `#557A5A` | Secondary positive / subtle cultural accent |

### 5.2 Usage rules

- Do **not** use all colors everywhere.
- Backgrounds: cream / neutrals.
- Primary CTAs: deep red.
- Festival importance: warm gold (plus non-color indicator).
- Secondary info (AD dates, captions): muted charcoal/gray derivatives.
- Derive semantic tokens:

```text
bg.canvas
bg.surface
text.primary
text.secondary
text.bsDominant
text.adSecondary
border.subtle
state.today
state.selected
festive.important
danger / success (sparse)
```

**TODO:** Exact derived neutrals/grays and dark-mode inversions in implementation tokens file.

### 5.3 Dark mode

- Preserve warm character; avoid pure `#000` slabs if possible.
- Deep red/gold adjusted for contrast on dark surfaces.
- **Locked:** Dark mode polish is **P1 / V1**. MVP ships an excellent light theme first.

---

## 6. Typography

### Requirements

- Excellent bilingual rendering: English + Nepali Unicode Devanagari
- No legacy encodings (Preeti, etc.)
- BS date numerals larger/heavier than AD

### Hierarchy (app)

| Role | Guidance |
|------|----------|
| Month title (BS) | Largest display on calendar header |
| Month subtitle (AD) | Smaller, secondary |
| Cell BS day | Dominant numeric |
| Cell AD day | ~60–70% size / lower contrast |
| Detail title | BS long form strong |
| Body | Readable 14–16sp equivalent |

**VERIFY:** Font family selection + widget embedding.

### Numeral preference

Support setting: Devanagari digits vs Arabic digits for BS display. **MVP default:** AD remains Arabic digits; BS uses Devanagari. Whether AD follows the numeral preference is **P1** polish (default stays Arabic unless decided otherwise).

---

## 7. Spacing, radius, elevation

Proposed scale (dp):

```text
space: 4, 8, 12, 16, 20, 24, 32, 40, 48
radius: 8, 12, 16 (avoid pill-everything)
elevation: none | soft (sparingly)
```

Cards: **default to no cards** on marketing-like surfaces; use containers only when they aid interaction (settings rows, event editors). Calendar grid is a composition, not a stack of cards.

---

## 8. Iconography

- Simple geometric icons; stroke consistency
- Festival mark: subtle dot / small ✦-like mark — not large emoji spam
- Do not rely on color alone

**TODO:** Icon set choice (custom minimal vs Phosphor/Lucide-style) — prefer one set.

---

## 9. Cultural motifs

Allowed:

- Subtle pattern in empty states or festival headers
- Paubha-inspired geometry used sparingly
- Soft architectural curves in illustrations (not chrome)

Not allowed as default chrome:

- Full-screen mandala backgrounds on calendar
- Busy borders on every cell
- Clipart temples on each holiday

Festival-specific themes = **P2+**.

---

## 10. Calendar components

### 10.1 Month header

```text
        असोज २०८३
         October 2026
      ‹              ›
```

### 10.2 Weekday row

Short Nepali labels preferred (आइ सो मं …) with accessible full names.

### 10.3 Date cell

Must show BS + AD. States:

| State | Visual |
|-------|--------|
| Default | BS strong, AD muted |
| Today | Distinct ring/background (not only bold) |
| Selected | Stronger fill/stroke using primary/subtle surface |
| Outside month | N/A if grid is BS-month-only; if padded, muted |
| Has event | Subtle indicator below/near numerals |

Touch target ≥ 44×44 dp equivalent.

### 10.4 Selected date detail

```text
१८ असोज २०८३
Sunday · October 4, 2026

✦ घटस्थापना
Ghatasthapana
```

Bilingual titles when data provides `titleNp` + `title`.

---

## 11. Widget visual parity

- Same hierarchy and palette intent
- Accept native limitations (type ramp, shadows)
- Prefer clarity over decorative parity

---

## 12. Motion

Ship a few intentional motions:

1. Month transition (horizontal slide/fade, ≤200–250ms)
2. Selection feedback
3. Today jump subtle emphasis

Avoid continuous decorative animation.

---

## 13. Accessibility

- Contrast: text/icons meet WCAG AA where practical on mobile
- Dynamic type: don’t clip Devanagari at large sizes
- Screen reader labels include BS, AD, and event titles
- Widget controls labeled (prev/next/month)
- Festival meaning not color-only

---

## 14. Content tone

- Short labels
- Nepali-first naming in UI where product language decision allows
- Transliterations as secondary lines for festivals

**Locked:** Bilingual UI, Nepali-first hierarchy. MVP default is Bilingual (not Nepali-only, not English-only). Later settings may offer Bilingual / नेपाली / English.

Styling implementation: **StyleSheet + tokens** (see `TECH_STACK.md`) — not NativeWind.

---

## 15. Locked / remaining

| ID | Question | Status |
|----|----------|--------|
| Q-D02 | Dark mode = P1 | ✅ Locked |
| Q-D04 | Weekday row Nepali-first with English secondary where space allows | ✅ Locked |
| Q-D06 | UI language bilingual Nepali-first | ✅ Locked |
| Q-D01 | Final font files/licenses? | **VERIFY** |
| Q-D03 | AD digits follow numeral preference? | Deferred P1; MVP AD = Arabic |
| Q-D05 | Exact gray scale tokens? | **TODO** at implementation |

---

## 16. Implementation guidance

- Encode tokens in `src/theme` (`colors`, `typography`, `spacing`, `radii`, `elevation`) first; components consume tokens only via StyleSheet.
- Build calendar cell + header as reference components before expanding Events UI (P1).
