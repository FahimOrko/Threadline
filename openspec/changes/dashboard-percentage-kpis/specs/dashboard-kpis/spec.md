## ADDED Requirements

### Requirement: Percentage cards
The dashboard SHALL show, under a "Percentages" heading, the on-time cycle rate, one repair-rate card per product the customer has, and the recycling and reuse share of textile waste for the selected customer, each with value, provenance chip and Show math. Percentages SHALL print with one decimal. The cards SHALL be identical for the KAM and Customer roles and SHALL follow `?customer=`.

#### Scenario: Cards for a customer
- **WHEN** the user opens the dashboard for NorthStar Foods Group
- **THEN** the section shows the on-time rate (labelled as sampled cycles), a repair-rate card per product labelled "(Dec)", and the recycling and reuse share, each in percent with one decimal

#### Scenario: Waste share method
- **WHEN** the user opens Show math on the recycling and reuse share
- **THEN** it states that waste is allocated by washed-kg share and lists A003 and A004

#### Scenario: Another customer
- **WHEN** the user selects another customer
- **THEN** every card in the section shows that customer's values

#### Scenario: Wide screen
- **WHEN** the dashboard is viewed at 1280px in the light or dark theme
- **THEN** the cards wrap in the same grid as the other sections without clipping
