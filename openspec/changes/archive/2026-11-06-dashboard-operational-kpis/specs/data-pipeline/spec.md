# Spec Delta

## MODIFIED Requirements

### Requirement: Scope of sheets
The build SHALL read repairs, sites, customers, assumptions and service_activity, and SHALL NOT schema-validate `readme.csv` or `data_dictionary.csv` as data sheets. The service_activity sheet SHALL follow the same header verification, strict row validation and data-quality reporting as the other sheets.

#### Scenario: Other sheets untouched
- **WHEN** the build runs
- **THEN** it writes JSON only for the five sheets above

#### Scenario: Service activity loaded
- **WHEN** the build runs on the pack
- **THEN** `data/generated/` holds the service-activity rows and the data-quality report counts rows read, valid and invalid for them

#### Scenario: Service activity header mismatch
- **WHEN** the service_activity file has a column missing from or unknown to its dictionary sheet
- **THEN** the build fails naming the file and the columns
