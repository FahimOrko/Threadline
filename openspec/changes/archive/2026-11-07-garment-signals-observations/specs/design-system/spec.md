# Spec Delta

## ADDED Requirements

### Requirement: Observation card
An ObservationCard component SHALL show an observation's type and severity as a labelled badge (never colour alone), its text, the suggested action, a ProvenanceChip with Show math for the Facts it rests on, and links to the flagged sites. It SHALL be in the `/design` gallery with sample data confined to `src/app/design/` and listed in `docs/design.md`.

#### Scenario: Card content
- **WHEN** an observation with two flagged sites is rendered
- **THEN** the card shows type, severity, text, action, chip, Show math and two site links

#### Scenario: Gallery
- **WHEN** `/design` is opened
- **THEN** it shows a risk, a value and a gap card in dark and light
