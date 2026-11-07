# Spec Delta

## MODIFIED Requirements

### Requirement: Scope of sheets
The build SHALL read repairs, sites, customers, assumptions, service_activity and products, and SHALL NOT schema-validate `readme.csv` or `data_dictionary.csv` as data sheets. The service_activity and products sheets SHALL follow the same header verification, strict row validation and data-quality reporting as the other sheets.

#### Scenario: Other sheets untouched
- **WHEN** the build runs
- **THEN** it writes JSON only for the six sheets above

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

## ADDED Requirements

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
