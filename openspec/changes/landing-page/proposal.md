# Proposal

## Why

Opening Threadline today drops you straight into the account manager's dashboard (`/` only redirects). A visitor never learns what the app is, who it is for, or that there are two ways in. A thin landing page fixes that: one clear choice between the account manager's view and the customer's view, plus a short guide to what lives where. The two sidebar defaults are fixed in the same change because the landing page is the first place a reviewer lands and both sidebars currently open in surprising states (the AI sidebar open on the dashboard, which also squeezes the left nav).

## What Changes

- **Landing at `/`.** `src/app/page.tsx` stops redirecting and renders the landing page. The dashboard already lives at `/dashboard`, so no route moves; the work is making `/` a real page and checking every link, test and spec that assumed `/` redirects. Desktop only (no phone layout).
- **Bare shell on `/`.** `AppShell` renders `/` without the sidebar, header and AI aside. The landing page has its own top-left logo.
- **Logo always goes to `/`.** The landing logo and the app sidebar wordmark link to `/` and drop every param, including `?view=`. A new ADR (0034) amends ADR 0023 for this one exception.
- **Hero.** Logo top-left, a one-line headline, a short subline and two CTAs: "Step in as Lindström's account manager" to `/dashboard?view=kam`, "See it as a customer" to `/story/game?view=customer`. Copy options below.
- **Features bento.** Five cards: Dashboard, Story review, Impact World, Export, AI guide. One line of copy and a small static visual each, no live numbers. The AI guide card is marked "Coming later" and describes its use case; it has no chat UI and no link.
- **FAQ.** shadcn Accordion with eight navigation-guide questions. The questions and answers live in one static module (`src/lib/landing-content.ts`) that a future AI guide can read.
- **Footer.** "Synthetic data, not audit-ready".
- **AI sidebar closed by default everywhere.** It opens only when the user clicks its toggle. The per-route default is removed.
- **App sidebar open on every page load.** The user can still collapse it with the toggle. The saved cookie is still honoured; with none, it is open.
- **Motion** through `motion`, static under `prefers-reduced-motion`. React Bits only where it fits (see Decisions for licence).
- **Docs.** Landing sections added to `/design` and `docs/design.md`; copy rules checked against the Copy voice section; app-shell spec updated.

### Hero copy options

Everything below follows the Copy voice section (warm, plain, a little more explanation, no banned words).

| | Headline | Subline |
|---|---|---|
| **A (chosen)** | Your year of laundry, told as a story. | See what working with Lindström saved and how we worked it out, from either side of the table. (Subline tightened to 19 words in the polish pass; headline unchanged.) |
| B | The numbers behind your year with Lindström. | Every figure shows where it came from and how it was calculated, so the conversation is about what to do next, not whether to trust them. |
| C | A value review you can actually follow. | Walk through the year with Lindström, one honest step at a time. Pick the side of the table you are on. |

### Feature card copy (proposed)

- **Dashboard:** "Every site, month and measure in one place, each figure with its source."
- **Story review:** "A short guided conversation that turns the year into choices you can talk through."
- **Impact World:** "Your savings as a picture you can walk around in. It opens once the review is done."
- **Export:** "Take the story away as a Markdown or JSON file."
- **AI guide (Coming later):** "A guide that explains what a figure means, how we calculated it and where to find things in the app, for the account manager and the customer alike. It explains; it never states a figure itself."

## Capabilities

### New Capabilities

- `landing-page`: the `/` route, its hero, bento, FAQ, footer, the CTA targets, the logo rule, the static content module and reduced-motion behaviour.

### Modified Capabilities

- `app-shell`: the AI sidebar is collapsed by default on every route; the app sidebar is open when no cookie exists; `/` renders without the shell; the sidebar wordmark links to `/`; the cookie persistence and "AI sidebar collapses the app sidebar" requirements change accordingly.
- `dashboard-navigation`: "Customer view has no dashboard" gains the rule that `/` is never redirected and stays reachable in customer view.
- `design-system`: the `/design` gallery includes the landing sections.

## Decisions for review

Chosen by me, not specified in the request. Push back on any.

1. **No route move.** `/dashboard` already exists, so "dashboard moves to /dashboard" reduces to replacing the `/` redirect. `src/proxy.ts` needs no logic change (its matcher is `/dashboard/:path*`, so `/` is already untouched); I add a test that proves it.
2. **Landing is bare, not a route group.** `AppShell` returns `children` alone when the pathname is `/`. Moving every route into a `(app)` group would touch dozens of files for the same result. Trade-off: the shell component knows one path.
3. **Left nav keeps honouring the cookie** (reviewed): open by default when no `sidebar_state` cookie exists; `SIDEBAR_COOKIE` stays. Existing code already does this, so no nav change beyond the tests.
4. **Opening the AI sidebar on the dashboard still collapses the left nav** (ADR 0025), since both being open squeezes a dashboard that fits 1280px. Because the AI sidebar now starts closed, this only happens after a click.
5. **Proposed hero copy is option A.** B and C are alternatives; pick one before apply.
6. **Eight FAQ items**, in this order: What is the Dashboard? What is the Story? What is Impact World? Why does Impact World open after the review in the customer view? How do I switch customer? How do I switch between account manager and customer view? How does export work? What will the AI guide do? (It is the answer that says it is coming later.)
7. **Logo target in the customer view.** `/` drops `?view=`, so a customer who clicks the logo then chooses a CTA again. The landing page does not remember the view.
8. **Landing is a server component; only the FAQ accordion and motion wrappers are client.** The bento visuals are small inline SVG and CSS, not images.
9. **React Bits licence.** React Bits is MIT with the Commons Clause ([repository](https://github.com/DavidHDev/react-bits), [discussion #1101](https://github.com/DavidHDev/react-bits/discussions/1101)). The clause restricts reselling or redistributing the components themselves; using them in a shipped app is permitted per a community answer, not the licence text. Any React Bits component copied in gets a header comment naming it, the licence and the source, and a line in `docs/design.md`. If a component is not clearly worth it, I use plain `motion` instead.
10. **Shape of ADR 0034.** "Logo links to `/` with no params." It amends ADR 0023's `carryParams` rule for this one link and does not supersede it.
11. **Browser check scope.** 1230px and 1280px, dark and light, reduced motion on and off, as the last task. Run against `next dev`.

## Impact

- **Code:** `src/app/page.tsx`, new landing components and `src/lib/landing-content.ts`, `src/components/app-shell.tsx`, `src/components/app-sidebar.tsx` (wordmark link), `src/components/ui/accordion.tsx` (shadcn), `src/app/design/page.tsx`.
- **Tests:** `tests/app-shell.test.tsx` (AI default, nav default), `tests/nav.test.ts`, new `tests/landing.test.tsx` and additions to `tests/on-screen-wording.test.ts` (banned words and digit-free landing copy).
- **Docs:** ADR 0034 and its index row, `docs/design.md`, `docs/conventions.md` (landing and logo rule). `docs/product-spec.md` is untouched.
- **Dependencies:** shadcn `accordion` (base-nova, on `@base-ui/react`, already installed). No new package unless a React Bits component needs one.
- **Out of scope:** phone layout, a real AI guide, any live figure on the landing page, remembering the view across the logo click.
