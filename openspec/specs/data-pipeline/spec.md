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
The build SHALL read repairs, sites, customers, assumptions, service_activity, products, service_cycles, waste_circularity, customer_impacts, laundry_resources and baselines, and SHALL NOT schema-validate `readme.csv` or `data_dictionary.csv` as data sheets. Every sheet SHALL follow the same header verification, strict row validation and data-quality reporting.

#### Scenario: Other sheets untouched
- **WHEN** the build runs
- **THEN** it writes JSON only for the eleven sheets above (service_cycles and customer_impacts as aggregates)

#### Scenario: Service activity loaded
- **WHEN** the build runs on the pack
- **THEN** `data/generated/` holds the service-activity rows and the data-quality report counts rows read, valid and invalid for them

#### Scenario: Service activity header mismatch
- **WHEN** the service_activity file has a column missing from or unknown to its dictionary sheet
- **THEN** the build fails naming the file and the columns

#### Scenario: Products loaded
- **WHEN** the build runs on the pack
- **THEN** `data/generated/` holds the 6 product rows and the report counts 6 read, 6 valid, 0 invalid

#### Scenario: Products header mismatch
- **WHEN** the products file has a column missing from or unknown to its dictionary sheet
- **THEN** the build fails naming the file and the columns

#### Scenario: New sheets loaded
- **WHEN** the build runs on the pack
- **THEN** the data-quality report counts rows read, valid and invalid for service_cycles, waste_circularity, customer_impacts, laundry_resources and baselines

#### Scenario: New sheet header mismatch
- **WHEN** one of the new files has a column missing from or unknown to its dictionary sheet
- **THEN** the build fails naming the file and the columns, and writes no JSON

#### Scenario: Footprint sheets loaded
- **WHEN** the build runs on the pack
- **THEN** `data/generated/` holds 48 laundry-resources rows and 3 baselines

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

### Requirement: Product references resolve
The build SHALL fail, exit non-zero and write no JSON when a `product_id` in the repairs or service_activity rows is missing from the products rows, and its error SHALL name each missing product ID and the sheet it came from.

#### Scenario: Unknown product in repairs
- **WHEN** a repairs row has a `product_id` that is not in products
- **THEN** the build exits non-zero and the error names the product ID and the repairs sheet

#### Scenario: Unknown product in service activity
- **WHEN** a service_activity row has a `product_id` that is not in products
- **THEN** the build exits non-zero and the error names the product ID and the service_activity sheet

#### Scenario: All references resolve
- **WHEN** every product ID in repairs and service_activity is in products
- **THEN** the build continues

### Requirement: Large sheets pre-aggregated at build time
The build SHALL reduce service_cycles to per-site counts of cycles and ON_TIME cycles, and customer_impacts to allocated textile waste and customer washed kg per customer, laundry and month, and SHALL NOT write the raw rows of either sheet to `data/generated/`.

#### Scenario: No raw cycles shipped
- **WHEN** the build finishes on the pack
- **THEN** the generated cycle data has one row per customer site and the counts sum to the number of valid cycles

#### Scenario: Aggregates match the source
- **WHEN** the aggregate for a site is compared with its rows in `service_cycles.csv`
- **THEN** its cycle count and ON_TIME count are equal to the counts in the CSV

#### Scenario: Washed kg aggregate
- **WHEN** the impact aggregate for a customer is summed
- **THEN** its washed kg equals the sum of that customer's `customer_washed_kg` in `customer_impacts.csv`

### Requirement: Out-of-order scans reported
The build SHALL report in the data-quality report the number of out-of-order scans: cycles whose pickup timestamp is earlier than that of the same asset's previous cycle by cycle number (cycle number order disagrees with timestamp order). Such cycles SHALL stay in the counts and SHALL NOT fail the build.

#### Scenario: Out-of-order cycle
- **WHEN** an asset's cycle 3 has an earlier pickup timestamp than its cycle 2
- **THEN** the report counts one out-of-order scan and the build still succeeds

#### Scenario: Clean data
- **WHEN** every asset's pickup timestamps increase with cycle number
- **THEN** the report shows an out-of-order count of 0

### Requirement: Waste references fail the build
The build SHALL fail when a laundry-month that has allocated textile waste is missing from waste_circularity, exit non-zero, write no JSON and name the missing laundry-months.

#### Scenario: Missing laundry-month
- **WHEN** customer_impacts has allocated waste for laundry L001 in 2025-05 and waste_circularity has no row for it
- **THEN** the build exits non-zero, names L001 and 2025-05, and writes no JSON

#### Scenario: Pack passes
- **WHEN** the build runs on the pack
- **THEN** the check passes

### Requirement: Footprint references resolve
The build SHALL fail, exit non-zero and write no JSON when a laundry-month with washed kg in the impact aggregate has no laundry_resources row with `washed_kg` above zero, or when the default baseline id is missing from baselines, and its error SHALL name each missing laundry-month or baseline id and the sheet.

#### Scenario: Missing laundry-month
- **WHEN** customer_impacts has washed kg for laundry L001 in 2025-05 and laundry_resources has no row for it
- **THEN** the build exits non-zero, names L001 and 2025-05, and writes no JSON

#### Scenario: Missing baseline
- **WHEN** baselines has no row for the default baseline id
- **THEN** the build exits non-zero and names the baseline id and the baselines sheet

#### Scenario: Pack passes
- **WHEN** the build runs on the pack
- **THEN** both checks pass

### Requirement: Laundries sheet and site references
The build SHALL also read `laundries.csv` with the same header verification, strict row validation and data-quality reporting, and ship it as `laundries.json`. It SHALL fail, exit non-zero and write no JSON when a site's `primary_laundry_id` is not in laundries, and its error SHALL name each missing laundry id and the sites sheet.

#### Scenario: Laundries loaded
- **WHEN** the build runs on the pack
- **THEN** `laundries.json` holds 4 rows, the report counts 4 read and 4 valid, and the site reference check passes

#### Scenario: Laundries header mismatch
- **WHEN** the laundries file has a column missing from or unknown to its dictionary sheet
- **THEN** the build fails naming the file and the columns

#### Scenario: Unknown laundry
- **WHEN** a site has `primary_laundry_id` L999 and laundries has no such row
- **THEN** the build exits non-zero, names L999 and the sites sheet, and writes no JSON
