## ADDED Requirements

### Requirement: Plain-language sensitivity labels
Sensitivity levels SHALL be displayed as "Cautious estimate" (low: the old laundry is assumed more efficient than the data pack says, so savings come out smaller), "Standard estimate" (base: factors as given in the data pack) and "Generous estimate" (high: the old laundry is assumed less efficient, so savings come out larger). The labels SHALL come from one map reused by every surface: the game buttons, the header picker, the story text, the game path strip and the print cover. URL values SHALL stay `low`, `base` and `high`. The T002 framing SHALL stay in Show math and methodology.

#### Scenario: Header picker
- **WHEN** `?sensitivity=high` is in the address
- **THEN** the header picker shows "Generous estimate" and the address still holds `high`

#### Scenario: One map
- **WHEN** the tests check each surface
- **THEN** each takes its label from the shared map
