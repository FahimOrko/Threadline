# 0023. View mode lives in the URL and a proxy keeps the customer out of the dashboard

- Status: accepted
- Date: 2026-11-07
- Supersedes: none (builds on 0014, 0017, 0021)

## Context

The dashboard is the KAM's workspace; Story and Impact World are shared with the customer. The header KAM/Customer toggle was a persisted client store that nothing else read, while the game already read `?view=` through `resolveView`. Two sources of truth, and nothing kept a customer out of the dashboard.

## Decision

- `?view=customer` is the only source of the view mode. KAM is the absence of the param, and an unknown value is KAM. The persisted role store is deleted; the toggle is two links that set or clear the param, so a reload keeps the mode.
- In Next.js 16 "middleware" is called Proxy. `src/proxy.ts` (matcher `/dashboard/:path*`) redirects customer-view requests to `/story/game?view=customer`, keeping `customer` only. The decision is the pure `customerViewRedirect` in `src/lib/selection.ts`; there are no per-page guards (a layout does not receive `searchParams`). KAM view is never redirected.
- `carryParams` decides which params a view link carries: leaving the dashboard keeps `view` only, so Story and Impact World start fresh; other links keep customer, baseline, sensitivity and priorities as before. The dashboard link is absent in customer view.
- The customer, baseline and sensitivity pickers move to the top of the dashboard sidebar and leave the header on `/dashboard` routes.

## Consequences

- The proxy is a redirect, not authentication: anyone can edit the URL. It states audience, not security.
- The proxy also runs on client-side navigation requests; checked in the browser.
- `zustand` is no longer used by the app.
