# Spec Delta

## Purpose

Computes every displayed number as a Fact with provenance, in pure code that runs unchanged in the browser and on the server, so numbers are reproducible and explainable.

## ADDED Requirements

### Requirement: Pure and isomorphic engine
Engine code SHALL receive its data as an argument and SHALL NOT read files, use server-only modules or format values for display.

#### Scenario: Same result everywhere
- **WHEN** the same data and arguments are given in the browser and on the server
- **THEN** the engine returns identical Facts

### Requirement: Fact shape
Each Fact SHALL carry id, label, value (a raw number), unit, methods, source, assumption IDs, confidence, formula, inputs, scope, period and baseline. Methods and source SHALL use the existing provenance types.

#### Scenario: Fact has provenance
- **WHEN** the engine returns any Fact
- **THEN** it has at least one method, a source, a formula and a scope

### Requirement: Replacements postponed
The engine SHALL compute Replacements postponed for a customer and a period as the sum of `repair_count` over the customer's repairs rows in that period, with methods ESTIMATED, source SYNTHETIC and assumption A002.

#### Scenario: NorthStar full year 2025
- **WHEN** the engine runs for CUST001 over 2025-01 to 2025-12
- **THEN** the value is 15 233 and the unit is replacements

#### Scenario: Other customer
- **WHEN** the engine runs for another customer id
- **THEN** only that customer's rows are summed

#### Scenario: Unknown customer
- **WHEN** the customer id has no rows
- **THEN** the value is 0 and the Fact's inputs state zero rows were found

### Requirement: Cross-check against the sheet
The engine SHALL NOT use `estimated_replacements_postponed` as its source; the pipeline cross-checks it.

#### Scenario: Computed from repair_count
- **WHEN** a row's two columns disagree
- **THEN** the Fact still uses `repair_count`
