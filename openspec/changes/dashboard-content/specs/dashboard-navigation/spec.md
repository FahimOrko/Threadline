# dashboard-navigation Delta

## MODIFIED Requirements

### Requirement: Sidebar and section routes
The app sidebar SHALL show one link per dashboard section, each a subroute under `/dashboard`: Overview (`/dashboard`), Garments and utilization (`/dashboard/garments`), Costs (`/dashboard/costs`), Environmental footprint (`/dashboard/footprint`), Signals (`/dashboard/signals`) and Sites (`/dashboard/sites`). The current section SHALL be marked active with `aria-current="page"`, and Sites SHALL stay active on a site page. Sidebar links SHALL keep `customer`, `baseline`, `sensitivity` and `view`. A site page SHALL show the breadcrumb Dashboard, Sites, site name, with the Sites crumb linking to `/dashboard/sites`.

#### Scenario: Open a section
- **WHEN** the KAM selects "Costs" in the sidebar
- **THEN** `/dashboard/costs` opens with the same customer, baseline and sensitivity and "Costs" is marked active

#### Scenario: Site page keeps the sidebar
- **WHEN** the KAM opens `/dashboard/sites/<siteId>`
- **THEN** the sidebar shows "Sites" active and the breadcrumb links back to `/dashboard/sites`

### Requirement: Pickers in the sidebar
The customer picker SHALL be the sidebar's switcher, labelled, on every route where pickers apply, and SHALL show the customer's initials when the sidebar is collapsed. The baseline and sensitivity pickers SHALL be shown, labelled, in the header on every dashboard route. The sensitivity picker SHALL use the plain labels Cautious, Standard and Generous estimate. Each picker SHALL change only its own URL param.

#### Scenario: Change customer
- **WHEN** the KAM chooses another customer in the switcher
- **THEN** the current section reloads for that customer and the other params stay

#### Scenario: Change estimate
- **WHEN** the KAM chooses "Generous estimate" in the header
- **THEN** the page reloads with `sensitivity=high` and the other params stay

#### Scenario: Collapsed sidebar
- **WHEN** the sidebar is collapsed
- **THEN** the customer switcher shows initials with an accessible name giving the customer, and the baseline and sensitivity selectors remain in the header

### Requirement: Customer view has no dashboard
When `?view=customer`, the navigation SHALL NOT offer the dashboard, and a request to `/dashboard` or any route below it SHALL be redirected to `/story/game` before the page renders, keeping `view` and `customer` and dropping other dashboard params. Without `view` or with an unknown value the view SHALL be KAM.

#### Scenario: Direct URL in customer view
- **WHEN** `/dashboard/costs?view=customer&customer=CUST001&baseline=home` is opened
- **THEN** the browser lands on `/story/game?view=customer&customer=CUST001`

#### Scenario: Navigation in customer view
- **WHEN** the view is customer
- **THEN** the sidebar shows Story and Impact World only

#### Scenario: Default is KAM
- **WHEN** `/dashboard` is opened with no `view`
- **THEN** the dashboard is shown
