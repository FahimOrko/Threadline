# dashboard-kpis Specification

## Purpose
Shows engine Facts on the dashboard as cards, each with its provenance and a way to open the math.

## Requirements

### Requirement: Replacements postponed card
The dashboard SHALL show one card for Replacements postponed for NorthStar Foods Group, full year 2025, with its value, unit, provenance chip and Show math.

#### Scenario: Card content
- **WHEN** the user opens the dashboard
- **THEN** the card shows 15 233, the ESTIMATED and SYNTHETIC chip in the uncertain tint, and a Show math control

#### Scenario: Show math content
- **WHEN** the user opens Show math
- **THEN** it lists the formula, the repair count input, assumption A002 and the baseline as not applicable

### Requirement: Range not yet modelled
Show math SHALL display the base value and SHALL mark low and high as not yet modelled for every card whose Fact has no range. Savings cards SHALL show low, base and high.

#### Scenario: Range
- **WHEN** Show math is open
- **THEN** a card without a range reads "not yet modelled" for low and high and shows the base value, and a savings card shows low, base and high

### Requirement: Data loaded on the server
The dashboard SHALL load generated data in a server component and pass it to the engine; the browser SHALL NOT fetch the data files.

#### Scenario: No client fetch
- **WHEN** the dashboard renders
- **THEN** no request for the generated JSON is made from the browser

### Requirement: Operational cards
The dashboard SHALL show one card each for Delivery sites, Active wearers, Garments in circulation, Repairs, Replacements postponed, Service requests and Service requests per 100 wearers (Dec) for the selected customer, full year 2025, each with value, unit, provenance chip and Show math.

#### Scenario: NorthStar cards
- **WHEN** the user opens the dashboard for NorthStar Foods Group
- **THEN** the cards show 24, 9 607, 31 743, 15 233, 15 233 and 515, and the per-100-wearers card shows the rate computed from 515 and 9 607

#### Scenario: Active wearers explanation
- **WHEN** the user opens Show math on Active wearers
- **THEN** it explains why the figure differs from the pack's 28 367

#### Scenario: Per 100 wearers explanation
- **WHEN** the user opens Show math on the per-100-wearers card
- **THEN** it states that the full-year service-request count is divided by the December wearers

#### Scenario: Another customer
- **WHEN** the user selects another customer
- **THEN** every card shows that customer's values and name

### Requirement: Site table
The dashboard SHALL show a table of the selected customer's sites with active wearers, garments in circulation, repairs and service requests per site for 2025, and SHALL link each site name to `/dashboard/sites/<siteId>?customer=<customerId>`. Each numeric column SHALL have its own compact ProvenanceChip in its header and its own Show math, and Show math SHALL state the column's full method and source.

#### Scenario: Rows
- **WHEN** the user opens the dashboard for NorthStar Foods Group
- **THEN** the table has 24 rows, one per site, and the columns for garments in circulation and service requests sum to 31 743 and 515

#### Scenario: Column provenance
- **WHEN** the table is shown
- **THEN** the active-wearers header carries a compact CALCULATED chip, the other three numeric headers carry compact MEASURED chips, and each header's Show math lists that column's method, source, formula and inputs

#### Scenario: Header chip by keyboard
- **WHEN** the user tabs to a header chip
- **THEN** a tooltip shows the full method and source and the column's Show math control is reachable next

#### Scenario: Row link
- **WHEN** the user follows a site name
- **THEN** the site page opens with the same `?customer=`

### Requirement: Same content for both roles
The operational cards, the money and utilization cards and the site table SHALL be identical in the KAM and Customer roles.

#### Scenario: Role switch
- **WHEN** the user switches from KAM to Customer
- **THEN** the cards and the table do not change

### Requirement: Money and utilization cards
The dashboard SHALL show, below the operational cards, one card each for Avoided purchase cost, Garment value kept in use (Dec), Cost of unused allocation (Dec, per week) and Garment utilization (Dec) for the selected customer, each with value, unit, provenance chip and Show math. Percentage values SHALL show one decimal, rounded only for display; Show math SHALL keep the exact inputs.

#### Scenario: NorthStar cards
- **WHEN** the user opens the dashboard for NorthStar Foods Group with T001 unset
- **THEN** the cards show 660 082 EUR, 1 335 527 EUR, "Needs input" and 83.5 %

#### Scenario: Percentage precision
- **WHEN** the Garment utilization card is shown for NorthStar Foods Group
- **THEN** it reads 83.5 %, and Show math lists the unrounded inputs 26 513 and 31 743 pieces

#### Scenario: Show math lists the team assumption
- **WHEN** the user opens Show math on Cost of unused allocation
- **THEN** it lists the unused pieces, T001 with its value or "not set", its unit and its note

#### Scenario: Another customer
- **WHEN** the user selects another customer
- **THEN** the four cards show that customer's values

### Requirement: Needs input instead of a number
A dashboard card whose Fact has no value SHALL show "Needs input" in place of the value, with a hint naming the missing assumption, and SHALL NOT show 0 or NaN.

#### Scenario: T001 unset
- **WHEN** the dashboard shows Cost of unused allocation while T001 is unset
- **THEN** the card reads "Needs input", names T001, keeps its amber chip and offers Show math

### Requirement: Percentage cards
The dashboard SHALL show, under a "Percentages" heading, the on-time cycle rate, one "Repairs per 100 garments (Dec)" card per product the customer has, and the recycling and reuse share of textile waste for the selected customer, each with value, provenance chip and Show math, identical for the KAM and Customer roles and following `?customer=`.

#### Scenario: Cards for a customer
- **WHEN** the user opens the dashboard for NorthStar Foods Group
- **THEN** the section shows the on-time rate (labelled as sampled cycles), a "Repairs per 100 garments (Dec)" card per product (for example 57.2 per 100 garments for Work Jacket Standard, no % sign), and the recycling and reuse share in percent; all with one decimal

#### Scenario: Display rule
- **WHEN** the cards are shown
- **THEN** every value has one decimal, and repairs per 100 garments shows "per 100 garments" with no % sign

#### Scenario: Waste share method
- **WHEN** the user opens Show math on the recycling and reuse share
- **THEN** it states that waste is allocated by washed-kg share and lists A003 and A004

#### Scenario: Another customer
- **WHEN** the user selects another customer
- **THEN** every card in the section shows that customer's values

#### Scenario: Wide screen
- **WHEN** the dashboard is viewed at 1280px in the light or dark theme
- **THEN** the cards wrap in the same grid as the other sections without clipping

### Requirement: Footprint section
The dashboard SHALL show, under a "Footprint" heading, savings vs the selected baseline (water, energy, CO2e, absolute and percent) at the selected sensitivity, the service footprint and the delivery footprint (with the net CO2e saved beside it), each with value, provenance chip and Show math, identical for both roles and following `?customer=`, `?baseline=` and `?sensitivity=`.

#### Scenario: Card number display
- **WHEN** any dashboard card shows a value
- **THEN** a value of absolute size 100 or more is a whole number, a value below 100 has one decimal, and "%" keeps one decimal, rounded only at display, while Show math inputs keep their current formatting

#### Scenario: Labels name the baseline
- **WHEN** the section is shown for local laundry, home washing or in-house laundry
- **THEN** every savings card label contains "vs local laundry", "vs home washing" or "vs in-house laundry" respectively, and the section description names the same baseline

#### Scenario: NorthStar values
- **WHEN** the user opens the dashboard for NorthStar Foods Group with the default baseline and sensitivity
- **THEN** the cards show 1 406 483 L, 171 643 kWh, 255 074 kgCO2e saved and 29.5%, 32.6%, 77.6%, a service footprint of 73 785 kgCO2e at 147 kgCO2e/t washed (7.7 per wearer), and delivery of 23 785 kgCO2e at 32.2%

#### Scenario: Selected sensitivity on the cards
- **WHEN** the user selects high
- **THEN** the savings cards show the high values, the service and delivery cards do not change, and the provenance chip on savings cards reads as assumed

#### Scenario: Delivery beside the net result
- **WHEN** the delivery group is shown for any baseline, including home washing with a zero baseline delivery factor
- **THEN** the net CO2e saved card appears in the same group as the delivery cards, and also in the saved group, rendered from the same Fact, and Show math on delivery carries the net-comparison note

#### Scenario: Data gap
- **WHEN** the delivery group is shown
- **THEN** it states that route kilometres are not in the data pack

#### Scenario: Another customer
- **WHEN** the user selects another customer
- **THEN** every card in the section shows that customer's values

#### Scenario: Wide screen
- **WHEN** the dashboard is viewed at 1280px in the light or dark theme with home washing and high selected
- **THEN** the cards wrap in the same grid as the other sections without clipping

### Requirement: Site page
The route `/dashboard/sites/[siteId]` SHALL show the site name, site type, laundry name and a back link to `/dashboard?customer=<customerId>`, then the operational, money and utilization and percentage `FactStatCard`s with site scope, each naming the site in Show math. Content SHALL be identical for the KAM and Customer roles.

#### Scenario: Site values match the table
- **WHEN** the user opens a NorthStar site from the table
- **THEN** its wearers, garments, repairs and service requests cards equal that row of the table

#### Scenario: Wide screen
- **WHEN** the page is viewed at 1280px in dark and light
- **THEN** it renders without overflow or console errors

### Requirement: Site page omissions and comparison
The site page SHALL state in one line that delivery sites, recycling and reuse share and the footprint are customer-level only, and why, and SHALL NOT show a customer-level number in their place. It SHALL show the site-versus-customer comparison for utilization (Dec) and repairs per 100 garments (Dec).

#### Scenario: Omitted facts
- **WHEN** the page is shown
- **THEN** the note names the omitted Facts and no customer-level number stands in for them

#### Scenario: Comparison
- **WHEN** the page is shown
- **THEN** utilization and repairs per 100 garments appear for the site and for the customer side by side with labels naming each

### Requirement: Site page access
The site page SHALL render the not-found page when the `siteId` is unknown or the site does not belong to the selected customer.

#### Scenario: Unknown site
- **WHEN** the `siteId` matches no site
- **THEN** the not-found page is rendered

#### Scenario: Another customer's site
- **WHEN** the site exists but belongs to a customer other than the selected one
- **THEN** the not-found page is rendered
