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
No explanation SHALL contain a digit outside a token (the unit "CO2e" excepted) or any of: "Fact", an assumption id (T or A followed by digits), "baseline factor", "assumptions config", "tier", "trailing average".

#### Scenario: Banned wording
- **WHEN** the test scans every registry entry
- **THEN** none contains a banned word or a digit outside a token

### Requirement: Every listed card has an explanation
Every key on the review list of this change SHALL exist in the registry with non-empty text, and every "i" rendered SHALL resolve to a registry entry.

#### Scenario: Coverage
- **WHEN** the coverage test runs
- **THEN** each listed key has an explanation and no rendered "i" lacks one
