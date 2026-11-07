# Spec Delta

## ADDED Requirements

### Requirement: Story figures use the registry
Every figure, chart and summary panel on the Story page whose meaning is not obvious from its label SHALL show an "i" resolved from the same registry as the dashboard. Where a story figure has no entry, an entry SHALL be added, keyed by Fact id or by a `chart:` or `panel:` id.

#### Scenario: Coverage
- **WHEN** the coverage test lists every "i" key the story can render
- **THEN** each has a non-empty registry entry

#### Scenario: Obvious label
- **WHEN** a story figure is Delivery sites, Active wearers or Garments in circulation
- **THEN** it shows no "i"

## MODIFIED Requirements

### Requirement: Plain wording is tested
No explanation SHALL contain a digit outside a token (the unit "CO2e" excepted) or any of: "Fact", an assumption id (T or A followed by digits), "baseline", "assumptions config", "tier", "trailing average", "critical", "dormant", "cut-off". The same words SHALL NOT appear in the labels, intros, captions or hints on the dashboard or the Story page; they stay in Show math. On the Story page an assumption id MAY appear only as a cell of the team-assumptions table.

#### Scenario: Banned wording
- **WHEN** the test scans every registry entry
- **THEN** none contains a banned word or a digit outside a token

#### Scenario: Story files scanned
- **WHEN** the on-screen wording test scans the story page, chapter data and closing text
- **THEN** none contains a banned word in prose

### Requirement: An unset figure never reads inside a sentence
A sentence in an intro, a story chapter line or an explanation whose figure can be unset SHALL carry a separate sentence for the missing case (for the rental fee: "The cost of unused garments can be shown once Lindström provides a rental fee."). A plain sentence whose token has no value SHALL be left out. No rendered intro, chapter line or explanation SHALL contain "Needs input" inside a sentence.

#### Scenario: Rental fee unset
- **WHEN** the Costs intro or the euros chapter line renders while the rental fee is unset
- **THEN** it reads the missing-case sentence and contains no "Needs input"

#### Scenario: Any token missing
- **WHEN** any single token's Fact value is null
- **THEN** no intro, chapter line or explanation renders "Needs input"
