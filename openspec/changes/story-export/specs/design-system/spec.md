# Spec Delta

## ADDED Requirements

### Requirement: Export card component
The design system SHALL include an export card component: a panel with a short plain-language line and two download buttons (Markdown, JSON), listed in `docs/design.md` and shown in the `/design` gallery in the same change that adds it. It SHALL use theme tokens only and render in light and dark.

#### Scenario: Gallery and docs
- **WHEN** the export card exists
- **THEN** it is shown in `/design` and listed in `docs/design.md`

## REMOVED Requirements

### Requirement: Inline Show math for print
**Reason**: No print route remains (ADR 0030).
**Migration**: Show math stays a popover everywhere.

### Requirement: Light print scope
**Reason**: No print route remains (ADR 0030).
**Migration**: None; the app themes are the only themes.

