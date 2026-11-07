# role-mode Delta

## MODIFIED Requirements

### Requirement: Role toggle
The app SHALL provide a header toggle between the KAM and Customer views, defaulting to KAM. The toggle SHALL set `?view=` on the current address; no store is read.

#### Scenario: Default role
- **WHEN** a user opens the app with no `view`
- **THEN** the view is KAM

#### Scenario: Switch role
- **WHEN** the user selects Customer in the toggle
- **THEN** the address gains `view=customer` and the toggle shows Customer as active

### Requirement: Role persists
The app SHALL keep the chosen view in the address. A reload keeps it, and navigation between Impact World and Story carries it.

#### Scenario: Reload keeps role
- **WHEN** the user selects Customer and reloads the page
- **THEN** the view is still Customer

#### Scenario: No logins
- **WHEN** the user switches role
- **THEN** no login or permission check is required
