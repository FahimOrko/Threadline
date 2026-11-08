## MODIFIED Requirements

### Requirement: Collapsible AI sidebar
The app SHALL provide an empty AI sidebar on the right that the user can collapse and expand, and that stays available while switching views. It SHALL be collapsed by default on every route and in both views, and SHALL open only when the user activates its toggle; there SHALL be no per-route default that opens it. Once the user toggles it, the user's choice wins until reload. When open it SHALL take space from the layout instead of overlaying it. Below the `md` breakpoint the sidebar and its toggle SHALL NOT be shown, so it never overlays or narrows the main area; at `md` and above it behaves as described here. This narrow-screen rule is a stopgap until the AI sidebar slice provides a small-screen overlay.

#### Scenario: Collapse sidebar
- **WHEN** the user collapses the open sidebar
- **THEN** the sidebar is hidden and the view uses the freed space

#### Scenario: Sidebar kept across views
- **WHEN** the sidebar is open and the user switches view
- **THEN** the sidebar is still open

#### Scenario: Default on the game
- **WHEN** `/story/game` is opened without a prior toggle, in either view
- **THEN** the sidebar is collapsed

#### Scenario: Default on the world page
- **WHEN** `/world` is opened without a prior toggle, in either view
- **THEN** the sidebar is collapsed

#### Scenario: Default elsewhere
- **WHEN** the dashboard or `/story` is opened without a prior toggle, in either view
- **THEN** the sidebar is collapsed

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

### Requirement: App sidebar
The app SHALL show a left navigation sidebar on every view except the landing page at `/`. It SHALL be expanded on every page load, SHALL collapse to an icon column and expand again by a trigger in the header and by `Ctrl+B`, and SHALL show a label tooltip on each icon when collapsed. A collapse SHALL last until the page is reloaded; it SHALL NOT be stored in a cookie or a URL param. Its group "Dashboard" SHALL list Overview, Garments and utilization, Costs, Environmental footprint, Signals and Sites; its group "Shared" SHALL list the Story group (see its requirement) and Impact World. The active item SHALL be marked `aria-current="page"`. Every item SHALL use a Phosphor icon, and the active and hovered item SHALL show an indicator that glides between items; under `prefers-reduced-motion: reduce` it SHALL be a static fill. The wordmark SHALL be its own row above the customer switcher and SHALL link to `/` with no params. The sidebar's footer SHALL hold the KAM / Customer view links and the theme toggle. There SHALL be no top tab bar.

#### Scenario: Collapse
- **WHEN** the user activates the trigger
- **THEN** the sidebar shrinks to icons, the main area takes the space, and each icon still has an accessible name and a tooltip

#### Scenario: Open on first load
- **WHEN** the dashboard, `/story`, `/story/game` or `/world` is opened
- **THEN** the sidebar is expanded

#### Scenario: Persisted
- **WHEN** the user collapsed it and reloads
- **THEN** it is expanded again, because a collapse is not stored

#### Scenario: Active item
- **WHEN** the route is `/dashboard/costs`
- **THEN** only "Costs" is marked active

#### Scenario: Wordmark
- **WHEN** the user activates the wordmark
- **THEN** `/` opens with no query string

#### Scenario: Landing has no sidebar
- **WHEN** `/` is opened
- **THEN** no app sidebar, header or AI sidebar is rendered

### Requirement: AI sidebar collapses the app sidebar
On dashboard routes, while the AI sidebar is open, the app sidebar SHALL show collapsed to icons unless the user has toggled the app sidebar since the AI sidebar last opened or closed. When the AI sidebar closes, the app sidebar SHALL return to expanded unless the user collapsed it by hand. Outside the dashboard the app sidebar is unaffected. Because the AI sidebar starts closed, this applies only after the user opens it.

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
- **THEN** the app sidebar keeps the state the user gave it
