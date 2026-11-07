## MODIFIED Requirements

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

## ADDED Requirements

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
