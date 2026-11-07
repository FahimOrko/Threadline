## ADDED Requirements

### Requirement: Footprint section
The dashboard SHALL show, under a "Footprint" heading, savings vs the local laundry baseline (water, energy, CO2e, absolute and percent), the service footprint (total, per tonne washed, per wearer (Dec)) and the delivery footprint (delivery emissions, delivery share, and the net CO2e saved beside them) for the selected customer, each with value, provenance chip and Show math, identical for the KAM and Customer roles and following `?customer=`.

#### Scenario: Labels name the baseline
- **WHEN** the section is shown
- **THEN** every savings card label contains "vs local laundry"

#### Scenario: NorthStar values
- **WHEN** the user opens the dashboard for NorthStar Foods Group
- **THEN** the cards show 1 406 483 L, 171 643 kWh, 255 074 kgCO2e saved and 29.5%, 32.6%, 77.6%, a service footprint of 73 785 kgCO2e at 147 kgCO2e/t washed, and delivery of 23 785 kgCO2e at 32.2%

#### Scenario: Delivery beside the net result
- **WHEN** the delivery group is shown
- **THEN** the net CO2e saved card appears in the same group as the delivery cards, and also in the saved group, rendered from the same Fact

#### Scenario: Data gap
- **WHEN** the delivery group is shown
- **THEN** it states that route kilometres are not in the data pack

#### Scenario: Another customer
- **WHEN** the user selects another customer
- **THEN** every card in the section shows that customer's values

#### Scenario: Wide screen
- **WHEN** the dashboard is viewed at 1280px in the light or dark theme
- **THEN** the cards wrap in the same grid as the other sections without clipping
