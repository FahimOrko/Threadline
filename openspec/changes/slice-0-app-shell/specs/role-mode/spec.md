## Purpose

Lets the same app serve the Key Account Manager preparing the review and the customer exploring it, with a simple toggle and no logins.

## ADDED Requirements

### Requirement: Role toggle
The app SHALL provide a header toggle between the KAM and Customer roles, defaulting to KAM on first visit.

#### Scenario: Default role
- **WHEN** a user opens the app for the first time
- **THEN** the role is KAM

#### Scenario: Switch role
- **WHEN** the user selects Customer in the toggle
- **THEN** the toggle shows Customer as active

### Requirement: Role persists
The app SHALL remember the chosen role in the browser and restore it after a reload.

#### Scenario: Reload keeps role
- **WHEN** the user selects Customer and reloads the page
- **THEN** the role is still Customer

#### Scenario: No logins
- **WHEN** the user switches role
- **THEN** no login or permission check is required
