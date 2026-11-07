# provenance-display Delta

## MODIFIED Requirements

### Requirement: Fact stat card
A FactStatCard SHALL render an engine Fact as a StatCard with a plain label, unit, one compact ProvenanceChip and ShowMath, formatting the value and unit for display and taking all provenance from the Fact. The chip SHALL show the method as a glyph and a short word, and the source as a small mark with an accessible name. A Fact with several methods SHALL show the least certain method's word and a count of the others in the one chip. The chip SHALL always be one line: it SHALL NOT wrap, and the full text of every method and the source SHALL be its accessible name and tooltip. A Fact whose value is null SHALL render the "Needs input" state with the chip and Show math kept.

#### Scenario: Fact rendered
- **WHEN** a Fact is passed to FactStatCard
- **THEN** the card shows its label, formatted value and unit, one chip with the method word, glyph and a source mark, and Show math with its formula, inputs and assumption IDs

#### Scenario: Several methods
- **WHEN** a Fact has methods ALLOCATED and ESTIMATED
- **THEN** the one chip shows "Estimated" with a "+1" count, in the amber tint, and Show math lists both

#### Scenario: Never wraps
- **WHEN** a card is narrow, such as in the Scope row with both sidebars open
- **THEN** the chip stays on one line and the grid shows fewer columns instead of squeezing the cards

#### Scenario: Missing range
- **WHEN** the Fact has no low or high value
- **THEN** Show math shows them as "not yet modelled"

#### Scenario: In the gallery
- **WHEN** the user opens `/design`
- **THEN** FactStatCard appears with a fixture Fact labelled as sample data

#### Scenario: Fact without a value
- **WHEN** a Fact with a null value is passed to FactStatCard
- **THEN** the card shows "Needs input" instead of a number, and the chip and Show math are still present

## ADDED Requirements

### Requirement: Page legend
Each dashboard section page SHALL show one line explaining the chip: the method words and the source marks. It SHALL NOT repeat per card.

#### Scenario: Legend
- **WHEN** a section page opens
- **THEN** one legend line is shown, and no card repeats it
