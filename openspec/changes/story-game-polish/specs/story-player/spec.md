## ADDED Requirements

### Requirement: Play the review link
The Story cover (not the print route) SHALL offer a "Play the review" link to `/story/game` that preserves every query param, including unknown ones.

#### Scenario: Params preserved
- **WHEN** `/story` is opened with `?customer=CUST002&baseline=B_HOME&view=customer&x=1`
- **THEN** "Play the review" opens `/story/game` with the same four params unchanged

#### Scenario: Not printed
- **WHEN** the print route is rendered
- **THEN** no "Play the review" link is shown
