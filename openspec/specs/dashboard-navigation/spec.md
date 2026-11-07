# dashboard-navigation Specification

## Purpose
Gives the KAM a dashboard split into meaningful sections behind a left sidebar, and keeps the dashboard out of the customer's reach.

## Requirements

### Requirement: Sidebar and section routes
The dashboard SHALL show a left sidebar with one link per section, each a subroute under `/dashboard`: Overview (`/dashboard`), Garments and utilization (`/dashboard/garments`), Costs (`/dashboard/costs`), Environmental footprint (`/dashboard/footprint`), Signals (`/dashboard/signals`) and Sites (`/dashboard/sites`). The current section SHALL be marked active with `aria-current="page"`, and Sites SHALL stay active on a site page. Sidebar links SHALL keep `customer`, `baseline`, `sensitivity` and `view`.

#### Scenario: Open a section
- **WHEN** the KAM selects "Costs" in the sidebar
- **THEN** `/dashboard/costs` opens with the same customer, baseline and sensitivity and "Costs" is marked active

#### Scenario: Site page keeps the sidebar
- **WHEN** the KAM opens `/dashboard/sites/<siteId>`
- **THEN** the sidebar is shown with "Sites" active and the back link goes to `/dashboard/sites`

### Requirement: Pickers in the sidebar
The customer, baseline and sensitivity pickers SHALL be shown, labelled, at the top of the dashboard sidebar on every dashboard route, and SHALL NOT be shown in the header there. The sensitivity picker SHALL use the plain labels Cautious, Standard and Generous estimate.

#### Scenario: Change customer
- **WHEN** the KAM chooses another customer in the sidebar
- **THEN** the current section reloads for that customer and the other params stay

### Requirement: Customer view has no dashboard
When `?view=customer`, the navigation SHALL NOT offer the dashboard, and a request to `/dashboard` or any route below it SHALL be redirected to `/story/game` before the page renders, keeping `view` and `customer` and dropping other dashboard params. Without `view` or with an unknown value the view SHALL be KAM.

#### Scenario: Direct URL in customer view
- **WHEN** `/dashboard/costs?view=customer&customer=CUST001&baseline=home` is opened
- **THEN** the browser lands on `/story/game?view=customer&customer=CUST001`

#### Scenario: Navigation in customer view
- **WHEN** the view is customer
- **THEN** the header links show Story and Impact World only

#### Scenario: Default is KAM
- **WHEN** `/dashboard` is opened with no `view`
- **THEN** the dashboard is shown

### Requirement: Leaving the dashboard starts fresh
A link from the dashboard to Story or Impact World SHALL carry `view` only; `customer`, `baseline`, `sensitivity` and `priorities` SHALL be dropped. Within Story, the game, report and print links SHALL keep sharing params as before.

#### Scenario: Dashboard to Story
- **WHEN** the KAM, on `/dashboard?customer=CUST002&baseline=home&sensitivity=high`, selects "Story"
- **THEN** `/story/game` opens with no `customer`, `baseline` or `sensitivity`

#### Scenario: Inside Story
- **WHEN** the reader moves from the game to the report
- **THEN** the picks and params carry as today
