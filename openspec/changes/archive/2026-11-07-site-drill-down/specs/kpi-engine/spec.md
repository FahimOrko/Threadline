## ADDED Requirements

### Requirement: Site scope
The engine SHALL accept an optional `siteId` in the scope. With it, the operational, money and utilization, on-time and per-product repair Facts SHALL filter their rows by customer and site, carry the site in `scope`, and use the same formulas and provenance as at customer level. Without it, results SHALL NOT change. Delivery sites, recycling and reuse share and the footprint Facts SHALL NOT be computed at site level.

#### Scenario: Sites add up
- **WHEN** wearers, garments, repairs and service requests are computed for each NorthStar site
- **THEN** their sums equal the customer-level Facts

#### Scenario: Other customer's site
- **WHEN** a site id is combined with a customer it does not belong to
- **THEN** every site Fact is zero or omitted and no other customer's rows are counted

#### Scenario: No site id
- **WHEN** the scope has no `siteId`
- **THEN** every existing Fact keeps its value

### Requirement: Site comparison
The engine SHALL return, for a site, pairs of Facts for garment utilization (Dec) and repairs per 100 garments (Dec, all products) for the site and for its customer, the second being full-year repairs over December garments in circulation x 100, CALCULATED, SYNTHETIC. A rate with no garments SHALL be omitted.

#### Scenario: Pair values
- **WHEN** the comparison is computed for a site
- **THEN** the site Fact equals the site's scanned over allocated pieces and the customer Fact equals the customer's, each recomputed independently from the CSVs in the test

#### Scenario: No garments
- **WHEN** a site has no allocated pieces in the last month
- **THEN** its repairs-per-100 Fact is omitted and utilization is 0 with the undefined note
