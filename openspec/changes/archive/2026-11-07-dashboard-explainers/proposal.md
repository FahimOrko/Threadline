## Why

The dashboard shows figures and charts a customer cannot read without a guide: jargon ("Critical dormant", "Set T001 in the assumptions config", "Share of home washing"), a waterfall that needs explaining, a heatmap whose colour means only "higher", and observation cards that repeat site names and carry assumption ids. The KAM needs every figure to explain itself in meeting language, with the math kept in Show math.

## What Changes

1. **Info "i" popover** on every card, panel figure and chart whose meaning is not obvious. Text is fixed template text in one registry (`src/lib/explain.ts`) keyed by Fact id or chart/panel id; numbers only as `{{fact:id}}` tokens. Separate from Show math. Recorded in a new ADR (0028).
2. **CO2e chart redesign**: the waterfall becomes one bar for the comparison and one stacked bar (process + delivery) for the service, the gap labelled as the net saving, with a plain sentence above it. Home washing states it has no delivery emissions. The waterfall component and engine steps are removed.
3. **Sites heatmap**: neutral cells; highlighted only for a problem (utilization below the over-allocation cut-off; repair-spike months from `repairBand`). Question titles, a legend that says what a highlight means, sites with most highlighted months first, rows link to site pages with params. Highlights are engine output.
4. **Signals wording**: plain titles, texts and actions; jargon moves to Show math; no site names in the sentence (they are the links below); no severity badge on value highlights; severity words capitalised.
5. **Labels**: "Share of home washing" becomes "Less than home washing" (resolved from the comparison); "Set T001 in the assumptions config" becomes "Needs a rental fee from Lindström"; remaining jargon fixed (table below).
6. **Recycling breakdown restored**: recycling panel shows waste by treatment (recycling, reuse, energy recovery, incineration) as a part-of-whole bar.
7. **Flaky test**: `tests/story-print.test.tsx` timeout fixed at its cause (the cold import of the story document, now warmed once in `beforeAll`).
8. **Review round 2 (accepted G1 to G5, plus):** unset values never read mid-sentence ("cost Needs input"): sentences carry a missing-case variant; the Garments intro grammar ("pieces garments") fixed and all intros scanned for unit-plus-noun duplication; remaining on-screen jargon ("Cut-off T007", "(T007)", "Critical dormant", "Baseline values are illustrative") replaced and "T007", "Critical", "dormant", "baseline", "cut-off" added to the banned test; hatching reserved for missing values (the Garments in use panel's hatched bar is gone); one placeholder panel replaces the per-site unused-cost chart while the rental fee is unset; "+N more" is a tested link to the Signals page with params; trend badges read "+10.3% Oct–Dec vs Jul–Sep" on the figure they belong to; the Service quality panel puts its ring beside the hero and its stats beside both; the story game's "Set T001 in the assumptions config" line is plain words too.

### Gaps (all accepted in review round 2)

| # | Gap | Why | Recommendation |
|---|---|---|---|
| G1 | The sentence over the CO2e chart needs the comparison's total as a `{{fact:…}}` token, and no such Fact exists (only the saving and the service total). | Every displayed value needs provenance (ADR 0004); tokens resolve only from Facts. | Promote the existing `cmp.metrics.co2e.comparison` to a Fact `comparison_footprint` (same totals as the saving; no new formula; test: comparison = service + net saving). |
| G2 | The recycling breakdown by four treatments needs allocated kg per treatment; `wasteSplit` returns only total and recycled-or-reused. | Same formula as today (allocated kg × treatment kg ÷ laundry total, A003), split four ways. | Extend `wasteSplit` to return the four parts; the existing recycled-or-reused share stays equal to recycling + reuse (tested). |
| G3 | "Home washing has no delivery emissions" must come from data, not a baseline-id check in a component. | Conventions: no logic about numbers in components. | Expose the comparison's delivery total (`comparisonDelivery`) on `FootprintComparison`; the page shows the note when it is 0. |
| G4 | The legend needs the over-allocation cut-off and the repair rule's ratio and window, which are not Facts. | Not Facts, so not `{{fact}}` tokens. | Fill legend words from `overAllocationCutoffPercent()` and the repair assumptions, like `{customer}` and `{period}` in intros; formatted by `src/lib/format`. |
| G5 | The utilization heatmap highlights every month below the cut-off, but "Sites with more garments than needed" counts December only. | Different questions: "when" versus "now". | Accepted: titles, captions and legends say which period each figure covers (the year, December, the full year). |

## Capabilities

### New Capabilities
- `explainers`: the "i" popover, the explanation registry, the banned-wording and no-digit rules, and the coverage list.

### Modified Capabilities
- `dashboard-charts`: CO2e comparison chart replaces the waterfall; chart types; recycling breakdown; question titles.
- `dashboard-overview`: trend indicator wording and placement; "+N more" link.
- `dashboard-sites`: heatmap highlights, titles, legend, ordering and links.
- `kpi-engine`: footprint comparison (no waterfall, comparison Fact, comparison delivery, four-way waste); site-by-month matrix highlights.
- `observations`: plain wording, no site names or ids in text, no severity on value items.
- `dashboard-kpis`: needs-input hint in plain words.
- `dashboard-sections`: intros and labels free of jargon.
- `design-system`: InfoPopover component, ObservationCard change.

## Impact

- Code: `src/lib/explain.ts` (new), `src/components/info-popover.tsx` (new), `figure-panel`, `chart-frame`, `fact-stat-card`, `observation-card`, `heatmap`, `charts-simple` (remove `Waterfall`, add comparison bars), `src/lib/engine/{footprint,series,percentage,observations}.ts`, dashboard pages, `src/lib/dashboard.ts`, `/design` gallery, `tests/`.
- Docs: new ADR 0028 plus index; `docs/design.md`; `docs/conventions.md`. `docs/product-spec.md` untouched.
- No new dependency. Phosphor `Info` icon, existing `Popover`.
- **BREAKING (internal)**: `FootprintComparison.waterfall` and `WaterfallStep` are removed.

## Review tables

### A. Cards and panels that get an "i" (explanation registry)

`{comparison}` is the selected comparison in words ("home washing"). `{{fact:id}}` is a token. No digits appear outside tokens. Active wearers, garments in circulation and delivery sites get no "i" (obvious from the label).

| Key | Where | Draft explanation |
|---|---|---|
| `water_saved` | Footprint, Overview | Water the service did not use compared with {comparison}: {{fact:water_saved}} this year. It is the easiest environmental benefit for the customer to quote in their own reporting. |
| `water_saved_pct` | Footprint ring | The same saving as a share of what {comparison} would have used: {{fact:water_saved_pct}} less. Handy when the customer wants a percentage rather than litres. |
| `energy_saved` | Footprint, Overview | Energy the service did not use compared with {comparison}: {{fact:energy_saved}}. Lower energy use also lowers the customer's indirect emissions. |
| `energy_saved_pct` | Footprint ring | The energy saving as a share of what {comparison} would have used: {{fact:energy_saved_pct}} less. |
| `co2e_saved` | Footprint, Overview | Emissions avoided compared with {comparison}: {{fact:co2e_saved}}. It is "net" because delivery is counted, so the figure still holds if the customer asks about the trucks. |
| `co2e_saved_pct` | Footprint ring | The net CO2e saving as a share of what {comparison} would have emitted: {{fact:co2e_saved_pct}} less. |
| `chart:co2e-comparison` | Footprint chart | What {comparison} would emit next to what the service emitted, washing and delivery together. The gap is the net saving: it shows where the customer's saving comes from, even after delivery. |
| `chart:water-energy-co2e` | Footprint chart | Water, energy and CO2e for {comparison} and for the service, side by side. Lets the customer see all three savings at once. |
| `service_footprint` | Footprint panel | All emissions from washing and delivering this customer's garments: {{fact:service_footprint}}. It is the full cost to the climate, not only the saving. |
| `service_footprint_per_tonne` | Footprint stat | Emissions for each tonne of laundry washed. Lets the customer compare with another service of a different size. |
| `service_footprint_per_wearer` | Footprint stat | Emissions for each person who wore the garments. Makes the footprint easy to relate to headcount. |
| `delivery_footprint` | Footprint panel | Emissions from the trucks that carry garments to and from the laundry: {{fact:delivery_footprint}}. Customers often ask about transport; this answers it. |
| `delivery_share` | Footprint stat | The part of the service's emissions that comes from delivery rather than washing: {{fact:delivery_share}}. A large share means further cuts lie in transport, not washing. |
| `recycling_reuse_share` | Footprint panel | The share of worn-out textiles that is recycled or reused instead of burned or dumped: {{fact:recycling_reuse_share}}. Supports the customer's waste goals. |
| `avoided_purchase_cost` | Costs, Overview | An estimate of what the customer did not have to spend on new garments because repairs kept old ones in use: {{fact:avoided_purchase_cost}}. It is a good point for a cost conversation. |
| `replacements_postponed` | Costs, Garments | How many garments did not need replacing yet because we repaired them: {{fact:replacements_postponed}}. We count each repair as one replacement put off. That is an estimate, so treat it as a fair indication, not an audited figure. |
| `garment_value_kept_in_use` | Costs, Overview | What the garments now in use would cost to buy new: {{fact:garment_value_kept_in_use}}. It is illustrative because it uses the example purchase prices in the data, not Lindström's real prices. It shows scale, not money saved. |
| `cost_of_unused_allocation` | Costs | What garments set aside but not used cost each week. We need a rental fee from Lindström before we can show it; we show "Needs input" rather than guess, so the customer is never misled. |
| `garment_utilization` | Garments, Overview | The share of garments set aside for wearers that were actually in use in December: {{fact:garment_utilization}}. Low use means the customer pays for garments nobody wears. |
| `repairs` | Garments, Overview | How many garments were repaired this year: {{fact:repairs}}. Repair keeps garments in service and avoids new purchases. |
| `repairs_per_100_garments` | Garments stat | Repairs relative to the number of garments, so sites and products of different size can be compared fairly. |
| `service_requests` | Garments stat | Requests the customer made to Lindström this year, such as a missing size or a change. A rising number can point to a gap in the service. |
| `service_requests_per_100_wearers` | Garments stat | Requests relative to the number of wearers, so sites of different size can be compared. |
| `on_time_cycle_rate` | Garments, Overview | The share of wash cycles finished when promised: {{fact:on_time_cycle_rate}}. It tells the customer whether they could count on clean garments on time. |
| `dormant_critical_sites` | Overview, Signals | The number of sites where garments went a very long time between pickups: {{fact:dormant_critical_sites}}. It points to garments that may be stored rather than worn. This is about sites, never individual wearers. |
| `over_allocated_sites` | Overview, Signals | The number of sites where fewer garments were in use than were set aside: {{fact:over_allocated_sites}}. The customer could move or return garments and cut cost. |
| `repair_spike_sites` | Overview, Signals | The number of sites where repairs in a month jumped well above normal: {{fact:repair_spike_sites}}. Something changed there and it deserves a question. |
| `panel:needs-attention` | Overview panel | The three things most worth raising in a meeting. Each links to the sites involved. |
| `chart:measure-trend` | Overview chart | How water, CO2e, avoided cost and utilization moved month by month. Shows whether results are steady or changing. |
| `chart:utilization-by-site` | Garments chart | December use at each site, lowest first, against the line below which garments count as under-used. Shows where to rebalance. |
| `chart:repair-by-product` | Garments, site page | Which products are repaired most, relative to how many exist. Points to products that may need to be sturdier. |
| `chart:repair-trend` | Garments, site page | Repairs month by month. Shows whether the repair load is rising or falling. |
| `chart:unused-cost-by-site` | Costs chart | Where garments set aside but not used cost the most per week. Needs the rental fee from Lindström. |
| `chart:avoided-by-site` | Costs chart | Where repairs avoided the most new purchases this year (estimate). |
| `chart:avoided-trend` | Costs chart | Avoided purchases month by month (estimate). |
| `chart:dormant-by-site` | Signals chart | Gaps between pickups at each site, grouped by how long garments waited. Counts gaps, never people. |
| `chart:repair-spike` | Signals chart | A site's repairs by month. The dashed line marks the level above which a month counts as a spike. |
| `chart:heatmap-utilization` | Sites heatmap | Each cell is a site in a month. Highlighted cells are months when fewer garments were in use than were set aside. It shows where and when garments were under-used. |
| `chart:heatmap-repairs` | Sites heatmap | Each cell is a site in a month. Highlighted cells are months when repairs jumped well above the site's usual level. |
| `chart:site-vs-customer` | Site page chart | How this site compares with all the customer's sites on the main figures. Shows whether the site is typical. |

### B. Signals wording, old and new

Jargon (assumption ids, tiers, cut-off, trailing average) stays only in each Fact's Show math, listed under the card as before. The "Flagged sites" links stay; site names leave the sentence.

| Observation | Old | New |
|---|---|---|
| Replacements postponed (value; severity badge removed) | **Repairs are keeping garments in use.** Completed repairs postponed garment replacements, an estimate under assumption A002. *Action:* Use it as a value point in the review: repair is working. | **Repairs are saving you from buying new garments.** Every garment we repaired is one you did not have to replace yet. This is an estimate: we count each repair as one replacement put off. *Action:* Mention it in the review as proof that repairing pays off. |
| Dormant (risk, High) | **Garments left unused for a long time.** Garments at {names} went through a pickup gap in the Critical dormant tier. This is a site-level hygiene and availability discussion point; it says nothing about individual wearers. *Action:* Raise it with the site manager and agree whether the garments are in use or need to be collected. | **Some garments are sitting unused for a long time.** At these sites garments went a very long time between pickups. That can mean they are stored but not worn, or are not reaching the people who need them. This is about hygiene and availability at the site, not about individual wearers. *Action:* Ask the site manager whether these garments are still needed or should be collected. |
| Over-allocation (risk, Medium) | **Garments allocated but not used.** Utilization at {names} is below the cut-off in the last month, so more garments are allocated than are scanned. *Action:* Discuss rebalancing between sites or reducing the allocation. | **More garments than people are using.** At these sites, fewer garments were in use last month than were set aside for them. *Action:* Talk about moving garments to a site that needs them, or setting aside fewer. |
| Repair spike (risk, Medium) | **Repairs rose above the site's own trend.** Monthly repairs at {names} rose well above the site's trailing average in at least one month. *Action:* Ask what changed at the site, and whether a heavier-duty product or design feedback is worth discussing. | **Repairs jumped at some sites.** At these sites, repairs in at least one month were far above what is normal for them. *Action:* Ask what changed, for example a new task or tougher conditions, and whether a sturdier garment would help. |
| Rental fee missing (gap, Medium) | **Cost of unused allocation cannot be shown.** The rental fee per piece is not set, so the cost of unused garments is not computed. *Action:* Ask Lindström for the rental fee (T001) before the review. | **We cannot yet put a price on unused garments.** To show what they cost, we need the weekly rental fee per garment, and we do not have it yet. *Action:* Ask Lindström for the rental fee before the review. |
| Sites not classified (gap, Low) | **Some sites have no dormant tier.** {names} have a site type with no dormant tier row, so their dormant garments are not classified. *Action:* Agree a tier row for the site type, or leave these sites out of the dormant discussion. | **Some sites cannot be checked for unused garments.** For these sites we do not know what kind of workplace they are, so we cannot tell how long is too long between pickups. *Action:* Agree with Lindström how to treat these sites, or leave them out of the unused-garment discussion. |

Severity badge shows "Low", "Medium" or "High" (accessible name "High severity"); value highlights show no severity.

### C. Labels and intros

| Where | Old | New |
|---|---|---|
| Footprint ring caption | Share of {short} | Less than {short} (e.g. "Less than home washing") |
| Needs-input hint (cards, panels) | Set T001 in the assumptions config. See Show math. | Needs a rental fee from Lindström. T001 stays in Show math. |
| Footprint, Overview | CO2e saved, net | CO2e saved, after delivery |
| Overview, Signals | Sites with Critical dormant garments | Sites with garments unused too long |
| Overview, Signals | Over-allocated sites | Sites with more garments than needed |
| Costs | Unused allocation, per week | Cost of unused garments, per week |
| Garments / Overview bullet | Cut-off T007 | Under-use line |
| Garments chart caption | The tick is the over-allocation cut-off (T007); the shaded part is below it. | The tick is the line below which garments count as under-used; the shaded part is below it. |
| Signals dormant chart | Pickup gaps per site by tier: Watch, Risk and Critical, counted separately. Parts Watch / Risk / Critical | Gaps between pickups per site, grouped by how long garments waited. Parts Long / Very long / Too long (Show math keeps the original names) |
| Footprint intro | "...using the {sensitivity}... Baseline values are illustrative..." | "...using the {sensitivity} estimate... The comparison figures are illustrative..." |
| Sites heatmap title | Which site-months stand out? | Where and when were garments under-used? / Where and when did repairs spike? |
| Site-page scan | Mentions of tier, cut-off, baseline | Same replacements; a test fails on banned words in intros, labels and explanations |

Scan result: banned words (Fact, T-ids, A-ids, "baseline factor", "assumptions config", tier, "trailing average", "cut-off" outside the heatmap legend) are searched for across `src/lib/dashboard.ts`, the dashboard pages and the registry; fixes beyond this table are added during apply and listed in the change's final summary.

The story game's "Set T001 in the assumptions config" line is included (decision, round 2).
