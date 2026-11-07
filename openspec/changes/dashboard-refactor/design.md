## Context

See proposal.md for motivation. Decided for this change: view mode via `?view=` with the role store deleted, a Proxy redirect, pickers in the sidebar, six sections. Charts and engine series are in `dashboard-content`.

Current state: `/dashboard` is one server page that calls `operationalFacts`, `valueFacts`, `percentageFacts`, `footprintFacts` and `observations`, plus `operationalSiteRows`. `AppShell` is a client component that reads params with `useSearchParams` and builds view links (carrying customer, baseline, sensitivity, priorities). `resolveView` exists in `src/lib/selection.ts` and is used only by the game. A persisted zustand role store drives the header KAM/Customer toggle. There is no chart library. Next.js here differs from older versions: read the routing guides in `node_modules/next/dist/docs/` (layouts, `redirect`, `searchParams`) before writing the layout.

## Goals / Non-Goals

**Goals:** a dashboard layout with sidebar and subroutes; one source for view and link params; section intros made of fixed templates.

**Non-Goals:** charts, engine changes, chip changes, story report/PDF, Impact World, AI, mobile layout.

## Decisions

1. **Redirect in `src/proxy.ts`.** Checked in the bundled docs (`01-app/01-getting-started/16-proxy.md`): in Next.js 16, "middleware" is called Proxy, a `proxy.ts` file next to `app`, with an exported `proxy(request)` and `config.matcher`. Matcher `/dashboard/:path*` covers `/dashboard`, every subroute and site pages. The proxy reads `view` through `resolveView`, and on `customer` returns `NextResponse.redirect` to `/story/game?view=customer` plus `customer` when present. The decision is a pure helper in `selection.ts` (`customerViewRedirect(url)`), unit-tested, so the proxy file stays a thin wrapper. No per-page guard. Server Functions are POSTs to their own route, and the dashboard has none. Alternative: a layout guard. It was rejected: a layout does not receive `searchParams`, and the decision is "no per-page guards".
2. **Dashboard layout** `src/app/dashboard/layout.tsx` renders `DashboardSidebar` and children. The sidebar is a client component because it reads the URL for active state and the pickers; it takes the customer and baseline lists as props.
3. **Link params in one pure helper in `selection.ts`.** `carryParams(target, params)` returns the query for a target: within `dashboard` it keeps customer, baseline, sensitivity, view; from the dashboard to `story` or `world` it keeps `view` only; story-internal links keep today's behaviour (`gameHref` is unchanged). `AppShell`'s `ViewLinks` uses it. Unit-tested.
4. **View toggle.** The header toggle becomes two links that set or clear `view` (KAM is the absence of the param). `src/store/role-store.ts` and its `persist.rehydrate` effect are deleted. The task greps `useRoleStore` first; the only known reader is `AppShell`.
5. **Pickers in the sidebar.** `ParamSelect` is reused unchanged. The header hides its `Selectors` on `/dashboard` paths, in the same place it hides them for the game. Impact World keeps them in the header.
6. **Section pages are server pages** calling the same engine functions as today, each only the ones it needs. `PERIOD` moves to one shared module. Intros use the existing `resolveLine` and fact tokens from `src/lib/story`; no second token syntax. Each section's template sits in one module next to the sections, not in page JSX.
7. **Sites and site pages.** `SiteTable` moves to `/dashboard/sites`; the site page sits under the layout and its back link goes to `/dashboard/sites`. `siteHref` keeps its params plus `view`.

## Risks / Trade-offs

- [Proxy runs on every matched request] → matcher is only `/dashboard/:path*`, and the helper does no I/O.
- [Removing the role store breaks a reader] → grep `useRoleStore` before deleting; build and tests must pass.
- [Dropping params on leaving the dashboard loses the KAM's choice] → intended; Story and Impact World start fresh.
- [A client-side `<Link>` navigation to `/dashboard?view=customer`] → the proxy also runs on client navigations' RSC requests; verify the redirect in the browser, not only with a direct URL.
- [Wrong redirect keeps stale params] → the helper builds the target from `view` and `customer` only, covered by tests.
