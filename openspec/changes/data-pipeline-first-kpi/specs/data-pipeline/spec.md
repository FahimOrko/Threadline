# Spec Delta

## Purpose

Turns the source CSVs into validated JSON and a data-quality report, and hands data to the engine through an adapter, so every number rests on checked data and visible data issues.

## ADDED Requirements

### Requirement: Header verification fails the build
`npm run data:build` SHALL compare each source file's header row with its sheet definition in `data_dictionary.csv` and SHALL exit non-zero, naming the file and the differing columns, when they differ.

#### Scenario: Header matches
- **WHEN** every file the build reads has the columns its sheet defines
- **THEN** the build continues and writes its output

#### Scenario: Header mismatch
- **WHEN** a file's header differs from its sheet, for example a misnamed or re-exported file
- **THEN** the build exits non-zero, names the file and the missing or extra columns, and writes no JSON

### Requirement: Scope of sheets
The build SHALL read repairs, sites, customers and assumptions, and SHALL NOT schema-validate `readme.csv` or `data_dictionary.csv` as data sheets.

#### Scenario: Other sheets untouched
- **WHEN** the build runs
- **THEN** it writes JSON only for the four sheets above

### Requirement: Row validation without silent loss
The build SHALL validate each row against a schema and SHALL count every invalid row with its reason; it SHALL NOT drop a row without counting it.

#### Scenario: Invalid row
- **WHEN** a repairs row has a non-numeric `repair_count`
- **THEN** the row is excluded from the JSON and counted as invalid with its reason in the report

### Requirement: Data-quality report
The build SHALL write a report with, per file, rows read, rows valid, invalid rows with reasons, and the results of cross-checks.

#### Scenario: Repairs cross-check
- **WHEN** a repairs row's `repair_count` differs from its `estimated_replacements_postponed`
- **THEN** the report lists the disagreement with the row's month, site, product and both values

#### Scenario: Clean cross-check
- **WHEN** no repairs row disagrees
- **THEN** the report shows the cross-check as passed with the number of rows checked

### Requirement: Data source adapter
Data SHALL reach the engine through a `DataSource` interface that returns plain, serialisable objects, with one adapter reading the generated JSON.

#### Scenario: Engine input
- **WHEN** a caller asks the adapter for data
- **THEN** it receives plain objects and no engine code depends on how they were loaded
