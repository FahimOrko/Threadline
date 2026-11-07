## ADDED Requirements

### Requirement: Info popover
Every dashboard card, panel figure and chart whose meaning is not obvious from its label SHALL show an "i" button at its top-right corner. Click, Enter, Space or hover SHALL open a short popover with what the figure means in plain words and why it matters to the KAM and the customer. The button SHALL have the accessible name "What does this mean?" and the popover SHALL be reachable by keyboard and closable with Escape. It SHALL be separate from Show math, which keeps formula, inputs and sources.

#### Scenario: Open by keyboard
- **WHEN** the KAM focuses the "i" on Water saved and presses Enter
- **THEN** a popover shows the explanation and Show math is not opened

#### Scenario: Obvious label
- **WHEN** a card is Active wearers, Garments in circulation or Delivery sites
- **THEN** it shows no "i"

### Requirement: One registry of explanations
Explanation text SHALL be fixed template text in one registry keyed by Fact id or by a chart or panel id (`chart:…`, `panel:…`), never inside a component. A number in an explanation SHALL come only from a `{{fact:id}}` token; the selected comparison is the word `{comparison}`. A token whose Fact has no value SHALL read "needs input".

#### Scenario: Token resolves
- **WHEN** the Water saved explanation renders
- **THEN** the figure in it equals the Water saved card value

#### Scenario: Missing value
- **WHEN** a token's Fact value is null
- **THEN** the explanation reads "needs input" for it, never a number

### Requirement: Plain wording is tested
No explanation SHALL contain a digit outside a token (the unit "CO2e" excepted) or any of: "Fact", an assumption id (T or A followed by digits), "baseline", "assumptions config", "tier", "trailing average", "critical", "dormant", "cut-off". The same words SHALL NOT appear in the dashboard's labels, intros, captions or hints on screen; they stay in Show math.

#### Scenario: Banned wording
- **WHEN** the test scans every registry entry
- **THEN** none contains a banned word or a digit outside a token

### Requirement: Every listed card has an explanation
Every key on the review list of this change SHALL exist in the registry with non-empty text, and every "i" rendered SHALL resolve to a registry entry.

#### Scenario: Coverage
- **WHEN** the coverage test runs
- **THEN** each listed key has an explanation and no rendered "i" lacks one

### Requirement: An unset figure never reads inside a sentence
A sentence in an intro or an explanation whose figure can be unset SHALL carry a separate sentence for the missing case (for the rental fee: "The cost of unused garments can be shown once Lindström provides a rental fee."). A plain sentence whose token has no value SHALL be left out. No rendered intro or explanation SHALL contain "Needs input" inside a sentence.

#### Scenario: Rental fee unset
- **WHEN** the Costs intro renders while the rental fee is unset
- **THEN** it reads the missing-case sentence and contains no "Needs input"

#### Scenario: Any token missing
- **WHEN** any single token's Fact value is null
- **THEN** no intro or explanation renders "Needs input"

### Requirement: No unit followed by its noun
An intro or explanation SHALL NOT print a figure with its unit and then the unit's noun again (for example "31 743 pieces garments").

#### Scenario: Garments intro
- **WHEN** the Garments intro renders
- **THEN** it reads the garments figure once, as "pieces"
