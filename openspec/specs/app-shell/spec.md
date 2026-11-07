# app-shell Specification

## Purpose
Gives users one frame around every view: a header, a way to switch between the three main views, and an AI sidebar they can open and close. Later slices fill the views and the sidebar.

## Requirements

### Requirement: Header placeholders
The app SHALL show one thin header row on every view except the print route, holding only the sidebar trigger, a breadcrumb of the current location and the AI sidebar toggle. The customer switcher SHALL be in the sidebar's switcher slot, and the baseline and estimate choices SHALL be the scenario strip at the top of dashboard pages, never in the header. The theme toggle and the KAM/Customer view toggle SHALL be in the sidebar footer.

#### Scenario: Header on the dashboard
- **WHEN** the user opens a dashboard route
- **THEN** the header shows the trigger, breadcrumb and AI toggle only, and, on Overview and Environmental footprint, the scenario strip is the first thing in the page

#### Scenario: Header visible on all views
- **WHEN** the user opens Impact World
- **THEN** the header shows the trigger, breadcrumb and AI toggle, and no baseline or estimate control is shown

#### Scenario: Switch theme from header
- **WHEN** the user activates the theme toggle in the sidebar footer
- **THEN** the app switches to the other theme immediately

#### Scenario: Picker is operable
- **WHEN** the user focuses the customer switcher and chooses a customer with the keyboard
- **THEN** the selection changes as described in the customer-selection capability

### Requirement: View switching
The app SHALL offer navigation to Dashboard sections, Impact World and Story through the sidebar, and SHALL show the page of the chosen item with that item marked active. In the customer view the sidebar SHALL omit the Dashboard group. Links to Story and Impact World SHALL carry only `view`.

#### Scenario: Switch view
- **WHEN** the user selects "Story" in the sidebar
- **THEN** the Story page is shown and "Story" is marked active

#### Scenario: Root opens the Dashboard
- **WHEN** the user opens the app root in the KAM view
- **THEN** the Dashboard view is shown

#### Scenario: Direct link
- **WHEN** the user opens the Impact World address directly
- **THEN** the Impact World page is shown with "Impact World" active

#### Scenario: Customer view
- **WHEN** `?view=customer`
- **THEN** the sidebar shows Impact World and Story only

### Requirement: Empty view pages
Each view SHALL render an empty page that shows its own name and no data.

#### Scenario: Empty page content
- **WHEN** a view is shown
- **THEN** the page shows its title and no numbers or charts

### Requirement: Collapsible AI sidebar
The app SHALL provide an empty AI sidebar on the right that the user can collapse and expand, and that stays available while switching views. It SHALL be collapsed by default on `/story/game` and open by default on other routes; once the user toggles it, the user's choice wins. When open it SHALL take space from the layout instead of overlaying it. Below the `md` breakpoint the sidebar and its toggle SHALL NOT be shown, so it never overlays or narrows the main area; at `md` and above it behaves as described here. This narrow-screen rule is a stopgap until the AI sidebar slice provides a small-screen overlay.

#### Scenario: Collapse sidebar
- **WHEN** the user collapses the open sidebar
- **THEN** the sidebar is hidden and the view uses the freed space

#### Scenario: Sidebar kept across views
- **WHEN** the sidebar is open and the user switches view
- **THEN** the sidebar is still open

#### Scenario: Default on the game
- **WHEN** `/story/game` is opened without a prior toggle
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

### Requirement: Story link opens the game
The sidebar "Story" item SHALL open `/story/game` and SHALL be shown active on `/story`, `/story/game` and `/story/print`. The link SHALL keep the existing carried params as before.

#### Scenario: Link target
- **WHEN** the reader activates "Story"
- **THEN** `/story/game` opens

#### Scenario: Active state
- **WHEN** the route is `/story`, `/story/game` or `/story/print`
- **THEN** "Story" is marked active

### Requirement: Header pickers hidden on the game
The customer switcher SHALL NOT be shown on `/story/game`, where the game is the only place those choices are made. It SHALL stay where defined on all other routes, and the scenario strip belongs to Overview and Environmental footprint only.

#### Scenario: On the game
- **WHEN** the route is `/story/game`
- **THEN** no customer switcher is rendered

#### Scenario: Elsewhere
- **WHEN** the route is `/dashboard`
- **THEN** the customer switcher is shown in the sidebar and the scenario strip above the page title (Overview and Environmental footprint)

### Requirement: App sidebar
The app SHALL show a left navigation sidebar on every view except the print route. It SHALL collapse to an icon column and expand again by a trigger in the header and by `Ctrl+B`, and SHALL show a label tooltip on each icon when collapsed. Its group "Dashboard" SHALL list Overview, Garments and utilization, Costs, Environmental footprint, Signals and Sites; its group "Shared" SHALL list Story and Impact World. The active item SHALL be marked `aria-current="page"`. The chosen state SHALL persist in a cookie and SHALL NOT be a URL param. Every item SHALL use a Phosphor icon, and the active and hovered item SHALL show an indicator that glides between items; under `prefers-reduced-motion: reduce` it SHALL be a static fill. The wordmark SHALL be its own row above the customer switcher. The sidebar's footer SHALL hold the KAM / Customer view links and the theme toggle. There SHALL be no top tab bar.

#### Scenario: Collapse
- **WHEN** the user activates the trigger
- **THEN** the sidebar shrinks to icons, the main area takes the space, and each icon still has an accessible name and a tooltip

#### Scenario: Persisted
- **WHEN** the user collapsed it and reloads
- **THEN** it is collapsed again once the page has loaded

#### Scenario: Active item
- **WHEN** the route is `/dashboard/costs`
- **THEN** only "Costs" is marked active

### Requirement: AI sidebar collapses the app sidebar
On dashboard routes, while the AI sidebar is open, the app sidebar SHALL show collapsed to icons unless the user has toggled the app sidebar since the AI sidebar last opened or closed. When the AI sidebar closes, the app sidebar SHALL return to the state the user had chosen. An automatic collapse SHALL NOT change the persisted preference. Outside the dashboard the app sidebar is unaffected.

#### Scenario: AI opens
- **WHEN** the app sidebar is expanded and the user opens the AI sidebar on a dashboard route
- **THEN** the app sidebar collapses to icons

#### Scenario: AI closes
- **WHEN** the user closes the AI sidebar without having touched the app sidebar
- **THEN** the app sidebar expands again

#### Scenario: User toggled in between
- **WHEN** the user expands the app sidebar while the AI sidebar is open and then closes the AI sidebar
- **THEN** the app sidebar stays expanded

#### Scenario: Not on the dashboard
- **WHEN** the AI sidebar is open on Impact World
- **THEN** the app sidebar keeps the user's chosen state
