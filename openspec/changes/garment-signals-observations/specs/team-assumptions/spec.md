# Spec Delta

## ADDED Requirements

### Requirement: Garment signal assumptions
The config SHALL hold T003 to T005 (Watch, Risk and Critical days for the strict, mid and loose dormant tier rows: 60/90/120, 90/120/150 and 120/150/none), T006 (the site-type to tier mapping), T007 (over-allocation cut-off 0.80), T008 (repair-spike ratio 1.5), T009 (trailing window 3 months) and T010 (minimum increase over the trailing mean, 10 repairs). Each SHALL have a set value, the certainty "assumed" and a note saying it is a team modelling choice.

#### Scenario: Entries set
- **WHEN** the config is read
- **THEN** T003 to T010 exist with values and none is null

#### Scenario: Mapping covers pack site types
- **WHEN** T006 is read
- **THEN** Hospital maps to the strict row, Production Plant and Manufacturing Plant to the mid row, Office & Operations, Distribution Center and Service Center to the loose row, and Central Laundry Hub is not mapped
