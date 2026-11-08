# Spec Delta

## ADDED Requirements

### Requirement: Report header matches the scenario strip
The Story page's header block (customer name, period line, "Play the review", "Export PDF" and the priority picker) SHALL use the dashboard scenario strip's surface: the same accent-tinted border and background. The six priority chips SHALL be a segmented-style group like the strip's toggles, every option visible, the picked ones filled and still carrying "(selected)" for screen readers. The block SHALL keep its controls, links, wording and behaviour, and SHALL stay hidden in print.

#### Scenario: Same surface
- **WHEN** the Story page and the Overview page are shown in the same theme
- **THEN** the header block and the scenario strip use the same border and background treatment

#### Scenario: Segmented chips
- **WHEN** the Story page is shown
- **THEN** the six priority chips sit in one segmented group with the picked chips filled

#### Scenario: Behaviour unchanged
- **WHEN** the reader activates a priority chip, "Play the review" or "Export PDF"
- **THEN** each opens the same address as before this change

#### Scenario: Not printed
- **WHEN** the print route is rendered
- **THEN** no header block is shown
