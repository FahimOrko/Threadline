# 0014. The selected customer lives in the URL

- Status: accepted
- Date: 2026-11-06
- Supersedes: none

## Context

Every view shows one customer. The header, which holds the picker, lives in the root layout. In this Next.js version a layout does not re-render on navigation and cannot read `searchParams`; a page can, and a client component can through `useSearchParams`.

## Decision

The customer id is the `?customer=` query parameter. Pages are server components: they await `searchParams`, call `resolveCustomer` (`src/lib/customer.ts`) and pass the resolved customer down. An unknown value falls back to NorthStar (CUST001) with a visible notice, never an error. The header reads the same parameter through `useSearchParams`, inside a Suspense boundary, and calls the same `resolveCustomer` so the picker always shows the customer the page shows. The picker only navigates. View links keep the parameter. The period is a single constant passed to the engine; there is no period picker yet.

## Consequences

Links are shareable and data stays on the server (ADR 0002). Pages that depend on the customer are dynamic. A client store for the customer was rejected because the page would need client-side data. A later period or baseline picker can follow the same pattern.
