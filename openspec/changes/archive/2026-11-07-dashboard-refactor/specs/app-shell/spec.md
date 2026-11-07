# app-shell Delta

## MODIFIED Requirements

### Requirement: Header placeholders
The app SHALL show a header on every view with a theme toggle that switches between dark and light and the KAM/Customer view toggle, and, outside the dashboard and the game, a customer picker, a baseline selector and a sensitivity selector. On `/dashboard` routes the three pickers live in the dashboard sidebar.

#### Scenario: Header visible on all views
- **WHEN** the user opens Impact World
- **THEN** the header shows the customer picker, baseline selector, sensitivity selector, view toggle and theme toggle

#### Scenario: Header on the dashboard
- **WHEN** the user opens a dashboard route
- **THEN** the header shows no picker and the sidebar does

#### Scenario: Switch theme from header
- **WHEN** the user activates the theme toggle
- **THEN** the app switches to the other theme immediately

#### Scenario: Picker is operable
- **WHEN** the user focuses the customer picker and chooses a customer with the keyboard
- **THEN** the selection changes as described in the customer-selection capability

### Requirement: View switching
The app SHALL offer a view switcher for Dashboard, Impact World and Story, and SHALL show the page of the chosen view with the active view highlighted. In the customer view the switcher SHALL omit Dashboard. Links to Story and Impact World SHALL carry only `view`.

#### Scenario: Switch view
- **WHEN** the user selects "Story" in the view switcher
- **THEN** the Story page is shown and "Story" is marked active

#### Scenario: Root opens the Dashboard
- **WHEN** the user opens the app root in the KAM view
- **THEN** the Dashboard view is shown

#### Scenario: Direct link
- **WHEN** the user opens the Impact World address directly
- **THEN** the Impact World page is shown with "Impact World" active

#### Scenario: Customer view
- **WHEN** `?view=customer`
- **THEN** the switcher shows Impact World and Story only
