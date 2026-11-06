# app-shell Specification

## Purpose
Gives users one frame around every view: a header, a way to switch between the three main views, and an AI sidebar they can open and close. Later slices fill the views and the sidebar.

## Requirements

### Requirement: Header placeholders
The app SHALL show a header on every view with placeholders for the customer picker and baseline, and the role toggle.

#### Scenario: Header visible on all views
- **WHEN** the user opens any of the three views
- **THEN** the header with customer, baseline and role toggle placeholders is shown

### Requirement: View switching
The app SHALL offer a view switcher for Dashboard, Impact World and Story, and SHALL show the page of the chosen view with the active view highlighted.

#### Scenario: Switch view
- **WHEN** the user selects "Story" in the view switcher
- **THEN** the Story page is shown and "Story" is marked active

#### Scenario: Root opens the Dashboard
- **WHEN** the user opens the app root
- **THEN** the Dashboard view is shown

#### Scenario: Direct link
- **WHEN** the user opens the Impact World address directly
- **THEN** the Impact World page is shown with "Impact World" active

### Requirement: Empty view pages
Each view SHALL render an empty page that shows its own name and no data.

#### Scenario: Empty page content
- **WHEN** a view is shown
- **THEN** the page shows its title and no numbers or charts

### Requirement: Collapsible AI sidebar
The app SHALL provide an empty AI sidebar on the right that the user can collapse and expand, and that stays available while switching views.

#### Scenario: Collapse sidebar
- **WHEN** the user collapses the open sidebar
- **THEN** the sidebar is hidden and the view uses the freed space

#### Scenario: Sidebar kept across views
- **WHEN** the sidebar is open and the user switches view
- **THEN** the sidebar is still open
