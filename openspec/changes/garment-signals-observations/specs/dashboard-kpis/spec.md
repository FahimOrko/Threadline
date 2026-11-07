# Spec Delta

## ADDED Requirements

### Requirement: Observations section
The dashboard SHALL show an Observations section with one ObservationCard per observation of the selected customer, placed after the cards and before the Sites table, with an empty state when there are none. A flagged site SHALL link to its site page keeping the `customer`, `baseline` and `sensitivity` params. The site page SHALL NOT gain an observations block.

#### Scenario: NorthStar
- **WHEN** the dashboard is opened for CUST001
- **THEN** five observations show: one value, three risks and one gap

#### Scenario: Link keeps params
- **WHEN** a site link is followed from `?customer=CUST001&baseline=home&sensitivity=high`
- **THEN** the site page opens with the same three params

#### Scenario: Other customer
- **WHEN** the customer is changed in the header
- **THEN** the section shows that customer's observations
