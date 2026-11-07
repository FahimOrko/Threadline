## MODIFIED Requirements

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

## ADDED Requirements

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
