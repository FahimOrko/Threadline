# customer-selection Specification

## Purpose
Lets the user choose which customer the app shows, keeps that choice in the address so it can be shared, and never breaks on a bad value.

## Requirements

### Requirement: Customer picker
The header SHALL offer a picker listing every customer by name and SHALL show the selected customer.

#### Scenario: Choose a customer
- **WHEN** the user picks a customer in the header
- **THEN** the current view reloads for that customer and the address carries the customer id as `?customer=`

#### Scenario: Default customer
- **WHEN** the user opens a view without `?customer=`
- **THEN** NorthStar Foods Group is selected

### Requirement: Unknown customer falls back
When `?customer=` holds a value that matches no customer, the app SHALL show NorthStar Foods Group and a visible notice naming the unknown value, and SHALL NOT fail.

#### Scenario: Unknown value
- **WHEN** the user opens the dashboard with `?customer=NOPE`
- **THEN** the dashboard shows NorthStar Foods Group with a notice that "NOPE" is not a known customer

#### Scenario: Picker agrees with the page
- **WHEN** the address holds an unknown customer value
- **THEN** the header picker shows NorthStar Foods Group, the same customer as the page

#### Scenario: Known value shows no notice
- **WHEN** the user opens the dashboard with a valid customer id
- **THEN** no notice is shown

### Requirement: Selection survives view switching
The view switcher SHALL keep the selected customer when the user changes view.

#### Scenario: Switch view
- **WHEN** a non-default customer is selected and the user selects "Story"
- **THEN** the Story page opens with the same `?customer=`

### Requirement: Fixed reporting period
The app SHALL report the full year 2025 and SHALL NOT offer a period picker in this version.

#### Scenario: Period shown
- **WHEN** the dashboard renders
- **THEN** the period is shown as the full year 2025
