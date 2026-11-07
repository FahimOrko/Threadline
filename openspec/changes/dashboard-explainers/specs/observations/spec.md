## MODIFIED Requirements

### Requirement: Wording and framing
Observation titles, texts and suggested actions SHALL be plain meeting language a customer would understand and SHALL contain no assumption id, no tier, cut-off or trailing-average wording and no digits; such detail lives in the Facts' Show math. Text SHALL NOT repeat site names that the card lists as links. Dormant garment observations SHALL be framed as a site-level hygiene and availability discussion point, SHALL NOT refer to individual wearers and SHALL NOT read as compliance advice. Each risk and gap observation SHALL state a suggested action. Severity SHALL be shown as Low, Medium or High and value highlights SHALL show no severity.

#### Scenario: Dormant observation text
- **WHEN** the dormant observation is built
- **THEN** it names no site and no person, and its action is a site-level discussion with the site manager

#### Scenario: Banned wording
- **WHEN** the test scans every observation title, text and action
- **THEN** none contains a banned word, an id or a digit

#### Scenario: Value highlight
- **WHEN** the replacements postponed observation renders
- **THEN** it shows no severity badge
