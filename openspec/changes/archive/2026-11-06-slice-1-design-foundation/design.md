# Design

## Context

The app is a Next.js App Router project with shadcn (base-nova), Tailwind v4, Geist and Geist Mono already loaded, stock grayscale tokens in `src/app/globals.css` (with a `.dark` block), and only Button, Separator, Toggle and ToggleGroup built. The Zustand store in `src/store/` persists the role only and stays as it is. The next Next.js docs in `node_modules/next/dist/docs/` must be read before touching layout or metadata APIs. See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**
- One token source in `globals.css` for both themes, used by every component.
- Components whose names and states are listed in `docs/design.md` and shown at `/design`.
- A provenance chip and show-math panel the data slices can drop in unchanged.

**Non-Goals:**
- Story and Impact World effects (motion, glow, scene art).
- Charts, real KPI values, any engine or data code.
- A third theme or per-view themes.

## Decisions

1. **Tokens as CSS variables in `globals.css`, following the shadcn convention: light values in `:root`, dark values under `.dark`.** `next-themes` always sets the class before paint, so the default theme does not depend on a missing class, and the existing `@custom-variant dark` keeps working. Alternative: dark values in `:root` with a `.light` override. Rejected because it fights the shadcn components and the existing variant.
2. **Theme handled by `next-themes`, role stays in Zustand.** A client `ThemeProvider` wraps the app with `attribute="class"`, `defaultTheme="dark"`, `enableSystem={false}` and `disableTransitionOnChange`; `<html>` gets `suppressHydrationWarning`. Its injected script sets the class before first paint, which removes the flash, and it persists the choice in localStorage. The toggle reads and sets the theme with `useTheme` and renders after mount to avoid a hydration mismatch. Alternative: a theme field in the Zustand store with a hand-written pre-paint script. Rejected: more code to own for the same result. The first task of the theme group checks that the installed `next-themes` version supports this Next.js version and the Next docs for the provider placement in the root layout.
3. **Accent is teal around `oklch(0.62 0.12 195)`, tuned per theme to hold 4.5:1 for text and 3:1 for UI.** Light mode uses a darker teal for text. Alternative: cobalt or emerald, rejected because they collide with common semantic tints.
4. **Certainty tint lives in two tokens, `--certain` (neutral) and `--uncertain` (pale amber).** The chip maps method and source to a certainty rank (MEASURED, CALCULATED, ALLOCATED rank high; ESTIMATED, ILLUSTRATIVE, MANUAL_EDIT and the ASSUMPTION source rank low) and takes the lowest rank across all methods on a value. The rank mapping is a presentation concern, not a number, so it sits in the component layer. Colour is never the only signal: each method has a label and a glyph.
5. **Icons: Phosphor (`@phosphor-icons/react`), regular weight everywhere.** `components.json` `iconLibrary` is switched, shadcn components that import Lucide are edited to Phosphor, and `lucide-react` is removed once a grep shows no imports. Alternative: keep Lucide. Rejected because both design skills ban it and only four components exist today.
6. **Numbers in Geist Mono via a `.num` utility with `font-variant-numeric: tabular-nums`.** The font variable is already set in `layout.tsx`.
7. **`/design` is a single server route with anchored sections; sample data in `src/app/design/_sample/`.** The underscore folder is private to the route. A check script (`npm run check:design-imports`, run in the final task) greps `src/` outside `src/app/design/` for imports of `_sample` and fails on any match. Alternative: an ESLint `no-restricted-imports` rule, which is cleaner but needs the flat-config path pattern verified first; the grep script is the smaller start and can be upgraded.
8. **Interactive pieces are leaf client components.** ShowMath (toggle state), Tooltip and the theme toggle are `"use client"`; the rest stay server components.
9. **Fixtures are strings and plain objects, never computed.** `/design` does no arithmetic, so ADR 0005 holds; the exception is only that sample values appear outside the engine. This is recorded in a new ADR.

## Risks / Trade-offs

- [Flash of wrong theme] → rely on the `next-themes` script and check that a reload in light shows no dark frame.
- [`next-themes` incompatible with this Next.js version] → verify before building on it; fall back to a small custom provider if it fails.
- [Light theme loses contrast on projector] → compute contrast ratios for body text, the neutral chip and the amber-tint chip in both themes and record them in `docs/design.md`; also run the browser checker from design-taste-frontend.
- [Sample data copied into real views] → import-boundary check and the visible label.
- [Editing shadcn-generated files] → keep edits to tokens and icon imports so `shadcn add` stays usable.
- [Phosphor bundle size] → import named icons only.
