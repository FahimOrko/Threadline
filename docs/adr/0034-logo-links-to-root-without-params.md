# 0034. The logo links to `/` with no params

- Status: accepted
- Date: 2026-11-08
- Amends: 0023 (one exception to `carryParams`)

## Context

`/` becomes a landing page where the reader chooses the account manager's view or the customer's view. ADR 0023 keeps `?view=` on every link through `carryParams`, so a logo that kept it would skip that choice.

## Decision

- The logo (top-left on the landing page and the wordmark in the app sidebar) is one `Logo` component whose `href` is the literal `/`. It drops every param, `?view=` included.
- Every other link keeps the rules of ADR 0023. `/` is never redirected by `src/proxy.ts` (its matcher is `/dashboard/:path*`) and is reachable in the customer view.
- The landing page does not remember the view. A customer who clicks the logo picks a view again.

## Consequences

The logo is the only link that leaves the view behind on purpose. The landing page renders without the app shell (pathname `/`). ADR 0023 stays accepted.
