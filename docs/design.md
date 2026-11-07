# Design system

Read before building UI, together with `docs/conventions.md`. Every new reusable component is added to the `/design` gallery and to the list below in the same change.

## Principles

- **Calm data, effects elsewhere.** Data views are flat and quiet. Motion in the dashboard is exactly four things (ADR 0025): a once-only count-up of the six Overview tile values that lands on the exact displayed string, an animated hover and active indicator on sidebar items, a soft spotlight on Overview tiles on hover, and a one-time fade-in of chart sections on first load. All are off under `prefers-reduced-motion`. No other number moves. Glow, tilt and scene art appear only in Story and Impact World.
- **The thread.** A value is linked to its method, source and formula. The accent-coloured thread line on the Show math popover is the signature element.
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
| Toggle, ToggleGroup | `src/components/ui/toggle*.tsx` | Primitives, not used by the header any more |
| ThemeProvider | `src/components/theme-provider.tsx` | `next-themes`, class on `<html>`, dark default |
| ThemeToggle | `src/components/theme-toggle.tsx` | Dark and light switch, in the sidebar footer |
| ProvenanceChip | `src/components/provenance-chip.tsx` | Method and source with glyph, least-certain-wins tint. Never wider than its container: method and source wrap onto separate lines, each label stays on one line. Narrowest supported container: 11rem. `compact` variant: method glyphs only in the same tint, a focusable button whose accessible name and tooltip (hover and focus) read "Method, Source"; use where the full chip would not fit, e.g. table headers, and put the full text in Show math |
| Panel | `src/components/panel.tsx` | Bordered container, 8px radius |
| SectionHeader | `src/components/section-header.tsx` | Title, optional description and actions |
| Badge | `src/components/badge.tsx` | Small status label |
| Tooltip | `src/components/tooltip.tsx` | Short hint on hover and focus |
| StatCard | `src/components/stat-card.tsx` | Label, mono value, ProvenanceChip slot. `needsInput` (a hint) replaces the value with "Needs input" in the sans font, muted, in the same box; never show 0 or a blank for a missing value |
| FactStatCard | `src/components/fact-stat-card.tsx` | Maps an engine Fact to StatCard, ProvenanceChip and ShowMathPopover. Optional `note` (one plain line) and `className`. Formats the headline via `formatCardValue` in `src/lib/format` (absolute value 100 or more whole, below 100 one decimal, "%" always one decimal; rounded only at display, Show math keeps `formatValue`); low/high read "not yet modelled" when the Fact has none (only the savings Facts have a range, ADR 0017); a Fact with a null value (unset team assumption, ADR 0016) renders the StatCard "Needs input" state and keeps the chip and Show math (range base reads "not available") |
| SiteTable, SiteTableSkeleton | `src/components/site-table.tsx` | One row per site; each numeric header has a compact ProvenanceChip and its own Show math (columns differ in method). Header Show math opens as a popover so the table never reflows; fits 1280px without scrolling and scrolls sideways only below about 40rem. Empty state built in |
| ObservationCard | `src/components/observation-card.tsx` | An engine `Observation` plus its Facts and flagged sites. Type (Risk, Value highlight, Data gap) and severity are badge words, never colour alone; suggested action; flagged sites as links; one row per Fact with the headline, ProvenanceChip and ShowMathPopover (rows come from `factShowMath`, shared with FactStatCard). A Fact with a null value reads "Needs input". Used in the dashboard Observations section |
| Popover, ShowMathPopover | `src/components/ui/popover.tsx`, `src/components/show-math.tsx` | shadcn Popover on base-ui. `ShowMathPopover` is the only Show math pattern (cards and table headers): formula, inputs, assumption IDs, baseline, range, accent thread line as the left border. About 30rem wide, clamped to the viewport; rows are a 1/3 label and 2/3 value grid; the formula is full width in mono; long explanatory text goes in `notes`, full width below the rows in the sans font (mono is only for numbers, formulas and IDs); an engine Fact input marked `note: true` becomes a note. One open at a time, closes on Esc and outside click, never changes layout. `align` places it under the trigger |
| Select | `src/components/ui/select.tsx` | shadcn Select on base-ui. Needs a visible label wired with `aria-labelledby`. Used for the customer, baseline and estimate pickers (one `ParamSelect` in `src/components/param-selects.tsx`; each changes only its own URL param, ADR 0017). `stacked` puts the label above a full-width trigger; `compact` keeps the label for assistive tech and shows the customer's initials (collapsed sidebar) |
| Notice | `src/components/notice.tsx` | Inline status line in a Panel (`role="status"`). `screenOnly` adds `print:hidden` and `data-print="hide"` so a print route can hide it. Used for the Story's dropped-priorities notice; the dashboard still has its own inline notices |
| StoryChapter | `src/components/story-chapter.tsx` | One Story chapter: title, one "Your priority: X" Badge per pick (words, never colour alone; two for a chapter serving both picks), template lines, children (cards). Always expanded, `break-inside-avoid` for print. Also exports `PRIORITY_LABEL` |
| ShowMathInlineProvider, PrintButton, `.print-scope` | `src/components/show-math.tsx`, `src/components/print-button.tsx`, `src/app/globals.css` | Print route pieces (ADR 0020). `ShowMathInlineProvider inline` makes every `ShowMathPopover` below it render its body expanded in the page flow (thread line kept, no trigger); the popover stays the screen pattern. `PrintButton` calls `window.print()`, hidden when printing. `.print-scope` re-declares the light tokens (keep in step with `:root`) plus A4 page breaks: a break before each Story chapter after the cover, no split inside panels, rows, list items or observations |
| PriorityPicker | `src/components/priority-picker.tsx` | Six priority chips as links (no client state, ADR 0019). Picked chips are filled with an sr-only "(selected)"; a third pick replaces the oldest; each link keeps customer, baseline and sensitivity via `storyHref` |
| Sidebar primitives | `src/components/ui/sidebar.tsx` | Ported from the shadcn base-nova `sidebar` item (ADR 0025), desktop only: `SidebarProvider` (controlled `open`, cookie `sidebar_state`, Ctrl+B), `Sidebar` (sticky, 14rem, 3.25rem collapsed, `data-state`), `SidebarTrigger`, `SidebarInset`, header, footer, content, group, group label, menu, menu button, separator. No mobile Sheet |
| AppSidebar, SidebarView | `src/components/app-sidebar.tsx` | The one navigation (ADR 0025). Wordmark, customer switcher (initials when collapsed, hidden on the game), group "Dashboard" (six sections) and "Shared" (Story, Impact World) from `src/lib/nav.ts`, footer with KAM/Customer links (one icon link when collapsed) and the theme toggle. Phosphor icons; `aria-current="page"`; labelled tooltips when collapsed; customer view shows Story and Impact World only. `SidebarView` is the pure view used by `/design` |
| AppHeader, SiteCrumb | `src/components/app-header.tsx` | One 40px row: sidebar trigger, breadcrumb (Dashboard, section; Dashboard, Sites, site name on a site page, the Sites crumb links back), then on dashboard routes the baseline and estimate pickers, and the AI toggle. A site page renders `SiteCrumb` to name its crumb |
| AppShell | `src/components/app-shell.tsx` | Sidebar, header, main and the AI aside. On dashboard routes the app sidebar shows collapsed while the AI sidebar is open unless the user toggled it since; automatic collapse never writes the cookie. Print route renders bare |
| SectionCard | `src/components/section-card.tsx` | An Overview headline: FactStatCard plus one plain line saying what the number means, equal height in its grid (grid follows the main area's width, container query). Phase 2 adds trend badge, sparkline, comparison and the motion above |
| StatCardSkeleton, EmptyState, ErrorState | `src/components/states.tsx` | Loading matches StatCard layout, empty says what to do, error is inline |
| CharacterStage | `src/components/character-stage.tsx` | Story game stage (ADR 0021): a labelled setting (meeting room, plant floor, sustainability office) with two original faceless flat figures, the Lindström KAM left and the customer's ops lead right. Art uses theme tokens only, no image assets. The speaker is raised, the other dimmed; `opsPose="reacting"` tilts the ops lead. `art="initials"` swaps the figures for portrait cards with the same labels. `caption={false}` lets a page render the setting label itself. The stage keeps a fixed aspect ratio with a maximum height and fits the art without cropping (`meet`), so characters are never cut off at any width. The setting label sits above the stage, not on the art. Effects (scene art) are allowed here, as in Story and Impact World |
| DialogueBox | `src/components/dialogue-box.tsx` | Client component. Speaker name tag as a Badge in words, one line, `min-h-36`. With `href` the whole box is a link to the next beat (click, Enter, Space) with a "Next" hint; without it, `children` hold choices. Key it per beat: a 150 ms fade plays, off under `prefers-reduced-motion` |
| ChoiceButton | `src/components/choice-button.tsx` | One game answer as a link built on `buttonVariants`: label on one line, optional hint line, `suggested` adds the "Suggested for a first run" accent Badge (words, not colour alone) and a one-line reason; it never pre-selects. `primary` for a single call to action, `newTab` for the PDF route. Press state `scale-[0.98]` |
| DeltaBadge | `src/components/delta-badge.tsx` | A Fact change between two states: word (Up, Down, No change), Phosphor glyph and signed mono value from `factDelta`; one neutral style, never colour alone, a "%" change reads "pp". Rounded only here. The game's consequence card (`src/app/story/game/_consequence-card.tsx`) places it between Before and After values that each keep a Show math popover and the Fact's ProvenanceChip |

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

`/design` shows every component above in all its states, in sections Tokens, Provenance, Data display, Controls, States and Effects. Effects holds the story game pieces (scene art, fade); the rest of Effects stays reserved for Story and Impact World.

Sample values on `/design` come from `src/app/design/_sample/`, are labelled "sample data, not engine output", and are never imported outside `src/app/design/`.

## Skills

- `minimalist-ui` guides data views and structure.
- `design-taste-frontend` guides palette, type, anti-generic rules and its browser checker. Ignore its marketing-page structure.
- Install steps: `docs/runbooks/install-design-skills.md`.
