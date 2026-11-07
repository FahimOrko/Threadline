# Proposal

## Why

The dashboard shows operational KPIs only. Slice 3 change 2a adds the money view and garment utilization for the selected customer. Two of these KPIs need values Lindström has not supplied (the rental fee), so this change also fixes the rule for team-supplied unknowns once, before washing_pct, a CO2-per-tree factor and route kilometres arrive.

## What Changes

- **Team assumptions config** `src/lib/engine/assumptions-config.ts`: plain typed data imported by the pure engine, not Zustand, not editable at runtime. Each entry has `id` (T prefix, T001+, distinct from the pack's A001 to A008), `value`, `unit`, `note` and `certainty: "assumed"`. T001 `rental_fee_per_piece_week` (EUR/piece/week) has `value: null` (unset). No placeholder number.
- **ADR 0016** (new file) records the rule, not the values, and the deviation from `docs/product-spec.md`: the product spec lists SYNTHETIC_TEAM for Cost of unused allocation, but a rental fee is an assumed parameter, not team-generated data rows, so source ASSUMPTION is accurate. The product spec is not edited. The only other docs edit for the ADR is one appended row in `docs/adr/README.md`; no existing ADR is touched.
- **Pipeline** adds the `Products` sheet (`products.csv`, strict schema, set-based header check, row validation, report line) and a referential check that fails the build when a `product_id` in repairs or service_activity is missing from products, naming the missing IDs and the sheet. The money Facts keep a runtime error as a backstop.
- **Four KPIs**, per customer through `?customer=`, full year 2025, built as Facts:
  - Avoided purchase cost = sum of `repair_count` x product purchase cost. ESTIMATED, SYNTHETIC, assumption A002.
  - Garment value kept in use (Dec) = December allocated pieces x product purchase cost. ILLUSTRATIVE, SYNTHETIC.
  - Cost of unused allocation (Dec, per week) = unused pieces x T001. ESTIMATED, source ASSUMPTION, so the existing `chipTone` renders it amber with no change to `provenance.ts`. Unused pieces = December allocated minus December `active_assets_scanned`.
  - Garment utilization (Dec) = December scanned / December allocated, in percent. CALCULATED.
- **Needs input**: a Fact whose required team assumption is unset has `value: null`. `StatCard` and `FactStatCard` show a "Needs input" state instead of 0 or NaN, keep the chip and Show math, and Show math lists the team assumption (id, "not set", unit, note). The state is added to `/design` and `docs/design.md`.
- Show math lists the team assumption's value, unit and note when set.
- Purchase cost is read from `products.csv` as SYNTHETIC data. It gets no team assumption ID and is not in the config.
- The dashboard shows a "Money and utilization" section with the four cards below the operational cards.

Out of scope (change 2b): `service_cycles`, `waste_circularity`, `customer_impacts`, on-time rate, repair rate by product, recycling and reuse share. Also out: filling in T001, admin time saved, any editing UI for assumptions, annualising the weekly cost.

## Capabilities

### New Capabilities
- `team-assumptions`: how team-supplied unknown values are held, flagged as assumed, and shown as unset instead of as a placeholder.

### Modified Capabilities
- `kpi-engine`: Fact `value` may be null when a required team assumption is unset; adds the four Facts and their list.
- `data-pipeline`: adds the `products` sheet to the scope of sheets.
- `dashboard-kpis`: adds the money and utilization cards and extends the same-content-for-both-roles rule to them.
- `provenance-display`: `FactStatCard` renders a Fact without a value as "Needs input".
- `design-system`: adds the StatCard "Needs input" state to the component set and gallery.

## Impact

- Code: `src/lib/engine/` (new config and value Facts, `fact.ts` widened), `src/lib/data/` (schema, pipeline, generated source), `scripts/build-data.ts`, `src/components/stat-card.tsx`, `src/components/fact-stat-card.tsx`, `src/app/dashboard/page.tsx`, `/design` page and sample folder.
- Docs: new `docs/adr/0016-*.md`, `docs/adr/README.md` (one appended row), `docs/design.md`, `docs/conventions.md`, `docs/runbooks/rebuild-data.md`. The last three go beyond the ADR scope; the project rules require them in the same change, drop them if you disagree.
- Tests: Vitest for the schema, pipeline, each Fact (including unset T001), `FactStatCard` and `StatCard` needs-input.
- Dependencies: none.

## Done when

- ADR 0016 exists as a new file (stating the ASSUMPTION vs SYNTHETIC_TEAM deviation and its reason) with one appended index row; `git diff` shows no other ADR changed, and the ADR contains no assumption value, so setting T001 later needs no ADR edit.
- `assumptions-config.ts` has the `TeamAssumption` type and T001 with `value: null`.
- `npm run data:build` loads `products` (6 rows, 0 invalid) and a header mismatch on it fails the build. A `product_id` in repairs or service_activity that is missing from products also fails the build, naming the IDs and the sheet.
- NorthStar sanity checks from the independent recomputation (not pack acceptance values): avoided purchase cost 660 082 EUR, garment value kept in use 1 335 527 EUR, 5 230 unused pieces, utilization 83.5%. Any disagreement is investigated and reported, never forced.
- Cost of unused allocation shows "Needs input" while T001 is unset (no 0, no NaN); with a value set in a test it equals unused pieces x the fee. Its chip is amber and Show math lists T001, its unit and note.
- Cards follow `?customer=`, are identical in KAM and Customer roles, and the browser never fetches the generated JSON.
- Needs-input state is in `/design` and `docs/design.md`.
- A real-browser run (Playwright + Chrome) passes in dark and light themes: customer switching, needs-input card, popovers.
- `npm run data:build`, `npm test`, `npm run lint`, `npm run build`, both `check:*` scripts and `openspec validate --strict` pass.
