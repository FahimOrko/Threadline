# Spec Delta

## MODIFIED Requirements

### Requirement: Ending scene
After the last scene the game SHALL show an ending scene in which the KAM recaps each choice in order with its plain-language label, and buttons to the report's export card (`/story#export`, labelled "Download the data") and `/story` that carry the same `?customer=`, `?baseline=`, `?sensitivity=` and `?priorities=`. The ending SHALL contain a clearly marked slot for a later Impact World link that renders nothing until a target route is set, and SHALL NOT link to a route that does not exist.

#### Scenario: Links keep params
- **WHEN** the reader ends a game with `?customer=CUST002&baseline=B_HOME&sensitivity=high&priorities=cost`
- **THEN** both buttons open with those values unchanged

#### Scenario: Impact World slot empty
- **WHEN** no Impact World route has been set
- **THEN** no Impact World button or link is rendered

### Requirement: Links preserve existing query params
Every link the game produces (dialogue next, choices, ending buttons, `/story` and `/story#export`) SHALL preserve all existing query params, including ones the game does not know, and SHALL change only `scene`, `beat` and the lever params that the step sets.

#### Scenario: Unknown param
- **WHEN** the address holds `?view=customer&x=1` and the reader advances, chooses or opens `/story`
- **THEN** the resulting address still holds `view=customer` and `x=1`

### Requirement: Existing routes unchanged
`/story` SHALL behave as before except as the story-export capability changes it; the game SHALL NOT alter their chapters, text or params.

#### Scenario: Story unaffected
- **WHEN** `/story` is opened with the same params as a finished game
- **THEN** it renders exactly as it did before this change

### Requirement: Link to the full report
The game header SHALL show a "Read the full report" control beside "Start over", in the same place on every beat. It SHALL be disabled on every beat until the ending, with the visible hint "Finish the review to open your report", and SHALL be active on the ending, opening `/story` with every query param kept (only `scene` and `beat` dropped). The ending's own "Read the full report" and "Download the data" buttons SHALL stay in the same place.

#### Scenario: Before the ending
- **WHEN** the reader is on any beat before the ending
- **THEN** the header control is disabled, the hint is visible, and the layout is the same as on the ending

#### Scenario: On the ending
- **WHEN** the address holds `?scene=end&view=customer&x=1&baseline=B_HOME`
- **THEN** the header control opens `/story` with `view`, `x` and `baseline` unchanged, and the hint is gone

### Requirement: Game links keep the view
Every link in the game and every link from the report back into the app SHALL carry `?view=` unchanged (ADR 0023): the company picker choices, Previous, Next, Start over, "Read the full report", "Download the data", the priority chips and the site links.

#### Scenario: Picker keeps the customer view
- **WHEN** the reader in the customer view chooses a company
- **THEN** the address still holds `view=customer` and the customer view is shown

#### Scenario: Report links
- **WHEN** `/story?view=customer` is open
- **THEN** every priority chip and site link holds `view=customer`, and the export link is unchanged

