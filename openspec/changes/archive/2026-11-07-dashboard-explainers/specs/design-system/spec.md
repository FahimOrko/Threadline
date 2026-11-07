## MODIFIED Requirements

### Requirement: Observation card
An ObservationCard component SHALL show an observation's type as a labelled badge and, except for value highlights, its severity (Low, Medium or High) as a labelled badge (never colour alone), its text, the suggested action, a ProvenanceChip with Show math for the Facts it rests on, and links to the flagged sites. It SHALL be in the `/design` gallery with sample data confined to `src/app/design/` and listed in `docs/design.md`.

#### Scenario: Card content
- **WHEN** an observation with two flagged sites is rendered
- **THEN** the card shows type, severity, text, action, chip, Show math and two site links

#### Scenario: Value card
- **WHEN** a value observation is rendered
- **THEN** no severity badge shows

#### Scenario: Gallery
- **WHEN** `/design` is opened
- **THEN** it shows a risk, a value and a gap card in dark and light

## ADDED Requirements

### Requirement: Info popover component
An InfoPopover component SHALL render the "i" button (Phosphor Info, regular weight) and a popover on the existing Popover primitive, take resolved text and never a number of its own. It SHALL be in the `/design` gallery in dark and light and listed in `docs/design.md`.

#### Scenario: Gallery
- **WHEN** `/design` is opened
- **THEN** InfoPopover shows closed and open, in dark and light
