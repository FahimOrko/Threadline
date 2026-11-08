## MODIFIED Requirements

### Requirement: Header placeholders
The app SHALL show one thin header row on every view, holding only the sidebar trigger, a breadcrumb of the current location and the AI sidebar toggle. The customer switcher SHALL be in the sidebar's switcher slot, and the baseline and estimate choices SHALL be the scenario strip at the top of dashboard pages and the controls in the Impact World header block, never in the header row. The theme toggle and the KAM/Customer view toggle SHALL be in the sidebar footer.

#### Scenario: Header on the dashboard
- **WHEN** the user opens a dashboard route
- **THEN** the header shows the trigger, breadcrumb and AI toggle only, and, on Overview and Environmental footprint, the scenario strip is the first thing in the page

#### Scenario: Header visible on all views
- **WHEN** the user opens Impact World
- **THEN** the header row shows the trigger, breadcrumb and AI toggle, and the baseline and estimate controls are in the page's own header block

#### Scenario: Switch theme from header
- **WHEN** the user activates the theme toggle in the sidebar footer
- **THEN** the app switches to the other theme immediately

#### Scenario: Picker is operable
- **WHEN** the user focuses the customer switcher and chooses a customer with the keyboard
- **THEN** the selection changes as described in the customer-selection capability

### Requirement: View switching
The app SHALL offer navigation to Dashboard sections, Impact World (`/world`) and Story through the sidebar, and SHALL show the page of the chosen item with that item marked active. In the customer view the sidebar SHALL omit the Dashboard group. Links to Story and Impact World from the dashboard SHALL carry only `view`.

#### Scenario: Switch view
- **WHEN** the user selects "Story" in the sidebar
- **THEN** the Story page is shown and "Story" is marked active

#### Scenario: Root opens the Dashboard
- **WHEN** the user opens the app root in the KAM view
- **THEN** the Dashboard view is shown

#### Scenario: Direct link
- **WHEN** the user opens `/world` directly
- **THEN** the Impact World page is shown with "Impact World" active

#### Scenario: Customer view
- **WHEN** `?view=customer`
- **THEN** the sidebar shows Impact World and Story only

### Requirement: Collapsible AI sidebar
The app SHALL provide an empty AI sidebar on the right that the user can collapse and expand, and that stays available while switching views. It SHALL be collapsed by default on `/story/game` and `/world` and open by default on other routes; once the user toggles it, the user's choice wins. When open it SHALL take space from the layout instead of overlaying it. Below the `md` breakpoint the sidebar and its toggle SHALL NOT be shown, so it never overlays or narrows the main area; at `md` and above it behaves as described here. This narrow-screen rule is a stopgap until the AI sidebar slice provides a small-screen overlay.

#### Scenario: Collapse sidebar
- **WHEN** the user collapses the open sidebar
- **THEN** the sidebar is hidden and the view uses the freed space

#### Scenario: Sidebar kept across views
- **WHEN** the sidebar is open and the user switches view
- **THEN** the sidebar is still open

#### Scenario: Default on the game
- **WHEN** `/story/game` is opened without a prior toggle
- **THEN** the sidebar is collapsed

#### Scenario: Default on the world page
- **WHEN** `/world` is opened without a prior toggle
- **THEN** the sidebar is collapsed

#### Scenario: Default elsewhere
- **WHEN** another route is opened without a prior toggle
- **THEN** the sidebar is open

#### Scenario: Open sidebar on the game
- **WHEN** the user opens the sidebar on `/story/game`
- **THEN** the game's left column shrinks and the card column keeps its width

#### Scenario: Narrow screen hides sidebar
- **WHEN** the viewport is narrower than the `md` breakpoint and the sidebar is open
- **THEN** the sidebar is not shown and the main area uses the full width

#### Scenario: Toggle not shown on narrow screen
- **WHEN** the viewport is narrower than the `md` breakpoint
- **THEN** the sidebar toggle is not shown

#### Scenario: Wide screen unchanged
- **WHEN** the viewport is at the `md` breakpoint or wider and the sidebar is open
- **THEN** the sidebar and its toggle are shown as before

#### Scenario: Main area usable at 390px
- **WHEN** the viewport is 390px wide
- **THEN** every dashboard card and every "Show math" popover trigger can be clicked with the mouse

### Requirement: Header pickers hidden on the game
The customer switcher SHALL NOT be shown on `/story/game`, where the game is the only place those choices are made, and SHALL NOT be shown anywhere in the customer view, where the reader picks their company in the game or on the world page. It SHALL stay where defined on all other routes in the KAM view, including `/world`, and the scenario strip belongs to Overview and Environmental footprint only (Impact World has its own header block).

#### Scenario: On the game
- **WHEN** the route is `/story/game`
- **THEN** no customer switcher is rendered

#### Scenario: Customer view elsewhere
- **WHEN** `?view=customer` and the route is `/story` or `/world`
- **THEN** no customer switcher is rendered

#### Scenario: Elsewhere
- **WHEN** the route is `/dashboard` or `/world` in the KAM view
- **THEN** the customer switcher is shown in the sidebar
