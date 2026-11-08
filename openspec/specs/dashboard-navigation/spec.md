# dashboard-navigation Specification

## Purpose
Gives the KAM a dashboard split into meaningful sections behind a left sidebar, and keeps the dashboard out of the customer's reach.

## Requirements

### Requirement: Sidebar and section routes
The app sidebar SHALL show one link per dashboard section, each a subroute under `/dashboard`: Overview (`/dashboard`), Garments and utilization (`/dashboard/garments`), Costs (`/dashboard/costs`), Environmental footprint (`/dashboard/footprint`), Signals (`/dashboard/signals`) and Sites (`/dashboard/sites`). The current section SHALL be marked active with `aria-current="page"`, and Sites SHALL stay active on a site page. Sidebar links SHALL keep `customer`, `baseline`, `sensitivity` and `view`. A site page SHALL show the breadcrumb Dashboard, Sites, site name, with the Sites crumb linking to `/dashboard/sites`.

#### Scenario: Open a section
- **WHEN** the KAM selects "Costs" in the sidebar
- **THEN** `/dashboard/costs` opens with the same customer, baseline and sensitivity and "Costs" is marked active

#### Scenario: Site page keeps the sidebar
- **WHEN** the KAM opens `/dashboard/sites/<siteId>`
- **THEN** the sidebar shows "Sites" active and the breadcrumb links back to `/dashboard/sites`

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
- **THEN** the sidebar shows Story and Impact World only

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

### Requirement: Breadcrumb links
Every breadcrumb segment except the current page SHALL be a link that keeps `customer`, `baseline`, `sensitivity` and `view`: "Dashboard" to `/dashboard` and "Sites" to `/dashboard/sites`.

#### Scenario: Link from a site page
- **WHEN** the KAM is on a site page with `?customer=CUST002` and activates "Dashboard"
- **THEN** `/dashboard?customer=CUST002` opens

#### Scenario: Current page
- **WHEN** the breadcrumb is shown
- **THEN** its last segment is plain text marked `aria-current="page"`

### Requirement: Customer switcher
The sidebar's top slot SHALL hold, below the Threadline wordmark row, a switcher row with an avatar showing the customer's initials, the customer's name, a subtitle with its industry and its site count (from the customer data and the delivery-sites Fact, never typed in) and a chevron. Activating it SHALL open a menu listing every customer, the current one checked; choosing one SHALL change only the `customer` param. When the sidebar is collapsed the row SHALL show the avatar alone with the customer's name as its tooltip and accessible name. In the customer view the row SHALL NOT be shown, because the reader picks their company in the game.

#### Scenario: Change customer
- **WHEN** the KAM opens the switcher and chooses another customer
- **THEN** the current section reloads for that customer and the other params stay

#### Scenario: Collapsed sidebar
- **WHEN** the sidebar is collapsed
- **THEN** only the avatar is shown, its accessible name and tooltip give the customer's name, and it still opens the menu

#### Scenario: Customer view
- **WHEN** the view is customer
- **THEN** no switcher row is rendered, in the expanded or the collapsed sidebar

### Requirement: Scenario strip
The Overview and Environmental footprint pages (the only pages whose figures depend on the baseline or estimate) SHALL show, above their title, a scenario strip. No other dashboard page, including site pages, SHALL show it with two labelled groups of segmented buttons with every option visible: "Comparing against" (the baseline display names: local laundry, home washing, in-house laundry) and "Estimate" (Cautious estimate, Standard estimate, Generous estimate). The strip SHALL be visually distinct from cards (tinted surface and accent border) and read as a control. Each option SHALL have a short plain-language tooltip; the estimate tooltips SHALL say the range is declared by the team (T002), not measured (ADR 0017). The strip SHALL carry one line: "These choices change the savings figures on this page." A choice SHALL change only its own URL param, and an unknown value SHALL show the default as checked. After a choice, every card or panel figure whose Fact value changed SHALL show a brief highlight, decided by comparing the Fact's value before and after; the highlight SHALL NOT appear with `prefers-reduced-motion: reduce` or on first load.

#### Scenario: Only where it matters
- **WHEN** the KAM opens Garments and utilization, Costs, Signals, Sites or a site page
- **THEN** no scenario strip is shown and no text says the choices do not apply

#### Scenario: All options visible
- **WHEN** a dashboard page opens
- **THEN** all three baselines and all three estimates are shown as buttons, with the URL's choice checked, and no dropdown

#### Scenario: Change estimate
- **WHEN** the KAM chooses "Generous estimate"
- **THEN** the page reloads with `sensitivity=high` and the other params stay

#### Scenario: Tooltip
- **WHEN** the KAM focuses or hovers "Cautious estimate"
- **THEN** a tooltip says in plain words what it means and that the range is declared by the team

#### Scenario: Changed cards highlight
- **WHEN** a choice changes a card's Fact value
- **THEN** that card is highlighted briefly and cards whose value did not change are not

#### Scenario: Narrow main area
- **WHEN** both sidebars are open at 1230px
- **THEN** the two groups sit on their own lines and no button wraps its text
