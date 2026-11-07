## ADDED Requirements

### Requirement: Story link opens the game
The header "Story" link SHALL open `/story/game` and SHALL be shown active on `/story`, `/story/game` and `/story/print`. The link SHALL keep the existing carried params as before.

#### Scenario: Link target
- **WHEN** the reader activates "Story"
- **THEN** `/story/game` opens

#### Scenario: Active state
- **WHEN** the route is `/story`, `/story/game` or `/story/print`
- **THEN** "Story" is marked active

### Requirement: Header pickers hidden on the game
The header customer, baseline and sensitivity pickers SHALL NOT be shown on `/story/game`, where the game is the only place those choices are made. They SHALL stay on all other routes.

#### Scenario: On the game
- **WHEN** the route is `/story/game`
- **THEN** no customer, baseline or sensitivity picker is rendered in the header

#### Scenario: Elsewhere
- **WHEN** the route is `/dashboard`
- **THEN** all three pickers are shown

## MODIFIED Requirements

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
