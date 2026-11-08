## MODIFIED Requirements

### Requirement: Design gallery
The app SHALL provide a /design route listing every reusable component in all its states, in sections Tokens, Provenance, Data display, Controls, States, Effects and Landing, and the Effects section SHALL be labelled as reserved for Story and Impact World. The Landing section SHALL show the hero, the bento cards (including the "Coming later" card), the FAQ and the footer, with static sample copy and no figures.

#### Scenario: Open the gallery
- **WHEN** the user opens /design
- **THEN** each reusable component appears under its section with its states and the active theme applies

#### Scenario: Effects section reserved
- **WHEN** the user views the Effects section
- **THEN** it states that effects are used only in Story and Impact World and shows no data-view component with effects

#### Scenario: Landing section
- **WHEN** the user views the Landing section
- **THEN** the hero, five bento cards, the FAQ accordion and the footer note are shown
