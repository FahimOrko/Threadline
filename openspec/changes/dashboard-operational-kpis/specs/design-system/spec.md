# Spec Delta

## ADDED Requirements

### Requirement: Site table component
The app SHALL provide a reusable SiteTable that lists rows with a label column and numeric columns in compact 28px rows, sets numbers in the mono face with tabular figures, shows a compact ProvenanceChip and a Show math control in each numeric column header, and renders loading, empty and error states.

#### Scenario: In the gallery
- **WHEN** the user opens `/design`
- **THEN** SiteTable appears under Data display with a fixture, labelled "sample data, not engine output", in its populated, empty and loading states

#### Scenario: Documented
- **WHEN** the component exists
- **THEN** it is listed in the component table of `docs/design.md`

#### Scenario: Fixture stays confined
- **WHEN** `npm run check:design-imports` runs
- **THEN** no file outside `src/app/design/` imports the SiteTable fixture

### Requirement: Site table fits the screen
The SiteTable SHALL fit a 1280px wide screen without horizontal scroll, with right-aligned numbers, and SHALL scroll sideways only below that width.

#### Scenario: Wide screen
- **WHEN** the table is shown in a 1280px wide window
- **THEN** all numeric columns are visible and the table has no horizontal scrollbar

#### Scenario: Narrow screen
- **WHEN** the window is narrower than the table's minimum width
- **THEN** the table scrolls sideways inside its own box and the page does not

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

### Requirement: Show math popover
Show math in table headers SHALL open as a popover built on the shadcn Popover primitive, SHALL be keyboard operable, and SHALL show the same content as inline Show math. Show math on stat cards SHALL stay inline.

#### Scenario: Open and close
- **WHEN** the user activates a header's Show math, then presses Esc or clicks outside
- **THEN** the popover opens over the page without moving any table cell and then closes

#### Scenario: One at a time
- **WHEN** a popover is open and the user opens another header's Show math
- **THEN** the first closes

#### Scenario: In the gallery
- **WHEN** the user opens `/design`
- **THEN** the SiteTable is shown with a popover open, and the Popover is listed in `docs/design.md`
