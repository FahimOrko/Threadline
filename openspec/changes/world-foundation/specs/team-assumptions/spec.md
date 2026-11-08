## ADDED Requirements

### Requirement: Public reference factor T011
The config SHALL hold T011, the CO2e absorbed by one urban tree seedling grown for 10 years, as 0.060 tCO2e per tree, with a note naming its source (US EPA Greenhouse Gas Equivalencies Calculator). An entry MAY declare its Fact source as PUBLIC_REFERENCE instead of ASSUMPTION when its value is a published figure; T011 SHALL. Facts that use it SHALL carry the ILLUSTRATIVE method and Show math that lists T011, its value, unit, note and source. It SHALL NOT be editable at runtime.

#### Scenario: Chip
- **WHEN** a tree figure is shown
- **THEN** its chip reads Illustrative with the Public reference source in the uncertain tint

#### Scenario: Show math
- **WHEN** Show math of a tree figure is opened
- **THEN** it lists T011 with 0.060, tCO2e per tree, the EPA source and that the figure is illustrative
