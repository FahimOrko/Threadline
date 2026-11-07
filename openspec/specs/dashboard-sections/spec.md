# dashboard-sections Specification

## Purpose
Makes each dashboard section explain itself in plain language, with numbers that come from the engine only.

## Requirements

### Requirement: Section opening
Every dashboard section SHALL open with a subheading and a two to three sentence intro in plain language. The intro SHALL be fixed template text; every number in it SHALL come from a `{{fact:id}}` token resolved from the engine's Facts, never typed in. It SHALL NOT use the words "Fact" or "baseline factor" or any assumption id.

#### Scenario: Intro renders
- **WHEN** a section opens
- **THEN** the subheading and intro show, and each figure in the intro equals the matching card value

#### Scenario: A token has no value
- **WHEN** a token's Fact value is null
- **THEN** the intro shows "needs input" for it, never a number

### Requirement: Overview opening
The Overview SHALL say whose year it shows, the period, what Lindström's service did for the customer and how to read the other sections, and SHALL show the Facts for delivery sites, active wearers and garments in circulation.

#### Scenario: Overview content
- **WHEN** the Overview opens for CUST001
- **THEN** the intro names the customer and the period, and three cards show the same values as before this change

### Requirement: Each Fact on one page
Every Fact card that the dashboard showed before the split SHALL appear on exactly one section page, with the same value, unit and provenance.

#### Scenario: No card lost or doubled
- **WHEN** all six section pages are compared with the old single page for CUST001
- **THEN** each card appears once
