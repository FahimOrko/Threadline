# Spec Delta

## MODIFIED Requirements

### Requirement: Header placeholders
The app SHALL show a header on every view with placeholders for the customer picker and baseline, the role toggle, and a theme toggle that switches between dark and light.

#### Scenario: Header visible on all views
- **WHEN** the user opens any of the three views
- **THEN** the header with customer, baseline, role toggle and theme toggle is shown

#### Scenario: Switch theme from header
- **WHEN** the user activates the theme toggle
- **THEN** the app switches to the other theme immediately
