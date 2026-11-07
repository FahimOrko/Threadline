# dashboard-sections Specification

## Purpose
Makes each dashboard section explain itself in plain language, with numbers that come from the engine only.

## Requirements

### Requirement: Section opening
Every dashboard section SHALL open with a subheading and a two to three sentence intro in plain language. The intro SHALL be fixed template text; every number in it SHALL come from a `{{fact:id}}` token resolved from the engine's Facts, never typed in. Intros, card and chart labels and captions SHALL NOT use the words "Fact", "baseline factor", "assumptions config", "tier" or "trailing average", or any assumption id. A figure that compares with the selected comparison SHALL be labelled by what it means, resolved from the comparison (for example "Less than home washing"), not "Share of …".

#### Scenario: Intro renders
- **WHEN** a section opens
- **THEN** the subheading and intro show, and each figure in the intro equals the matching card value

#### Scenario: A token has no value
- **WHEN** a token's Fact value is null
- **THEN** the intro shows "needs input" for it, never a number

#### Scenario: Comparison label
- **WHEN** the comparison is home washing
- **THEN** the ring caption reads "Less than home washing"

### Requirement: Overview opening
The Overview SHALL say whose year it shows, the period, what Lindström's service did for the customer and how to read the other sections, and SHALL then show the six section cards and the interactive chart defined in dashboard-overview, and SHALL keep the Facts for delivery sites, active wearers and garments in circulation in a smaller row below the cards.

#### Scenario: Overview content
- **WHEN** the Overview opens for CUST001
- **THEN** the intro names the customer and the period, six cards show the same values as the matching Facts, and delivery sites, active wearers and garments in circulation still show with their previous values

### Requirement: Each Fact on one page
Every Fact card that the dashboard showed before the split SHALL appear on exactly one section page with the same value, unit and provenance, except that the six Overview cards MAY repeat a headline Fact that also has its card on its own section page. A repeated Fact SHALL show the same value, unit and provenance in both places.

#### Scenario: No card lost or doubled
- **WHEN** the section pages other than the Overview are compared with the old single page for CUST001
- **THEN** each card appears once

#### Scenario: Overview repeats a headline
- **WHEN** the water saved card on the Overview is compared with the one on Environmental footprint
- **THEN** value, unit and provenance are identical
