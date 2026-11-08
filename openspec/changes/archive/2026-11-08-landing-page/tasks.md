## 1. Decisions and docs first

- [x] 1.1 Write ADR 0034 (logo links to `/` with no params, amends ADR 0023) and add its row to `docs/adr/README.md`, marking 0023 "amended in part by 0034"
- [x] 1.2 Add the landing, logo and sidebar-default rules to `docs/conventions.md` (Copy voice applies to the landing)

## 2. Sidebar defaults

- [x] 2.1 `app-shell.tsx`: AI sidebar `userAiOpen ?? false`, delete the game and world special case
- [x] 2.2 Return `children` bare when the pathname is `/`
- [x] 2.3 Update `tests/app-shell.test.tsx` (closed AI on dashboard, story, game, world in both views; open nav with no cookie, cookie still honoured; bare shell on `/`)

## 3. Logo and links

- [x] 3.1 Add the `Logo` component; use it in `app-sidebar.tsx`'s `Wordmark` with `href="/"`
- [x] 3.2 Replace the `/` redirect in `src/app/page.tsx`; grep every internal link, breadcrumb, nav item and test that assumed `/` redirects
- [x] 3.3 Test that `customerViewRedirect` returns null for `/` and `/?view=customer` (`tests/selection.test.ts`) and that `src/proxy.ts` matcher excludes `/`

## 4. Content module

- [x] 4.1 Create `src/lib/landing-content.ts` with hero copy (chosen option), five bento entries, eight FAQ items, footer line, all digit-free
- [x] 4.2 Add landing copy to `tests/on-screen-wording.test.ts` (banned words, no digits) and a `tests/landing.test.tsx` (CTA hrefs, "Coming later" card has no link or input, eight FAQ items, footer text)

## 5. Landing UI

- [x] 5.1 Add shadcn `accordion` through the shadcn MCP and check it renders on `@base-ui/react`
- [x] 5.2 Load `design-taste-frontend`; build `LandingHero`, `LandingBento` with five `BentoCard` visuals, `LandingFaq`, `LandingFooter`
- [x] 5.3 Add `motion` entrance and hover with reduced-motion static fallback
- [x] 5.4 Evaluate React Bits (background, headline effect); add header comment and licence note if used. Evaluated, none used: a plain SVG thread and `motion` cover it
- [x] 5.5 Check light and dark contrast of any new token (`npm run check:contrast`). No new token

## 6. Gallery and docs

- [x] 6.1 Add a Landing section to `/design` with the hero, bento cards, FAQ and footer
- [x] 6.2 Add the new components and the React Bits licence line to `docs/design.md`

## 7. Verify

- [x] 7.1 `npm test`, `npm run lint`, `npm run check:design-imports`, `npx tsc --noEmit`
- [x] 7.2 Browser check at 1230px and 1280px, dark and light: KAM CTA lands on the dashboard in KAM view; customer CTA lands on the company picker in customer view; the logo returns to `/` from dashboard, story and world; customer view is still redirected from `/dashboard`; AI sidebar closed and left nav open on first load of dashboard, story and world; reduced motion on and off

## 8. Landing polish pass

- [x] 8.1 Load the taste skill; screenshot `/` at 1230px and 1280px, dark and light, reduced motion on and off (Playwright)
- [x] 8.2 Audit against the taste skill and rank issues by visual impact
- [x] 8.3 Fix the top issues (tokens only, Geist, Phosphor, no new dependencies); flag any copy change; keep `/design` in sync
- [x] 8.4 Before and after screenshots at 1280px dark and light; final `npm test`, lint, build and check scripts
