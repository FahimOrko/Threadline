## ADDED Requirements

### Requirement: Report copy voice
Chapter lines, panel titles, card labels, the data-sources note and explainers in the story report SHALL follow the Copy voice section of `docs/conventions.md`. Tokens, banned words and the digit rule hold unchanged. The report SHALL NOT say "trees saved"; where it mentions trees it SHALL call them an equivalence shown in Impact World.

#### Scenario: Trees note
- **WHEN** the data-sources note mentions trees
- **THEN** it describes an equivalence and a labelled illustration, and does not say "saved"

#### Scenario: Scan
- **WHEN** the tests scan the chapter templates and explainers
- **THEN** none contains a banned word or a digit outside a token
