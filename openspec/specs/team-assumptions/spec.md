# team-assumptions Specification

## Purpose
Holds values that only the team or Lindström can supply, in one typed config the engine reads, so unknowns are visible as assumed or unset and never hidden behind placeholder numbers.

## Requirements

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

### Requirement: Garment signal assumptions
The config SHALL hold T003 to T005 (Watch, Risk and Critical days for the strict, mid and loose dormant tier rows: 60/90/120, 90/120/150 and 120/150/none), T006 (the site-type to tier mapping), T007 (over-allocation cut-off 0.80), T008 (repair-spike ratio 1.5), T009 (trailing window 3 months) and T010 (minimum increase over the trailing mean, 10 repairs). Each SHALL have a set value, the certainty "assumed" and a note saying it is a team modelling choice.

#### Scenario: Entries set
- **WHEN** the config is read
- **THEN** T003 to T010 exist with values and none is null

#### Scenario: Mapping covers pack site types
- **WHEN** T006 is read
- **THEN** Hospital maps to the strict row, Production Plant and Manufacturing Plant to the mid row, Office & Operations, Distribution Center and Service Center to the loose row, and Central Laundry Hub is not mapped
