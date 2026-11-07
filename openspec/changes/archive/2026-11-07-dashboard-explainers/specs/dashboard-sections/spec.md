## MODIFIED Requirements

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
