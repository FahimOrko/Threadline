# Spec Delta

## MODIFIED Requirements

### Requirement: Leaving the dashboard starts fresh
A link from the dashboard to Story or Impact World SHALL carry `view` only; `customer`, `baseline`, `sensitivity` and `priorities` SHALL be dropped. Within Story, the game and report links SHALL keep sharing params as before.

#### Scenario: Dashboard to Story
- **WHEN** the KAM, on `/dashboard?customer=CUST002&baseline=home&sensitivity=high`, selects "Story"
- **THEN** `/story/game` opens with no `customer`, `baseline` or `sensitivity`

#### Scenario: Inside Story
- **WHEN** the reader moves from the game to the report
- **THEN** the picks and params carry as today

