## ADDED Requirements

### Requirement: Inline Show math for print
Show math SHALL support an inline mode in which its content is rendered expanded in the page flow instead of a popover. The mode SHALL be selected by the print route without changing the props of the components that use Show math, and the popover remains the on-screen pattern everywhere else.

#### Scenario: Screen pages unchanged
- **WHEN** the dashboard or the Story page is shown
- **THEN** Show math opens as a popover exactly as before

#### Scenario: Print route
- **WHEN** the print route is shown
- **THEN** every Show math is expanded inline with the same rows as the popover

### Requirement: Light print scope
A print scope SHALL render its descendants with the light theme tokens regardless of the active app theme, and SHALL pass the contrast check for the light theme.

#### Scenario: Dark app theme
- **WHEN** the app theme is dark and a print scope is rendered
- **THEN** text, borders and badges inside it use the light tokens
