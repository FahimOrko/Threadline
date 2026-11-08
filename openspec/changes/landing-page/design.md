# Design

## Context

See proposal.md for motivation. `/` currently redirects to `/dashboard`. `AppShell` (root layout) wraps every route with the app sidebar, header and AI aside. The AI aside opens by default except on `/story/game` and `/world`; the app sidebar reads a `sidebar_state` cookie after mount and collapses automatically while the AI aside is open on the dashboard (ADR 0025). `src/proxy.ts` only matches `/dashboard/:path*`.

## Goals / Non-Goals

**Goals:** a landing page at `/` with two CTAs, bento, FAQ and footer; both sidebar defaults fixed; logo always returns to `/`; FAQ text reusable by a future AI guide.

**Non-Goals:** phone layout, a working AI guide, live figures on the landing, remembering the view across the logo click, moving routes into route groups.

## Decisions

1. **Bare shell by pathname.** `Frame` in `app-shell.tsx` returns `children` alone when `pathname === "/"`. Alternative, route groups `(app)` and `(landing)`, moves every route and test for the same result.
2. **Sidebar defaults.** Remove `isGame` and `userAiOpen ?? !isGame`; `aiOpen = userAiOpen ?? false`. Remove the cookie read: `pref` starts `true` and only `chosen` overrides it. `SIDEBAR_COOKIE` and the cookie write in `ui/sidebar.tsx` go if nothing else uses them (check before deleting). The automatic collapse on the dashboard stays, so opening the AI aside there still collapses the nav.
3. **Content module.** `src/lib/landing-content.ts` exports `FAQ: { id, question, answer }[]`, plain strings, no JSX, no digits. Bento copy and hero copy sit in the same file. The accordion renders it.
4. **Accordion.** Add shadcn `accordion` for base-nova via the shadcn MCP (`get_add_command_for_items`), then check it against `@base-ui/react`.
5. **Components.** `src/components/landing/` holds `LandingHero`, `LandingBento`, `BentoCard` (with a `visual` slot), `LandingFaq`, `LandingFooter`. Server components except `LandingFaq` and a small `Reveal` motion wrapper. Visuals are inline SVG on theme tokens (no hard-coded colour, Phosphor icons only).
6. **Motion.** `motion` for a one-time staggered entrance and a card hover lift, wrapped so `useReducedMotion()` (and the `prefers-reduced-motion` CSS) renders the final state from the first render. Meaning-carrying text never animates in from invisible without a static fallback.
7. **React Bits.** Candidates: one background (for example Aurora or Grid-style) and one text effect for the headline. Use only if it reads well in both themes and stays out of the way of text contrast; copy the component into `src/components/landing/` with a header comment `React Bits (MIT + Commons Clause), https://github.com/DavidHDev/react-bits`, and add a licence line to `docs/design.md`. Skip if it needs a new dependency beyond `motion`.
8. **Logo.** One `Logo` component (wordmark, optional mark) used by the hero and by `Wordmark` in `app-sidebar.tsx`; `href="/"` literal, never through `carryParams`. ADR 0034 states this exception.
9. **Taste.** Apply `design-taste-frontend` to the landing only, within the existing tokens (teal accent, Geist). Desktop min width 1230px; no breakpoints below `lg`.
10. **ADR 0034.** "The logo links to `/` and drops all params". Amends 0023 (add "amended in part by 0034" in the index row; the ADR file itself stays append-only). Next free number confirmed from `docs/adr/README.md`.

## Risks / Trade-offs

- A logo click from the customer view loses `view`; a customer must pick again. Accepted, stated in ADR 0034.
- Dropping the cookie means a returning KAM who preferred a collapsed nav sees it open each load. Stated in the proposal as a decision for review.
- The Suspense fallback of `AppShell` has no pathname; on `/` it would flash the shell. Check in the browser; if it does, read the path with `usePathname` outside Suspense since `/` has no dynamic segment.
- React Bits licence is a community-confirmed reading, not the licence text; re-read `LICENSE.md` when copying.
