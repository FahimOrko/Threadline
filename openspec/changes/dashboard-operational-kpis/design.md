# Design

## Context

Today: `generatedSource` holds four sheets; `replacementsPostponed(data, { customerId, period })` is the only engine function; `/dashboard` hard-codes `CUST001`; `AppShell` is a client component with a disabled "Customer: not selected" button. `Fact.scope` carries only the customer. See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**
- Add `service_activity` through the existing pipeline path with no special cases.
- Keep every number in `src/lib/engine`; the page and components only format and lay out.
- Make later changes (money, percentages, footprint) able to reuse the scope and the wearer and garment Facts unchanged.

**Non-Goals:**
- No `siteId` on `Fact.scope` (the site drill-down in change 3 decides that).
- No period picker, baseline, sensitivity or role-dependent content.

## Decisions

1. **Customer lives in the URL (`?customer=`), read in the server page.** The page stays a server component and links are shareable. Alternative: a Zustand store like the role toggle; rejected because the page would need client-side data. Unknown values resolve through one small pure function (`src/lib/customer.ts`, no numbers) that returns the customer plus the rejected value, and the page renders a notice from that.
2. **Header gets the customer list from the server.** The root layout loads `generatedSource`, passes `{ id, name }[]` to `AppShell`. The picker is a native, token-styled `<select>` with a visible label, so keyboard and screen-reader behaviour comes free; no new dependency and no new reusable component. Changing it navigates to the same path with the new `?customer=`. The view links keep the current `?customer=`. Reading the param in the client shell uses `useSearchParams`, which needs a Suspense boundary; confirm in the bundled Next docs before coding.
3. **Period stays a constant (2025-01 to 2025-12) in one place** and every engine call takes it as an argument, so a later period picker changes the caller only.
4. **"Latest month" is `period.to`.** Active wearers and Garments in circulation read that month only; the Fact's inputs name it.
5. **Active wearers rule** (max across product rows per site, then sum) is a single helper reused by the customer Fact and the per-site rows, so the table cannot drift from the card. Show math carries a plain sentence on the 28,367 vs 9,607 difference; the number 28,367 is text in the explanation, not a computed value. ADR 0015 records the rule.
6. **Per-site rows are one engine call** returning raw numbers plus a single provenance block for the whole table. Rationale: ADR 0004 needs provenance on every displayed value, but 24 x 4 chips would be noise. Alternative: a Fact per cell; rejected as 96 Facts with identical provenance.
7. **SiteTable takes rows and a provenance block, formats via `src/lib/format`,** and renders ProvenanceChip and ShowMath once. Its /design fixture is a fixed labelled string set (ADR 0010).
8. **Per-100-wearers is its own Fact** with method CALCULATED, built from the Service requests and Active wearers Facts' values, so the formula and inputs are explicit. Division by zero yields 0 with an input line saying the rate is undefined.
9. **Operational Facts are a plain array** from `operationalFacts`; the page maps it to `FactStatCard`. Order is fixed by the engine.

## Risks / Trade-offs

- [Active wearers for a period longer than a month reads one month] → Fact label and inputs name the month; ADR 0015 states it; a later period picker revisits it.
- [`useSearchParams` in the shell can opt pages out of static rendering] → the dashboard is already dynamic (reads `?customer=`); wrap in Suspense per the Next docs.
- [Other customers may have sites without activity rows] → rows with zeros and a test.
- [`service_activity` has fields we ignore (`washing_pct` is unreliable per the data-quality notes)] → schema validates them strictly but no Fact uses them.

## Open Questions

- Whether `washing_pct` should be kept in the generated JSON or dropped; harmless either way, decided when writing the schema.
