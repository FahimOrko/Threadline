## MODIFIED Requirements

### Requirement: Header placeholders
The app SHALL show a header on every view with a customer picker, a baseline selector, a sensitivity selector, the role toggle, and a theme toggle that switches between dark and light.

#### Scenario: Header visible on all views
- **WHEN** the user opens any of the three views
- **THEN** the header with customer picker, baseline selector, sensitivity selector, role toggle and theme toggle is shown

#### Scenario: Switch theme from header
- **WHEN** the user activates the theme toggle
- **THEN** the app switches to the other theme immediately

#### Scenario: Picker is operable
- **WHEN** the user focuses the customer picker and chooses a customer with the keyboard
- **THEN** the selection changes as described in the customer-selection capability
