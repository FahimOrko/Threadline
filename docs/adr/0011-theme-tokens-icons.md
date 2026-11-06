# 0011. Theme, tokens and icons

- Status: accepted
- Date: 2026-11-06
- Supersedes: none

## Context

Every later slice builds UI, so the look needs one source. The app must be dark by default and still readable in light mode on a projector.

## Decision

- Theme: `next-themes` with `attribute="class"`, `defaultTheme="dark"` and `enableSystem={false}`. Role stays in Zustand. The provider's inline script is given `type="text/plain"` on the client, as the Next.js guide on preventing flash before hydration describes, to avoid React's script warning.
- Tokens: CSS variables in `src/app/globals.css`, light in `:root`, dark under `.dark` (shadcn convention). One teal accent. Two certainty tokens: `--certain` (neutral) and `--uncertain` (pale amber). Chip tone follows the least certain method of a value.
- Type: Geist for text, Geist Mono with tabular figures for all numbers (`.num`).
- Icons: Phosphor, regular weight. Lucide is removed.
- Contrast: `npm run check:contrast` computes ratios from the tokens; text pairs need 4.5:1 in both themes.

## Consequences

Colours are never hard-coded in components. A new token needs a value in both themes and an entry in the contrast script. Replacing `next-themes` later only touches `theme-provider.tsx` and `theme-toggle.tsx`.
