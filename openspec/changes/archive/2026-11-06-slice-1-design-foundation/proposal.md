# Proposal

## Why

Every later slice builds UI, and the spec says every displayed value carries provenance. Without shared tokens, a theme and a provenance component, each slice would invent its own look and its own chips. Slice 1 fixes the visual foundation once, before the data pipeline, so Slices 2 to 12 only compose existing parts.

## What Changes

- Add `docs/design.md`: principles, tokens, and the component list.
- Add design tokens for a dark theme (default) and a light theme, with one teal accent and one pale-amber "less certain" tint. Light mode must stay readable on a projector.
- Add a theme toggle in the header. The theme is handled by `next-themes` (class on `<html>`, persisted in the browser, no flash on load). The role toggle stays in the existing Zustand store.
- Geist for UI text, Geist Mono with tabular figures for all numbers.
- Switch the icon library from Lucide to Phosphor and update `components.json`.
- Build the base components: ProvenanceChip, ShowMath panel (the "thread"), StatCard, SectionHeader, Panel, Badge, Tooltip, and loading, empty and error states. Existing Button, Separator and Toggle are restyled to the tokens.
- Add the `/design` route: a living gallery with sections Tokens, Provenance, Data display, Controls, States and Effects (labelled, empty for now).
- Sample data for `/design` lives only inside the `/design` route folder and is labelled "sample data, not engine output".

## Capabilities

### New Capabilities
- `design-system`: tokens, dark and light themes, typography, icon family, base components and the `/design` gallery with its sample-data rule.
- `provenance-display`: how a value shows method, source and formula: the chip, certainty tint and the show-math panel.

### Modified Capabilities
- `app-shell`: the header gains a theme toggle.

## Impact

- Code: `src/app/globals.css`, `src/app/layout.tsx`, `src/components/app-shell.tsx`, `src/components/ui/*`, new `src/components/*`, new `src/app/design/`, `components.json`, `package.json` (add Phosphor and `next-themes`, remove `lucide-react` if unused).
- Docs: new `docs/design.md`, `docs/conventions.md`, a new ADR for the sample-data exception, the ADR index.
- No data, engine or AI code. The `/design` page shows sample strings only and computes nothing.
- Out of scope: Story and Impact World effects, charts, real KPI values (Slice 2).
