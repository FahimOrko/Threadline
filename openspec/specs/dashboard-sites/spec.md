# dashboard-sites Specification

## Purpose
Lets the KAM scan and order the sites of one customer in a data table, under the sites heatmap, without changing any value.

## Requirements

### Requirement: Sortable sites table
The Sites section SHALL show the site table with a name filter and sortable numeric column headers. Sorting and filtering SHALL only reorder or hide rows and SHALL NOT change any value. Each sortable header SHALL expose `aria-sort`, keep its compact provenance chip and its Show math, and be operable by keyboard. A row SHALL link to its site page. An empty filter result SHALL show an empty state that says what to do.

#### Scenario: Sort
- **WHEN** the KAM activates the utilization header
- **THEN** rows order by the engine's utilization value, the header shows `aria-sort`, and a second activation reverses it

#### Scenario: Filter
- **WHEN** the KAM types part of a site name
- **THEN** only matching rows remain and every shown value is unchanged

#### Scenario: Fits the screen
- **WHEN** the table renders at 1230px with both sidebars open
- **THEN** it shows without sideways scrolling

#### Scenario: No match
- **WHEN** the filter matches no site
- **THEN** an empty state offers to clear the filter

### Requirement: Heatmap above the table
The Sites section SHALL show the sites by month heatmap above the table, with a Utilization or Repairs toggle that changes only the heatmap. Cells SHALL be neutral by default and highlighted only where the engine marks a problem: for utilization, months below the over-allocation cut-off; for repairs, the spike months of the repair band. The title SHALL be the question the chart answers and the caption SHALL name the period (the year). The legend SHALL say what a highlighted cell means and give the cut-off or rule as words filled from engine values (tested like the intro placeholders), without the words "cut-off" or an assumption id. Hover and focus SHALL show the value and month. Sites SHALL be ordered with the most highlighted months first (ties by name) and each row SHALL link to its site page keeping the customer, baseline and sensitivity. A highlight SHALL never be the only signal: each highlighted cell SHALL carry a mark and its text alternative SHALL say "highlighted".

#### Scenario: Toggle
- **WHEN** the KAM selects "Repairs"
- **THEN** the heatmap shows repairs and the table is unchanged

#### Scenario: Utilization highlights
- **WHEN** a site's December utilization is below the cut-off
- **THEN** that cell is highlighted and a cell at or above it is neutral

#### Scenario: Repair highlights
- **WHEN** the repair band flags a site's month as a spike
- **THEN** that cell is highlighted, and no other repair cell is

#### Scenario: Order
- **WHEN** one site has three highlighted months and another has one
- **THEN** the first site's row comes first

#### Scenario: Cut-off unset
- **WHEN** the cut-off assumption has no value
- **THEN** no utilization cell is highlighted and the legend says the cut-off is not set

### Requirement: Back to sites
A site page SHALL start with a "Back to sites" button, above the site name, linking to `/dashboard/sites` with the current customer, baseline and sensitivity.

#### Scenario: Back link
- **WHEN** the KAM opens a site page with `?customer=CUST001&baseline=B_HOME&sensitivity=high`
- **THEN** the button links to `/dashboard/sites?customer=CUST001&baseline=B_HOME&sensitivity=high`

### Requirement: Site page groups
The site page SHALL show a summary panel (name, type, laundry and four figures: active wearers, garments in circulation, utilization, on-time rate), then groups by meaning: Garments and use (the site against the customer chart), Costs and service, and Repairs (a panel, one horizontal bar chart of repair rate by product with product names on its rows, and the monthly repair line). It SHALL NOT repeat a figure the comparison chart shows as a card. The note on figures not shown for a single site SHALL stay as a muted footnote.

#### Scenario: One chart for products
- **WHEN** a site has three products
- **THEN** one bar chart shows three rows and no card per product exists
