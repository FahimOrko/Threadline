# Spec Delta

## ADDED Requirements

### Requirement: Site table component
The app SHALL provide a reusable SiteTable that lists rows with a label column and numeric columns in compact 28px rows, sets numbers in the mono face with tabular figures, and renders loading, empty and error states.

#### Scenario: In the gallery
- **WHEN** the user opens `/design`
- **THEN** SiteTable appears under Data display with a fixture, labelled "sample data, not engine output", in its populated, empty and loading states

#### Scenario: Documented
- **WHEN** the component exists
- **THEN** it is listed in the component table of `docs/design.md`

#### Scenario: Fixture stays confined
- **WHEN** `npm run check:design-imports` runs
- **THEN** no file outside `src/app/design/` imports the SiteTable fixture
