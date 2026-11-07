# Spec Delta

## MODIFIED Requirements

### Requirement: Same content for both roles
The operational cards, the money and utilization cards and the site table SHALL be identical in the KAM and Customer roles.

#### Scenario: Role switch
- **WHEN** the user switches from KAM to Customer
- **THEN** the cards and the table do not change

## ADDED Requirements

### Requirement: Money and utilization cards
The dashboard SHALL show, below the operational cards, one card each for Avoided purchase cost, Garment value kept in use (Dec), Cost of unused allocation (Dec, per week) and Garment utilization (Dec) for the selected customer, each with value, unit, provenance chip and Show math.

#### Scenario: NorthStar cards
- **WHEN** the user opens the dashboard for NorthStar Foods Group with T001 unset
- **THEN** the cards show 660 082 EUR, 1 335 527 EUR, "Needs input" and 83.5 %

#### Scenario: Show math lists the team assumption
- **WHEN** the user opens Show math on Cost of unused allocation
- **THEN** it lists the unused pieces, T001 with its value or "not set", its unit and its note

#### Scenario: Another customer
- **WHEN** the user selects another customer
- **THEN** the four cards show that customer's values

### Requirement: Needs input instead of a number
A dashboard card whose Fact has no value SHALL show "Needs input" in place of the value, with a hint naming the missing assumption, and SHALL NOT show 0 or NaN.

#### Scenario: T001 unset
- **WHEN** the dashboard shows Cost of unused allocation while T001 is unset
- **THEN** the card reads "Needs input", names T001, keeps its amber chip and offers Show math
