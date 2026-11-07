## MODIFIED Requirements

### Requirement: Range not yet modelled
Show math SHALL display the base value and SHALL mark low and high as not yet modelled for every card whose Fact has no range. Savings cards SHALL show low, base and high.

#### Scenario: Range
- **WHEN** Show math is open
- **THEN** a card without a range reads "not yet modelled" for low and high and shows the base value, and a savings card shows low, base and high

### Requirement: Footprint section
The dashboard SHALL show, under a "Footprint" heading, savings vs the selected baseline (water, energy, CO2e, absolute and percent) at the selected sensitivity, the service footprint (total, per tonne washed, per wearer (Dec)) and the delivery footprint (delivery emissions, delivery share, and the net CO2e saved beside them) for the selected customer, each with value, provenance chip and Show math, identical for the KAM and Customer roles and following `?customer=`, `?baseline=` and `?sensitivity=`.

#### Scenario: Card number display
- **WHEN** any dashboard card shows a value
- **THEN** a value of absolute size 100 or more is a whole number, a value below 100 has one decimal, and "%" keeps one decimal, rounded only at display, while Show math inputs keep their current formatting

#### Scenario: Labels name the baseline
- **WHEN** the section is shown for local laundry, home washing or in-house laundry
- **THEN** every savings card label contains "vs local laundry", "vs home washing" or "vs in-house laundry" respectively, and the section description names the same baseline

#### Scenario: NorthStar values
- **WHEN** the user opens the dashboard for NorthStar Foods Group with the default baseline and sensitivity
- **THEN** the cards show 1 406 483 L, 171 643 kWh, 255 074 kgCO2e saved and 29.5%, 32.6%, 77.6%, a service footprint of 73 785 kgCO2e at 147 kgCO2e/t washed (7.7 per wearer), and delivery of 23 785 kgCO2e at 32.2%

#### Scenario: Selected sensitivity on the cards
- **WHEN** the user selects high
- **THEN** the savings cards show the high values, the service and delivery cards do not change, and the provenance chip on savings cards reads as assumed

#### Scenario: Delivery beside the net result
- **WHEN** the delivery group is shown for any baseline, including home washing with a zero baseline delivery factor
- **THEN** the net CO2e saved card appears in the same group as the delivery cards, and also in the saved group, rendered from the same Fact, and Show math on delivery carries the net-comparison note

#### Scenario: Data gap
- **WHEN** the delivery group is shown
- **THEN** it states that route kilometres are not in the data pack

#### Scenario: Another customer
- **WHEN** the user selects another customer
- **THEN** every card in the section shows that customer's values

#### Scenario: Wide screen
- **WHEN** the dashboard is viewed at 1280px in the light or dark theme with home washing and high selected
- **THEN** the cards wrap in the same grid as the other sections without clipping
