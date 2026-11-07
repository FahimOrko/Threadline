## MODIFIED Requirements

### Requirement: Scope of sheets
The build SHALL read repairs, sites, customers, assumptions, service_activity, products, service_cycles, waste_circularity and customer_impacts, and SHALL NOT schema-validate `readme.csv` or `data_dictionary.csv` as data sheets. The three new sheets SHALL follow the same header verification, strict row validation and data-quality reporting as the other sheets.

#### Scenario: Other sheets untouched
- **WHEN** the build runs
- **THEN** it writes JSON only for the nine sheets above (service_cycles and customer_impacts as aggregates)

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
- **THEN** the data-quality report counts rows read, valid and invalid for service_cycles, waste_circularity and customer_impacts

#### Scenario: New sheet header mismatch
- **WHEN** one of the new files has a column missing from or unknown to its dictionary sheet
- **THEN** the build fails naming the file and the columns, and writes no JSON

## ADDED Requirements

### Requirement: Large sheets pre-aggregated at build time
The build SHALL reduce service_cycles to per-site counts of cycles and ON_TIME cycles, and customer_impacts to allocated textile waste per customer, laundry and month, and SHALL NOT write the raw rows of either sheet to `data/generated/`.

#### Scenario: No raw cycles shipped
- **WHEN** the build finishes on the pack
- **THEN** the generated cycle data has one row per customer site and the counts sum to the number of valid cycles

#### Scenario: Aggregates match the source
- **WHEN** the aggregate for a site is compared with its rows in `service_cycles.csv`
- **THEN** its cycle count and ON_TIME count are equal to the counts in the CSV

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
