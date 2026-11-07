# Spec Delta

## ADDED Requirements

### Requirement: Pickup gap aggregate
At build time the pipeline SHALL group service cycles by asset, sort each asset's pickups by timestamp, take the whole-day gaps between consecutive pickups and ship, per customer and site, only a histogram of gap days to counts. Raw cycles SHALL NOT ship and no threshold SHALL be applied in the pipeline.

#### Scenario: Gaps by timestamp
- **WHEN** an asset's cycles are out of order by cycle number
- **THEN** its gaps are taken from the timestamp order

#### Scenario: One pickup
- **WHEN** an asset has a single pickup
- **THEN** it adds no gap

#### Scenario: NorthStar totals
- **WHEN** the pipeline runs on the pack
- **THEN** CUST001 has 9 244 gaps with a median of 49 days and a maximum of 170
