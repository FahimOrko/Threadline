# baseline-sensitivity Specification

## Purpose
Lets the user choose the comparison baseline and the sensitivity level, keeps both in the address so views can be shared, and defines how low and high values are derived.

## Requirements

### Requirement: Baseline selector
The header SHALL offer a baseline selector listing local laundry, home washing and in-house laundry, SHALL show the selected one, and SHALL keep it in the address as `?baseline=<baseline_id>`.

#### Scenario: Default
- **WHEN** the user opens a view without `?baseline=`
- **THEN** local laundry is selected

#### Scenario: Choose a baseline
- **WHEN** the user picks home washing
- **THEN** the dashboard recomputes against home washing and the address carries `?baseline=B_HOME` with any existing `?customer=`

#### Scenario: Unknown baseline falls back
- **WHEN** the address holds `?baseline=NOPE`
- **THEN** the page and the header show local laundry and the page shows a notice naming "NOPE", and nothing fails

### Requirement: Sensitivity selector
The header SHALL offer low, base and high, SHALL show the selected level, and SHALL keep it in the address as `?sensitivity=`. Unknown values SHALL fall back to base with a notice.

#### Scenario: Default
- **WHEN** the user opens a view without `?sensitivity=`
- **THEN** base is selected and the cards show the base values

#### Scenario: Unknown level
- **WHEN** the address holds `?sensitivity=extreme`
- **THEN** base is shown with a notice naming "extreme"

### Requirement: Selection survives view switching
The view switcher SHALL keep `?baseline=` and `?sensitivity=` together with `?customer=`.

#### Scenario: Switch view
- **WHEN** home washing and high are selected and the user opens Story
- **THEN** the address still carries both parameters

### Requirement: Sensitivity model
Low and high SHALL be the base result with each baseline factor scaled by 1 - s and 1 + s, where s is team assumption T002 (0.2, source ASSUMPTION). Laundry factors SHALL NOT be scaled. Only the water, energy and net CO2e saved Facts and their percentages SHALL carry a range; all other Facts SHALL keep low and high as null.

#### Scenario: Range ordering
- **WHEN** savings are computed for any baseline
- **THEN** range.low is less than range.base, which is less than range.high, and the Fact value equals the range entry of the selected level

#### Scenario: Provenance of a non-base level
- **WHEN** the selected level is low or high
- **THEN** the savings Facts have source ASSUMPTION and list T002 in their assumption IDs; at base they keep their existing source and assumption IDs

#### Scenario: Facts without a range
- **WHEN** a service footprint, delivery, operational, money or percentage Fact is returned
- **THEN** its low and high are null and Show math reads "not yet modelled" for them
