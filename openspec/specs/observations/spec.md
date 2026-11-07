# observations Specification

## Purpose
Emits rule-based observations from signals and Facts in one stable shape, so the dashboard shows them now and Review Prep can reuse the same list later.

## Requirements

### Requirement: Observation shape
An observation SHALL have id, type (risk, value, gap or opportunity), severity, scope (the customer and, when site-specific, the flagged site ids), the ids of the Facts it rests on, audience and a suggested action. The rules SHALL be pure, take the engine data as an argument and carry no ranking.

#### Scenario: Fact references resolve
- **WHEN** rules return observations
- **THEN** every Fact id an observation names exists among the Facts the rules built

### Requirement: Minimum NorthStar observations
For NorthStar over 2025 the rules SHALL return at least one value, one risk and one gap observation. The value observation SHALL be Replacements postponed when it is above 0. The gap observation SHALL be raised when Cost of unused allocation has a null value, or when a site type is not classified (unmapped).

#### Scenario: NorthStar
- **WHEN** the rules run for CUST001
- **THEN** they return Replacements postponed (value), a dormant, an over-allocation and a repair-spike observation (risk) and an unset rental fee observation (gap)

#### Scenario: Nothing flagged
- **WHEN** a signal flags no site
- **THEN** its observation is not emitted

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
