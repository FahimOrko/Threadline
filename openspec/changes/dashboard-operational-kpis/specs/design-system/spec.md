# Spec Delta

## ADDED Requirements

### Requirement: Site table component
The app SHALL provide a reusable SiteTable that lists rows with a label column and numeric columns in compact 28px rows, sets numbers in the mono face with tabular figures, shows a ProvenanceChip and a Show math control in each numeric column header, and renders loading, empty and error states.

#### Scenario: In the gallery
- **WHEN** the user opens `/design`
- **THEN** SiteTable appears under Data display with a fixture, labelled "sample data, not engine output", in its populated, empty and loading states

#### Scenario: Documented
- **WHEN** the component exists
- **THEN** it is listed in the component table of `docs/design.md`

#### Scenario: Fixture stays confined
- **WHEN** `npm run check:design-imports` runs
- **THEN** no file outside `src/app/design/` imports the SiteTable fixture

### Requirement: Select control
The app SHALL provide a Select built on the shadcn Select primitive, with a visible label, keyboard operation, and token-based colours in both themes.

#### Scenario: In the gallery
- **WHEN** the user opens `/design`
- **THEN** Select appears under Controls in its closed, open and disabled states in the active theme

#### Scenario: Keyboard
- **WHEN** the user focuses the Select and uses the arrow keys and Enter
- **THEN** the options can be browsed and one chosen without a pointer

#### Scenario: Documented
- **WHEN** the component exists
- **THEN** it is listed in the component table of `docs/design.md`
