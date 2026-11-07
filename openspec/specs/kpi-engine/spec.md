# kpi-engine Specification

## Purpose
Computes every displayed number as a Fact with provenance, in pure code that runs unchanged in the browser and on the server, so numbers are reproducible and explainable.

## Requirements

### Requirement: Pure and isomorphic engine
Engine code SHALL receive its data as an argument and SHALL NOT read files, use server-only modules or format values for display.

#### Scenario: Same result everywhere
- **WHEN** the same data and arguments are given in the browser and on the server
- **THEN** the engine returns identical Facts

### Requirement: Fact shape
Each Fact SHALL carry id, label, value (a raw number, or null when a required team assumption is unset), unit, methods, source, assumption IDs, confidence, formula, inputs, scope, period and baseline. Methods and source SHALL use the existing provenance types.

#### Scenario: Fact has provenance
- **WHEN** the engine returns any Fact
- **THEN** it has at least one method, a source, a formula and a scope

#### Scenario: Value missing for an unset assumption
- **WHEN** a Fact needs a team assumption whose value is null
- **THEN** its value is null, never 0 or NaN, and its inputs list the unset assumption

### Requirement: Replacements postponed
The engine SHALL compute Replacements postponed for a customer and a period as the sum of `repair_count` over the customer's repairs rows in that period, with methods ESTIMATED, source SYNTHETIC and assumption A002.

#### Scenario: NorthStar full year 2025
- **WHEN** the engine runs for CUST001 over 2025-01 to 2025-12
- **THEN** the value is 15 233 and the unit is replacements

#### Scenario: Other customer
- **WHEN** the engine runs for another customer id
- **THEN** only that customer's rows are summed

#### Scenario: Unknown customer
- **WHEN** the customer id has no rows
- **THEN** the value is 0 and the Fact's inputs state zero rows were found

### Requirement: Cross-check against the sheet
The engine SHALL NOT use `estimated_replacements_postponed` as its source; the pipeline cross-checks it.

#### Scenario: Computed from repair_count
- **WHEN** a row's two columns disagree
- **THEN** the Fact still uses `repair_count`

### Requirement: Delivery sites
The engine SHALL compute Delivery sites as the number of sites of the customer, with method MEASURED.

#### Scenario: NorthStar
- **WHEN** the engine runs for CUST001
- **THEN** the value is 24 and the unit is sites

### Requirement: Active wearers
The engine SHALL compute Active wearers for the latest month of the period as the maximum of `active_wearers` across product rows per site, summed over the customer's sites, with method CALCULATED. The Fact's inputs SHALL state the month used and SHALL explain that summing across product rows double-counts wearers.

#### Scenario: NorthStar December 2025
- **WHEN** the engine runs for CUST001 over 2025-01 to 2025-12
- **THEN** the value is 9 607

#### Scenario: Difference from the pack
- **WHEN** the Active wearers Fact is shown with its math
- **THEN** it states that the pack's `sample_output.csv` shows 28 367 because it sums across product rows, and that this figure is not used

#### Scenario: Customer with no rows
- **WHEN** the customer has no service-activity rows in the latest month
- **THEN** the value is 0 and the inputs state zero rows were found

### Requirement: Garments in circulation
The engine SHALL compute Garments in circulation as the sum of `allocated_pieces` for the customer in the latest month of the period, with method MEASURED.

#### Scenario: NorthStar December 2025
- **WHEN** the engine runs for CUST001 over 2025-01 to 2025-12
- **THEN** the value is 31 743 and the unit is pieces

### Requirement: Repairs
The engine SHALL compute Repairs as the sum of `repair_count` for the customer in the period, with method MEASURED.

#### Scenario: NorthStar 2025
- **WHEN** the engine runs for CUST001 over 2025-01 to 2025-12
- **THEN** the value is 15 233 and the unit is repairs

### Requirement: Service requests
The engine SHALL compute Service requests as the sum of `service_requests` for the customer in the period, with method MEASURED, and Service requests per 100 wearers (Dec) as the full-year sum divided by the Active wearers of the latest month times 100, with method CALCULATED. The per-100 Fact's label SHALL read "per 100 wearers (Dec)" and its inputs SHALL state that a full-year count is divided by December wearers.

#### Scenario: NorthStar 2025
- **WHEN** the engine runs for CUST001 over 2025-01 to 2025-12
- **THEN** Service requests is 515

#### Scenario: Per 100 wearers (Dec)
- **WHEN** the engine runs for CUST001 over 2025-01 to 2025-12
- **THEN** the value is 515 divided by 9 607 times 100, the label contains "per 100 wearers (Dec)" and the inputs say the full-year count is divided by December wearers

#### Scenario: No wearers
- **WHEN** Active wearers is 0
- **THEN** Service requests per 100 wearers has value 0 and its inputs state that the rate is undefined without wearers

### Requirement: Operational facts list
The engine SHALL provide one call that returns, for a customer and period, the Delivery sites, Active wearers, Garments in circulation, Repairs, Replacements postponed, Service requests and Service requests per 100 wearers (Dec) Facts in that order, each with provenance.

#### Scenario: List content
- **WHEN** the call runs for a customer and period
- **THEN** it returns seven Facts, each with at least one method, a source, a formula and a scope

### Requirement: Per-site operational figures
The engine SHALL return, for a customer and period, one row per site of the customer with active wearers (same rule as the customer-level Fact, applied to one site), garments in circulation, repairs and service requests, together with one provenance block (methods, source, formula, inputs) per numeric column: active wearers CALCULATED, the other three MEASURED. A site with no rows SHALL appear with zeros.

#### Scenario: Rows reconcile with the customer Facts
- **WHEN** the engine runs for CUST001 over 2025-01 to 2025-12
- **THEN** there are 24 rows and their wearers, garments, repairs and service requests sum to 9 607, 31 743, 15 233 and 515

#### Scenario: Site without activity
- **WHEN** a site has no service-activity rows
- **THEN** its row shows zeros rather than being dropped

### Requirement: Avoided purchase cost
The engine SHALL compute Avoided purchase cost for a customer and period as the sum over the customer's repairs rows of `repair_count` times the product's `synthetic_purchase_cost_eur`, with method ESTIMATED, source SYNTHETIC and assumption A002. It SHALL fail with a clear error when a row's product is missing from the products data.

#### Scenario: NorthStar full year 2025
- **WHEN** the engine runs for CUST001 over 2025-01 to 2025-12
- **THEN** the value is 660 082 and the unit is EUR (an independent recomputation, not a pack value)

#### Scenario: Unknown product
- **WHEN** a repairs row names a product that is not in the products data
- **THEN** the engine raises an error naming the product

### Requirement: Garment value kept in use
The engine SHALL compute Garment value kept in use (Dec) as the sum of `allocated_pieces` times the product's `synthetic_purchase_cost_eur` for the customer in the latest month of the period, with method ILLUSTRATIVE and source SYNTHETIC.

#### Scenario: NorthStar December 2025
- **WHEN** the engine runs for CUST001 over 2025-01 to 2025-12
- **THEN** the value is 1 335 527 and the unit is EUR (an independent recomputation, not a pack value)

### Requirement: Garment utilization
The engine SHALL compute Garment utilization (Dec) as the sum of `active_assets_scanned` divided by the sum of `allocated_pieces` for the customer in the latest month of the period, times 100, with method CALCULATED and unit %.

#### Scenario: NorthStar December 2025
- **WHEN** the engine runs for CUST001 over 2025-01 to 2025-12
- **THEN** the value is about 83.5 (26 513 of 31 743)

#### Scenario: No allocation
- **WHEN** the customer has no allocated pieces in the latest month
- **THEN** the value is 0 and the inputs state that utilization is undefined without allocated pieces

### Requirement: Cost of unused allocation
The engine SHALL compute Cost of unused allocation (Dec, per week) as unused pieces times team assumption T001, where unused pieces is December `allocated_pieces` minus December `active_assets_scanned`, with method ESTIMATED and source ASSUMPTION. While T001 is unset the value SHALL be null and the inputs SHALL still show the unused pieces.

#### Scenario: T001 set
- **WHEN** T001 has a value and the engine runs for CUST001
- **THEN** the value is 5 230 times that value, in EUR per week

#### Scenario: T001 unset
- **WHEN** T001 is null
- **THEN** the value is null, the inputs show 5 230 unused pieces and T001 as not set, and the unit is EUR per week

### Requirement: Value facts list
The engine SHALL provide one call that returns, for a customer and period, the Avoided purchase cost, Garment value kept in use, Cost of unused allocation and Garment utilization Facts in that order, each with provenance.

#### Scenario: List content
- **WHEN** the call runs for a customer and period
- **THEN** it returns four Facts, each with at least one method, a source, a formula and a scope

### Requirement: On-time cycle rate
The engine SHALL compute the on-time cycle rate for a customer as ON_TIME cycles divided by all cycles over the customer's sites, as a percentage, with method MEASURED and source SYNTHETIC, labelled as a rate over sampled cycles. A customer with no cycles SHALL have no such Fact.

#### Scenario: Rate and label
- **WHEN** the engine runs for a customer with cycles
- **THEN** the Fact value is ON_TIME cycles / cycles x 100, its label and Show math inputs state "sampled cycles", and its inputs list both counts

#### Scenario: Customer isolation
- **WHEN** the engine runs for another customer
- **THEN** only that customer's sites are counted

### Requirement: Repairs per 100 garments by product
The engine SHALL compute, for each product the customer has December allocated pieces for, the full-year repair count divided by December allocated pieces, multiplied by 100, with unit "per 100 garments" (not "%"), labelled "Repairs per 100 garments (Dec)", with method CALCULATED and source SYNTHETIC. A product without December allocation SHALL have no Fact.

#### Scenario: Per product
- **WHEN** the engine runs for a customer
- **THEN** it returns one Fact per product with December allocation, each with that product's repair count and allocated pieces as inputs

#### Scenario: Basis stated
- **WHEN** Show math is opened on a repairs-per-100-garments Fact
- **THEN** it states that full-year repairs are divided by December allocated pieces and that it counts repair events, so one garment can be repaired more than once

### Requirement: Recycling and reuse share of textile waste
The engine SHALL compute the share of the customer's allocated textile waste that is recycled or reused as the sum over the customer's laundry-months of allocated waste kg times (recycling_kg + reuse_kg) / textile_waste_total_kg, divided by the customer's total allocated waste kg, as a percentage, with methods ALLOCATED and ESTIMATED, source SYNTHETIC and assumptions A003 and A004. Its formula text SHALL say waste is allocated to the customer by washed-kg share.

#### Scenario: Share
- **WHEN** the engine runs for a customer
- **THEN** the value is between 0 and 100, its inputs list allocated kg and recycled-or-reused kg, and A003 and A004 are in its assumption IDs

#### Scenario: Missing laundry-month (backstop)
- **WHEN** data that bypassed the build gives a customer allocated waste for a laundry-month that has no waste_circularity row
- **THEN** the engine throws an error naming the laundry and month instead of returning a number

### Requirement: Savings vs a baseline
The engine SHALL compute, for a customer, a baseline and a sensitivity level passed as arguments, the water, energy and CO2e saved as washed kg x (baseline factor - laundry factor) over the customer's laundry-months, and each as a percentage of washed kg x baseline factor (methods ALLOCATED and ESTIMATED). Labels SHALL name the baseline. Each Fact SHALL carry range low, base and high, and its value SHALL be the entry of the selected level.

#### Scenario: NorthStar against local laundry
- **WHEN** the engine runs for CUST001 with the local laundry baseline at base
- **THEN** it returns 1 406 483 L, 171 643 kWh and 255 074 kgCO2e saved, and 29.5%, 32.6% and 77.6%, and every label contains "vs local laundry"

#### Scenario: Formula inputs
- **WHEN** the CO2e saving is computed
- **THEN** the baseline factor is process plus delivery per kg, and the precomputed "vs local" columns are not read

#### Scenario: Another baseline
- **WHEN** the engine runs with the home washing or in-house baseline
- **THEN** the values use that baseline's factors and every label names it ("vs home washing", "vs in-house laundry")

#### Scenario: Each sensitivity level
- **WHEN** the engine runs at low, base and high for the same baseline
- **THEN** the values equal range.low, range.base and range.high, and they equal the saving computed with baseline factors scaled by 0.8, 1 and 1.2

#### Scenario: No washed kg
- **WHEN** a customer has no washed kg
- **THEN** no savings Fact is returned

#### Scenario: Range
- **WHEN** a service footprint or delivery Fact is returned
- **THEN** its `range.base` equals its value, `range.low` and `range.high` are null, and its value is never null; savings Facts carry all three

#### Scenario: Illustrative baseline note
- **WHEN** Show math is opened on a CO2e saved Fact for any baseline
- **THEN** it notes that the baseline factors are marked illustrative in the pack and may sit far above the laundries' own factors, which drives the high percentage

#### Scenario: Missing laundry-month (backstop)
- **WHEN** data that bypassed the build lacks a laundry-month the customer needs
- **THEN** the engine throws an error naming the laundry and month instead of returning a number

### Requirement: Service footprint
The engine SHALL compute the customer's service footprint as allocated process plus delivery emissions (washed kg x laundry factors), as a total in kgCO2e, per tonne washed (kgCO2e/t), and per active wearer (Dec), with method ALLOCATED, source SYNTHETIC.

#### Scenario: NorthStar
- **WHEN** the engine runs for CUST001
- **THEN** the total is 73 785 kgCO2e and per tonne washed is 147 kgCO2e/t, and per wearer divides the full-year total by the December wearers and is labelled "(Dec)"

#### Scenario: No wearers
- **WHEN** a customer has no December wearers
- **THEN** the per-wearer Fact is omitted, not 0 or NaN

### Requirement: Delivery footprint
The engine SHALL compute allocated delivery emissions and their share of total service emissions, and the delivery Fact SHALL state the laundry delivery factor against the baseline's and the note that a baseline with zero delivery makes delivery alone look worse, to be read with the net comparison. Route kilometres SHALL be stated as a data gap and SHALL NOT be estimated.

#### Scenario: NorthStar
- **WHEN** the engine runs for CUST001
- **THEN** delivery is 23 785 kgCO2e and its share is 32.2%

#### Scenario: Honesty and data gap
- **WHEN** Show math is opened on the delivery Fact
- **THEN** it lists both delivery factors, the net-comparison note and the route-kilometre data gap

### Requirement: Savings agree with the precomputed columns
The engine totals per customer SHALL be checked in tests against the sums of the pack's allocated and "vs local" columns, and any disagreement SHALL be reported, not forced.

#### Scenario: Cross-check
- **WHEN** the test compares engine totals with the pack columns for each customer
- **THEN** they agree within 0.1% or the test fails showing both numbers

### Requirement: Site scope
The engine SHALL accept an optional `siteId` in the scope. With it, the operational, money and utilization, on-time and per-product repair Facts SHALL filter their rows by customer and site, carry the site in `scope`, and use the same formulas and provenance as at customer level. Without it, results SHALL NOT change. Delivery sites, recycling and reuse share and the footprint Facts SHALL NOT be computed at site level.

#### Scenario: Sites add up
- **WHEN** wearers, garments, repairs and service requests are computed for each NorthStar site
- **THEN** their sums equal the customer-level Facts

#### Scenario: Other customer's site
- **WHEN** a site id is combined with a customer it does not belong to
- **THEN** every site Fact is zero or omitted and no other customer's rows are counted

#### Scenario: No site id
- **WHEN** the scope has no `siteId`
- **THEN** every existing Fact keeps its value

### Requirement: Site comparison
The engine SHALL return, for a site, pairs of Facts for garment utilization (Dec) and repairs per 100 garments (Dec, all products) for the site and for its customer, the second being full-year repairs over December garments in circulation x 100, CALCULATED, SYNTHETIC. A rate with no garments SHALL be omitted.

#### Scenario: Pair values
- **WHEN** the comparison is computed for a site
- **THEN** the site Fact equals the site's scanned over allocated pieces and the customer Fact equals the customer's, each recomputed independently from the CSVs in the test

#### Scenario: No garments
- **WHEN** a site has no allocated pieces in the last month
- **THEN** its repairs-per-100 Fact is omitted and utilization is 0 with the undefined note
