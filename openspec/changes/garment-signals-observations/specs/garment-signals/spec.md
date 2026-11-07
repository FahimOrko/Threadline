# Spec Delta

## Purpose
Turns pickup gaps, allocation and repair history into per-site garment signals, each a Fact with provenance, so rules and the dashboard can point at sites worth a discussion.

## ADDED Requirements

### Requirement: Dormant garment signal
The engine SHALL classify each pickup gap of a site by that site's tier row (T003 to T005, chosen through the T006 site-type mapping) as Watch (above the Watch days), Risk or Critical, and report counts and the share of gaps per site, never per person. A tier row without a Critical threshold has no Critical class.

#### Scenario: Production plant gaps
- **WHEN** a Production Plant site has gaps of 100, 130 and 155 days
- **THEN** it has 3 Watch-or-worse gaps, of which 2 are Risk or worse and 1 is Critical

#### Scenario: Tier row without Critical
- **WHEN** an Office & Operations site has a 170-day gap
- **THEN** it counts as Risk and the site has no Critical gaps

#### Scenario: NorthStar
- **WHEN** the signal runs for CUST001 over 2025
- **THEN** S007 has 2 Critical gaps, S018 has 1 and every other site has none

### Requirement: Unmapped site types are listed
A site whose type is not in the T006 mapping SHALL be skipped for dormant classification and listed in the Show math of the dormant Facts as not classified. It SHALL NOT be dropped silently.

#### Scenario: Unmapped site type
- **WHEN** a site's type is not in the mapping
- **THEN** it has no counts, is never flagged, and Show math lists it with its type as not classified

### Requirement: Over-allocation signal
The engine SHALL flag a site as over-allocated when its garment utilization for the period's last month is below the T007 cut-off.

#### Scenario: NorthStar December 2025
- **WHEN** the signal runs for CUST001 with a cut-off of 0.80
- **THEN** S010, S001, S024 and S002 are flagged

#### Scenario: Site without allocation
- **WHEN** a site has no allocated pieces in the last month
- **THEN** it is not flagged and has no utilization Fact

### Requirement: Repair spike signal
The engine SHALL flag a site-month as a repair spike when the site's repairs in that month, all products, are at least the T008 ratio times the mean of the site's repairs in the T009 preceding months and at least T010 repairs above that mean. Months without enough history SHALL NOT be evaluated.

#### Scenario: NorthStar 2025
- **WHEN** the signal runs for CUST001 with ratio 1.5, a 3-month window and a floor of 10
- **THEN** S006, S007, S018, S021 and S023 each have at least one spike month and no other site does

#### Scenario: Floor not met
- **WHEN** a site has 18 repairs against a trailing mean of 12
- **THEN** the ratio is met but the month is not a spike

#### Scenario: Short history
- **WHEN** a site has fewer than 3 months before a month
- **THEN** that month is not evaluated

### Requirement: Signals carry provenance and their assumptions
Every signal Fact SHALL have methods, source ASSUMPTION, the ids of the T assumptions it used, a formula and inputs, so Show math lists each threshold with its value and unit.

#### Scenario: Show math lists thresholds
- **WHEN** Show math opens for a dormant, over-allocation or repair-spike Fact
- **THEN** it lists the T ids with value, unit and note that the Fact used
