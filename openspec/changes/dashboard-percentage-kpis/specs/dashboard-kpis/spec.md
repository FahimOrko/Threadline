## ADDED Requirements

### Requirement: Percentage cards
The dashboard SHALL show, under a "Percentages" heading, the on-time cycle rate, one "Repairs per 100 garments (Dec)" card per product the customer has, and the recycling and reuse share of textile waste for the selected customer, each with value, provenance chip and Show math, identical for the KAM and Customer roles and following `?customer=`.

#### Scenario: Cards for a customer
- **WHEN** the user opens the dashboard for NorthStar Foods Group
- **THEN** the section shows the on-time rate (labelled as sampled cycles), a "Repairs per 100 garments (Dec)" card per product (for example 57.2 per 100 garments for Work Jacket Standard, no % sign), and the recycling and reuse share in percent; all with one decimal

#### Scenario: Display rule
- **WHEN** the cards are shown
- **THEN** every value has one decimal, and repairs per 100 garments shows "per 100 garments" with no % sign

#### Scenario: Waste share method
- **WHEN** the user opens Show math on the recycling and reuse share
- **THEN** it states that waste is allocated by washed-kg share and lists A003 and A004

#### Scenario: Another customer
- **WHEN** the user selects another customer
- **THEN** every card in the section shows that customer's values

#### Scenario: Wide screen
- **WHEN** the dashboard is viewed at 1280px in the light or dark theme
- **THEN** the cards wrap in the same grid as the other sections without clipping
