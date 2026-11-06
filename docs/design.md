# Design system

Read before building UI, together with `docs/conventions.md`. Every new reusable component is added to the `/design` gallery and to the list below in the same change.

## Principles

- **Calm data, effects elsewhere.** Data views are flat and quiet. Motion, glow and scene art appear only in Story and Impact World.
- **The thread.** A value is linked to its method, source and formula. The accent-coloured thread line in the ShowMath panel is the signature element.
- **Certainty is visible.** Neutral chips mean measured or calculated. Pale amber means less certain. A value with several methods takes the tint of its least certain one. Colour is never the only signal: every chip has a label and a glyph.
- **Dark by default, light for projectors.** Both themes use the same token names and both must pass contrast checks.
- **One of each.** One accent (teal), one icon family (Phosphor, regular weight), one radius scale, one type pair.

## Tokens

All colours come from CSS variables in `src/app/globals.css`. Light values live in `:root`, dark values under `.dark`. `next-themes` sets the class on `<html>`. Never hard-code a colour in a component.

| Token | Use |
|---|---|
| `--background`, `--foreground` | Page and body text |
| `--card`, `--muted`, `--muted-foreground` | Panels, quiet fills, secondary text |
| `--border` | Hairline borders (1px), no shadows |
| `--primary`, `--ring` | The teal accent: actions, focus ring, thread line |
| `--certain` | Neutral chip fill for measured, calculated and allocated values |
| `--uncertain` | Pale amber chip fill for estimated, illustrative, manual-edit values and the assumption source |
| `--radius` | 6px controls, 8px panels, pills only for ProvenanceChip |

### Typography
- UI text: Geist. All numbers: Geist Mono through the `.num` utility, which sets tabular figures.

### Units
- Units use Unicode superscripts: m², m³, not m2, m3.

### Density
- Compact. Panels use 12 to 16px padding, tables 28px rows.

## Components

Update this list with every new reusable component.

| Component | Path | Notes |
|---|---|---|
| Button | `src/components/ui/button.tsx` | Variants default, outline, ghost, secondary |
| Separator | `src/components/ui/separator.tsx` | Hairline |
| Toggle, ToggleGroup | `src/components/ui/toggle*.tsx` | Role toggle |
| ThemeProvider | `src/components/theme-provider.tsx` | `next-themes`, class on `<html>`, dark default |
| ThemeToggle | `src/components/theme-toggle.tsx` | Dark and light switch in the header |
| ProvenanceChip | `src/components/provenance-chip.tsx` | Method and source with glyph, least-certain-wins tint. Never wider than its container: method and source wrap onto separate lines, each label stays on one line. Narrowest supported container: 11rem |
| ShowMath | `src/components/show-math.tsx` | Formula, inputs, assumption IDs, baseline, range, thread line |
| Panel | `src/components/panel.tsx` | Bordered container, 8px radius |
| SectionHeader | `src/components/section-header.tsx` | Title, optional description and actions |
| Badge | `src/components/badge.tsx` | Small status label |
| Tooltip | `src/components/tooltip.tsx` | Short hint on hover and focus |
| StatCard | `src/components/stat-card.tsx` | Label, mono value, ProvenanceChip slot |
| FactStatCard | `src/components/fact-stat-card.tsx` | Maps an engine Fact to StatCard, ProvenanceChip and ShowMath. Formats via `src/lib/format`; low/high read "not yet modelled" when the Fact has none |
| StatCardSkeleton, EmptyState, ErrorState | `src/components/states.tsx` | Loading matches StatCard layout, empty says what to do, error is inline |

## Contrast

`npm run check:contrast` computes WCAG ratios from the tokens. Measured on 2026-11-06 (text pairs need 4.5:1, chip edges 1.5:1):

| Pair | Light | Dark |
|---|---|---|
| Body text on background | 17.33 | 17.28 |
| Secondary text on background | 7.12 | 7.83 |
| Accent on background | 5.85 | 10.17 |
| Button text on accent | 5.94 | 10.17 |
| Neutral chip text on chip fill | 13.41 | 11.18 |
| Amber chip text on chip fill | 8.32 | 9.45 |
| Neutral chip edge vs background | 1.89 | 2.57 |
| Amber chip edge vs background | 1.96 | 3.36 |

## Gallery

`/design` shows every component above in all its states, in sections Tokens, Provenance, Data display, Controls, States and Effects. Effects is reserved for Story and Impact World and stays empty until those slices.

Sample values on `/design` come from `src/app/design/_sample/`, are labelled "sample data, not engine output", and are never imported outside `src/app/design/`.

## Skills

- `minimalist-ui` guides data views and structure.
- `design-taste-frontend` guides palette, type, anti-generic rules and its browser checker. Ignore its marketing-page structure.
- Install steps: `docs/runbooks/install-design-skills.md`.
