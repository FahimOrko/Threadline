## MODIFIED Requirements

### Requirement: Customer view has no dashboard
When `?view=customer`, the navigation SHALL NOT offer the dashboard, and a request to `/dashboard` or any route below it SHALL be redirected to `/story/game` before the page renders, keeping `view` and `customer` and dropping other dashboard params. The landing page at `/` SHALL never be redirected, in either view. Without `view` or with an unknown value the view SHALL be KAM.

#### Scenario: Direct URL in customer view
- **WHEN** `/dashboard/costs?view=customer&customer=CUST001&baseline=home` is opened
- **THEN** the browser lands on `/story/game?view=customer&customer=CUST001`

#### Scenario: Navigation in customer view
- **WHEN** the view is customer
- **THEN** the sidebar shows Story and Impact World only

#### Scenario: Default is KAM
- **WHEN** `/dashboard` is opened with no `view`
- **THEN** the dashboard is shown

#### Scenario: Root in customer view
- **WHEN** `/?view=customer` is opened
- **THEN** the landing page is shown with no redirect
