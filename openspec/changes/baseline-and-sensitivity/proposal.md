# Proposal

## Why

The engine already takes the baseline as a parameter, but the dashboard is fixed to local laundry and the header selector is a disabled placeholder. Slice 4 lets the KAM compare against home washing or in-house laundry and see how far the savings move under low and high assumptions, which is the credibility story the pack asks for (home washing makes delivery look bad, the local baseline is illustrative).

## What Changes

- Header baseline selector (local laundry default, home washing, in-house) stored as `?baseline=<baseline_id>`, same pattern as `?customer=` (ADR 0014): the server page resolves it, the header mirrors it, unknown falls back to the default with a visible notice, view links keep it.
- Header sensitivity selector (low, base default, high) stored as `?sensitivity=`, same pattern and fallback.
- The dashboard passes the selected baseline row to the engine instead of the default constant.
- Sensitivity: the data pack has no low/high factors, so the spread is one team assumption (T002, ±20 % on the baseline's factors, source ASSUMPTION, ADR 0016). The savings Facts fill `range.low/base/high`; the selected level is the Fact's value, so cards show it and Show math lists all three.
- Labels, section description and notes follow the selected baseline instead of the fixed "local laundry" text.
- Delivery honesty note keeps working under home washing: net CO2e saved stays in the delivery group, with a test for it.
- New ADR 0017 (baseline and sensitivity in the URL, sensitivity derivation); convention line on the baseline parameter updated.

Out of scope: mobile layout, Impact World, per-site baseline, ranges on non-savings Facts.

## Capabilities

### New Capabilities
- `baseline-sensitivity`: header selectors, URL params, fallback behaviour and the sensitivity model (spread, which Facts carry a range).

### Modified Capabilities
- `app-shell`: the baseline placeholder becomes the two selectors.
- `kpi-engine`: savings Facts carry a low/base/high range and follow the selected sensitivity.
- `dashboard-kpis`: footprint section follows the selected baseline and sensitivity; "range not yet modelled" no longer applies to savings cards.

## Impact

- Code: `src/lib/` (resolver like `customer.ts`), `src/lib/engine/footprint.ts` and `assumptions-config.ts`, `src/components/app-shell.tsx`, `src/app/dashboard/page.tsx`, `/design` gallery if a selector component is new.
- Docs: ADR 0017 and `docs/adr/README.md`, `docs/conventions.md` (baseline line), `docs/design.md` if a component is added.
- Tests: Vitest for each baseline and each sensitivity level; one Playwright + Chrome check at 1280px.
- No new dependencies.
