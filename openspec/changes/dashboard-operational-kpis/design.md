# Design

## Context

Today: `generatedSource` holds four sheets; `replacementsPostponed(data, { customerId, period })` is the only engine function; `/dashboard` hard-codes `CUST001`; `AppShell` is a client component with a disabled "Customer: not selected" button. `Fact.scope` carries only the customer. See proposal.md for motivation.

Checked in the bundled Next docs: a layout does not re-render on navigation and cannot read `searchParams`; a page receives `searchParams` as a `Promise` and awaits it; `useSearchParams` is a Client Component hook, and in a prerendered route it client-renders up to the nearest Suspense boundary, so wrap its consumer in `<Suspense>`.

## Goals / Non-Goals

**Goals:**
- Add `service_activity` through the existing pipeline path with no special cases.
- Keep every number in `src/lib/engine`; the page and components only format and lay out.
- Make later changes (money, percentages, footprint) able to reuse the scope and the wearer and garment Facts unchanged.

**Non-Goals:**
- No `siteId` on `Fact.scope` (the site drill-down in change 3 decides that).
- No period picker, baseline, sensitivity or role-dependent content.

## Decisions

1. **The server page reads `?customer=` and passes the customer down.** The page awaits `searchParams`, calls `resolveCustomer` (pure, `src/lib/customer.ts`, no numbers) and hands the resolved customer, plus any rejected value for the notice, to the cards and the table. Alternative: a Zustand store like the role toggle; rejected because the page would need client-side data.
2. **The header is a client component and still reads the URL, because the layout cannot.** The root layout passes `{ id, name }[]` to `AppShell`. A small client part inside a Suspense boundary reads `useSearchParams`, runs the same `resolveCustomer` so the picker shows the same customer the page shows (including the fallback), and keeps `?customer=` on the view links. The picker only navigates: it never fetches or computes. The Suspense fallback shows a disabled picker.
3. **Picker is the shadcn Select primitive** (`npx shadcn add select`, base-nova style on `@base-ui/react`), with a visible label. It is a reusable component, so it goes to `/design` Controls and `docs/design.md` in this change. Alternative: native `<select>`; rejected by the owner for consistent styling.
4. **Period stays a constant (2025-01 to 2025-12) in one place** and every engine call takes it as an argument, so a later period picker changes the caller only.
5. **"Latest month" is `period.to`.** Active wearers and Garments in circulation read that month only; the Fact's inputs name it.
6. **Active wearers rule** (max across product rows per site, then sum) is a single helper reused by the customer Fact and the per-site rows, so the table cannot drift from the card. Show math carries a plain sentence on the 28,367 vs 9,607 difference; 28,367 is text in the explanation, not a computed value. ADR 0015 records the rule.
7. **Per-site rows are one engine call returning raw numbers plus one provenance block per numeric column** (wearers CALCULATED; garments, repairs, requests MEASURED), so each column header carries a chip and Show math and every displayed value has provenance (ADR 0004). Alternative: one chip for the whole table; rejected by the owner because wearers and the other columns differ in method.
8. **SiteTable takes rows and per-column provenance blocks,** formats via `src/lib/format`, and renders a compact ProvenanceChip and a `ShowMathPopover` in each numeric header. Inline Show math pushed the header tall and the Repairs and Requests columns off-screen, so the header uses the shadcn Popover (floating, one open at a time, Esc and outside press close it); stat cards use the same `ShowMathPopover`, so it is the only Show math pattern and the inline variant is removed (this replaces the earlier decision to keep inline Show math on cards). Cards no longer change height when opened. The popover is about 30rem wide clamped to the viewport; rows are a 1/3 label and 2/3 value grid, the formula spans the full width in mono, and long explanations are `notes` (an engine input flagged `note: true`) shown full width below the rows in sans. Mono is only for numbers, formulas and IDs, so a value is mono only when it contains a digit. Numeric columns are narrow, right-aligned and fixed-width so the table fits 1280px, with a minimum width of 40rem below which it scrolls sideways. ShowMath gets two extra input lines, Method and Source, so the full chip text lives there too. Its /design fixture is a fixed labelled string set (ADR 0010).
9. **Compact ProvenanceChip is a prop on the existing component, not a new one.** `compact` renders a `<button type="button">` (focusable, no action) holding the method glyphs in the same tone classes, with `aria-label` "Calculated, Synthetic" style text (methods then source), wrapped in the existing `Tooltip` whose label is the same text; the base-ui trigger opens on hover and on focus. Glyphs are `aria-hidden`; colour never carries meaning alone. Alternative: a separate `MethodGlyph` component; rejected to keep one chip with one tone rule. Source glyph is dropped in compact form; the source is in the label, tooltip and Show math. The compact chip has no 11rem minimum, so the header row is narrow enough to avoid forced horizontal scroll in most cases.
10. **Per-100-wearers is its own Fact** labelled "per 100 wearers (Dec)", method CALCULATED, built from the full-year Service requests value and the December Active wearers value. Its formula and inputs say a full-year count is divided by December wearers, which is a deliberate approximation. Zero wearers yields 0 with an input line saying the rate is undefined.
11. **Operational Facts are a plain array** from `operationalFacts`; the page maps it to `FactStatCard`. Order is fixed by the engine.
12. **`washing_pct` is validated and kept in the generated JSON, unused.** A comment at the schema field and a line in the rebuild runbook say its definition is unclear and it must not appear in claims until Lindström confirms.

## Risks / Trade-offs

- [Active wearers and the per-100 rate mix a Dec snapshot with a full-year count] → labels and Show math say so; ADR 0015 states it; a later period picker revisits it.
- [`useSearchParams` in the shell client-renders its subtree] → confined to a small component inside Suspense; the dashboard is already dynamic because it awaits `searchParams`.
- [Picker and page disagree on an unknown value] → both call the same `resolveCustomer`; a test asserts it.
- [Glyph-only chips are harder to read at a glance and small as touch targets] → accessible label, tooltip on hover and focus, full text in Show math; the glyph set is already used by the full chip. Checked in the running app at narrow widths and in both themes (tasks 4.3, 5.2).
- [A tooltip on a non-interactive button can read as clickable] → no pointer cursor, no action; the focus ring is the only affordance, and Show math is the interactive control beside it.
- [Other customers may have sites without activity rows] → rows with zeros and a test.
- [shadcn CLI writes files into `src/components/ui`] → review the diff; keep token colours only.
