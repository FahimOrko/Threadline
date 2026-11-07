# Spec Delta

## Purpose
Emits rule-based observations from signals and Facts in one stable shape, so the dashboard shows them now and Review Prep can reuse the same list later.

## ADDED Requirements

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
Dormant garment observations SHALL be framed as a site-level hygiene and availability discussion point, SHALL NOT refer to individual wearers and SHALL NOT read as compliance advice. Each risk and gap observation SHALL state a suggested action.

#### Scenario: Dormant observation text
- **WHEN** the dormant observation is built
- **THEN** it names sites, never people, and its action is a site-level discussion with the site manager
