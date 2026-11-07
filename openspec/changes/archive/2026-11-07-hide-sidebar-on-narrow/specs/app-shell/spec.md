## MODIFIED Requirements

### Requirement: Collapsible AI sidebar
The app SHALL provide an empty AI sidebar on the right that the user can collapse and expand, and that stays available while switching views. Below the `md` breakpoint the sidebar and its toggle SHALL NOT be shown, so it never overlays or narrows the main area; at `md` and above it behaves as described here. This narrow-screen rule is a stopgap until the AI sidebar slice provides a small-screen overlay.

#### Scenario: Collapse sidebar
- **WHEN** the user collapses the open sidebar
- **THEN** the sidebar is hidden and the view uses the freed space

#### Scenario: Sidebar kept across views
- **WHEN** the sidebar is open and the user switches view
- **THEN** the sidebar is still open

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
