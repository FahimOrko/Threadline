# Spec Delta

## ADDED Requirements

### Requirement: Stat card needs-input state
StatCard SHALL support a "Needs input" state that replaces the value with the words "Needs input" and a short hint, keeps the same box layout as a card with a value, and is shown in the /design gallery next to the normal card.

#### Scenario: State in the gallery
- **WHEN** the user opens `/design`
- **THEN** the needs-input StatCard appears in both themes, with its hint and a provenance chip, and does not show 0 or NaN

#### Scenario: Same layout
- **WHEN** a needs-input card sits in a row with value cards
- **THEN** the cards keep equal widths and no card changes size when the state changes
