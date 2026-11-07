# Spec Delta

## Purpose

Holds values that only the team or Lindström can supply, in one typed config the engine reads, so unknowns are visible as assumed or unset and never hidden behind placeholder numbers.

## ADDED Requirements

### Requirement: Team assumptions config
Team-supplied unknown values SHALL live in one typed plain-data config imported by the engine. Each entry SHALL have an id with a T prefix (T001 onwards, distinct from the pack's A-prefixed IDs), a value, a unit, a note and the certainty "assumed". The config SHALL NOT be held in client state or be editable at runtime.

#### Scenario: Entry shape
- **WHEN** the config is read
- **THEN** every entry has an id starting with T, a value, a unit, a note and certainty "assumed"

#### Scenario: Rental fee entry
- **WHEN** the config is read
- **THEN** T001 is the rental fee per piece per week in EUR per piece per week

### Requirement: Unset assumption is explicit
An assumption without a supplied value SHALL have the value null. No placeholder number SHALL stand in for it, and no KPI SHALL compute with it.

#### Scenario: T001 unset
- **WHEN** T001 has no value
- **THEN** its value is null and the Cost of unused allocation Fact has a null value

### Requirement: Team assumptions render as assumed
A Fact that uses a team assumption SHALL have source ASSUMPTION, so its chip takes the uncertain tint, and its Show math SHALL list the assumption's id, value (or "not set"), unit and note.

#### Scenario: Set assumption
- **WHEN** T001 has a value and Cost of unused allocation is shown
- **THEN** the chip is in the uncertain tint and Show math lists T001, the value, its unit and its note

#### Scenario: Unset assumption in Show math
- **WHEN** T001 is unset and Show math is open
- **THEN** it lists T001 as "not set" with its unit and note
