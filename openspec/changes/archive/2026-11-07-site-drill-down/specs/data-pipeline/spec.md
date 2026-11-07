## ADDED Requirements

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
