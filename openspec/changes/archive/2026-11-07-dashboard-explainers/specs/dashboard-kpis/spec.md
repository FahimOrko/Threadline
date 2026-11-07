## MODIFIED Requirements

### Requirement: Needs input instead of a number
A dashboard card whose Fact has no value SHALL show "Needs input" in place of the value, with a hint in plain words naming what is missing and who can supply it (for the rental fee: "Needs a rental fee from Lindström"), and SHALL NOT show 0 or NaN or an assumption id on screen. The assumption id SHALL stay in Show math.

#### Scenario: T001 unset
- **WHEN** the dashboard shows Cost of unused allocation while the rental fee is unset
- **THEN** the card reads "Needs input" with "Needs a rental fee from Lindström", keeps its amber chip and offers Show math, which lists T001
