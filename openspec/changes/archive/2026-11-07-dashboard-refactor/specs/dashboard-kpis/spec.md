# dashboard-kpis Delta

## MODIFIED Requirements

### Requirement: Same content for both roles
The dashboard SHALL be for the KAM only. The same cards and tables SHALL show whichever customer is selected, and the customer view SHALL NOT reach them (see dashboard-navigation).

#### Scenario: Role switch
- **WHEN** the user switches from KAM to Customer
- **THEN** the dashboard is no longer reachable and Story opens instead

### Requirement: Observations section
The Signals section SHALL show one ObservationCard per observation of the selected customer, after its charts, with an empty state when there are none. A flagged site SHALL link to its site page keeping the `customer`, `baseline`, `sensitivity` and `view` params. The site page SHALL NOT gain an observations block.

#### Scenario: NorthStar
- **WHEN** the Signals section is opened for CUST001
- **THEN** five observations show: one value, three risks and one gap

#### Scenario: Link keeps params
- **WHEN** a site link is followed from `?customer=CUST001&baseline=home&sensitivity=high`
- **THEN** the site page opens with the same three params

#### Scenario: Other customer
- **WHEN** the customer is changed in the sidebar
- **THEN** the section shows that customer's observations

### Requirement: Site page
The route `/dashboard/sites/[siteId]` SHALL show inside the dashboard sidebar the site name, site type, laundry name and a back link to `/dashboard/sites?customer=<customerId>`, then the operational, money and utilization and percentage `FactStatCard`s with site scope, each naming the site in Show math. Content SHALL be the same for any customer-scoped KAM visit.

#### Scenario: Site values match the table
- **WHEN** the user opens a NorthStar site from the table
- **THEN** its wearers, garments, repairs and service requests cards equal that row of the table

#### Scenario: Wide screen
- **WHEN** the page is viewed at 1280px in dark and light
- **THEN** it renders without overflow or console errors
