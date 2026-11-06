# data-pipeline Specification

## Purpose
Turns the source CSVs into validated JSON and a data-quality report, and hands data to the engine through an adapter, so every number rests on checked data and visible data issues.

## Requirements

### Requirement: Header verification fails the build
`npm run data:build` SHALL compare each source file's header columns, as a set, with its sheet definition in `data_dictionary.csv` and SHALL exit non-zero, naming the file and the columns, when an expected column is missing or an unknown column is present. Column order SHALL NOT matter.

#### Scenario: Header matches
- **WHEN** every file the build reads has the columns its sheet defines
- **THEN** the build continues and writes its output

#### Scenario: Missing column
- **WHEN** a file lacks a column its sheet defines
- **THEN** the build exits non-zero, names the file and the missing column, and writes no JSON

#### Scenario: Unknown extra column
- **WHEN** a file has a column its sheet does not define
- **THEN** the build exits non-zero and names the file and the extra column

#### Scenario: Different column order
- **WHEN** a file has exactly the columns its sheet defines, in another order
- **THEN** the build continues

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

### Requirement: Generated data is built, not committed
`data/generated/` SHALL be git-ignored and SHALL be produced by `npm run data:build`, which `npm run dev` and `npm run build` SHALL run first; `data/raw/` SHALL stay committed.

#### Scenario: Clean checkout
- **WHEN** a developer clones the repo and runs `npm run dev` or `npm run build`
- **THEN** the data build runs first and the app finds the generated JSON

#### Scenario: Data build fails
- **WHEN** the data build exits non-zero
- **THEN** `npm run dev` and `npm run build` stop without starting
