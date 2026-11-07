# dashboard-sections Delta

## MODIFIED Requirements

### Requirement: Overview opening
The Overview SHALL say whose year it shows, the period, what Lindström's service did for the customer and how to read the other sections, and SHALL then show the six section cards and the interactive chart defined in dashboard-overview, and SHALL keep the Facts for delivery sites, active wearers and garments in circulation in a smaller row below the cards.

#### Scenario: Overview content
- **WHEN** the Overview opens for CUST001
- **THEN** the intro names the customer and the period, six cards show the same values as the matching Facts, and delivery sites, active wearers and garments in circulation still show with their previous values

### Requirement: Each Fact on one page
Every Fact card that the dashboard showed before the split SHALL appear on exactly one section page with the same value, unit and provenance, except that the six Overview cards MAY repeat a headline Fact that also has its card on its own section page. A repeated Fact SHALL show the same value, unit and provenance in both places.

#### Scenario: No card lost or doubled
- **WHEN** the section pages other than the Overview are compared with the old single page for CUST001
- **THEN** each card appears once

#### Scenario: Overview repeats a headline
- **WHEN** the water saved card on the Overview is compared with the one on Environmental footprint
- **THEN** value, unit and provenance are identical
