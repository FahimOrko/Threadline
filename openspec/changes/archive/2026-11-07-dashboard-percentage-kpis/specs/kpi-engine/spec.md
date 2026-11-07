## ADDED Requirements

### Requirement: On-time cycle rate
The engine SHALL compute the on-time cycle rate for a customer as ON_TIME cycles divided by all cycles over the customer's sites, as a percentage, with method MEASURED and source SYNTHETIC, labelled as a rate over sampled cycles. A customer with no cycles SHALL have no such Fact.

#### Scenario: Rate and label
- **WHEN** the engine runs for a customer with cycles
- **THEN** the Fact value is ON_TIME cycles / cycles x 100, its label and Show math inputs state "sampled cycles", and its inputs list both counts

#### Scenario: Customer isolation
- **WHEN** the engine runs for another customer
- **THEN** only that customer's sites are counted

### Requirement: Repairs per 100 garments by product
The engine SHALL compute, for each product the customer has December allocated pieces for, the full-year repair count divided by December allocated pieces, multiplied by 100, with unit "per 100 garments" (not "%"), labelled "Repairs per 100 garments (Dec)", with method CALCULATED and source SYNTHETIC. A product without December allocation SHALL have no Fact.

#### Scenario: Per product
- **WHEN** the engine runs for a customer
- **THEN** it returns one Fact per product with December allocation, each with that product's repair count and allocated pieces as inputs

#### Scenario: Basis stated
- **WHEN** Show math is opened on a repairs-per-100-garments Fact
- **THEN** it states that full-year repairs are divided by December allocated pieces and that it counts repair events, so one garment can be repaired more than once

### Requirement: Recycling and reuse share of textile waste
The engine SHALL compute the share of the customer's allocated textile waste that is recycled or reused as the sum over the customer's laundry-months of allocated waste kg times (recycling_kg + reuse_kg) / textile_waste_total_kg, divided by the customer's total allocated waste kg, as a percentage, with methods ALLOCATED and ESTIMATED, source SYNTHETIC and assumptions A003 and A004. Its formula text SHALL say waste is allocated to the customer by washed-kg share.

#### Scenario: Share
- **WHEN** the engine runs for a customer
- **THEN** the value is between 0 and 100, its inputs list allocated kg and recycled-or-reused kg, and A003 and A004 are in its assumption IDs

#### Scenario: Missing laundry-month (backstop)
- **WHEN** data that bypassed the build gives a customer allocated waste for a laundry-month that has no waste_circularity row
- **THEN** the engine throws an error naming the laundry and month instead of returning a number
