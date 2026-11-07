# design-system Specification

## Purpose
Defines the shared visual foundation of Threadline: themes, tokens, typography, icons, base components and the /design gallery, so every later slice builds UI from one source.

## Requirements

### Requirement: Dark default with light theme
The app SHALL offer a dark and a light theme, SHALL show the dark theme on first visit, and SHALL keep every text and control readable in both, including light mode on a projector.

#### Scenario: First visit
- **WHEN** a user opens the app with no saved theme
- **THEN** the dark theme is shown

#### Scenario: Light theme contrast
- **WHEN** the light theme is active
- **THEN** body text, labels and chips meet WCAG AA contrast (4.5:1) against their backgrounds

### Requirement: Theme choice persists
The app SHALL remember the chosen theme in the browser and SHALL apply it on the next visit without showing the other theme first.

#### Scenario: Reload keeps theme
- **WHEN** the user switches to light and reloads the page
- **THEN** the light theme is shown and no flash of the dark theme appears

### Requirement: One accent and a certainty tint
The tokens SHALL define a single teal accent for actions, focus and the thread line, and a pale-amber tint reserved for less-certain values.

#### Scenario: Accent used for focus
- **WHEN** a control receives keyboard focus
- **THEN** a visible focus ring in the accent colour is shown in both themes

### Requirement: Typography
UI text SHALL use Geist, and every displayed number SHALL use Geist Mono with tabular figures.

#### Scenario: Numbers align
- **WHEN** a column of values is shown
- **THEN** digits use equal widths so decimals line up

### Requirement: Single icon family
All icons SHALL come from the Phosphor family with one standard weight.

#### Scenario: No mixed icon sets
- **WHEN** the production build is inspected
- **THEN** no component imports icons from another family

### Requirement: Compact, flat styling
Components SHALL use one radius scale (6px controls, 8px panels), hairline borders instead of shadows, compact density, and pill shapes only for provenance chips.

#### Scenario: Panel appearance
- **WHEN** a Panel is shown
- **THEN** it has a 1px border, 8px radius and no drop shadow

### Requirement: Base component set
The app SHALL provide ProvenanceChip, ShowMath panel, StatCard, SectionHeader, Panel, Badge, Tooltip, and loading, empty and error states, in addition to Button, Separator and Toggle.

#### Scenario: States available
- **WHEN** a data panel is loading, empty or failed
- **THEN** it can render a skeleton matching its layout, an empty message with a next step, or an inline error

### Requirement: Design gallery
The app SHALL provide a /design route listing every reusable component in all its states, in sections Tokens, Provenance, Data display, Controls, States and Effects, and the Effects section SHALL be labelled as reserved for Story and Impact World.

#### Scenario: Open the gallery
- **WHEN** the user opens /design
- **THEN** each reusable component appears under its section with its states and the active theme applies

#### Scenario: Effects section reserved
- **WHEN** the user views the Effects section
- **THEN** it states that effects are used only in Story and Impact World and shows no data-view component with effects

### Requirement: Sample data is labelled and confined
Values shown on /design SHALL be labelled "sample data, not engine output", SHALL be defined only inside the /design route folder, and SHALL NOT be imported by code outside it.

#### Scenario: Label visible
- **WHEN** a sample number appears on /design
- **THEN** the page shows the label "sample data, not engine output"

#### Scenario: Import boundary
- **WHEN** the lint or check task runs
- **THEN** it fails if any file outside the /design route folder imports the sample data

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
Show math SHALL be a single popover component built on the shadcn Popover primitive, used on stat cards and in table headers, keyboard operable. No inline-expanding Show math SHALL exist.

#### Scenario: Open and close
- **WHEN** the user activates a card's or a header's Show math, then presses Esc or clicks outside
- **THEN** the popover opens over the page without changing the card or table size and then closes

#### Scenario: One at a time
- **WHEN** a popover is open and the user opens another header's Show math
- **THEN** the first closes

#### Scenario: In the gallery
- **WHEN** the user opens `/design`
- **THEN** a Show math popover is shown open next to the SiteTable with a popover open, and the Popover is listed in `docs/design.md`

### Requirement: Stat card needs-input state
StatCard SHALL support a "Needs input" state that replaces the value with the words "Needs input" and a short hint, keeps the same box layout as a card with a value, and is shown in the /design gallery next to the normal card.

#### Scenario: State in the gallery
- **WHEN** the user opens `/design`
- **THEN** the needs-input StatCard appears in both themes, with its hint and a provenance chip, and does not show 0 or NaN

#### Scenario: Same layout
- **WHEN** a needs-input card sits in a row with value cards
- **THEN** the cards keep equal widths and no card changes size when the state changes

### Requirement: Observation card
An ObservationCard component SHALL show an observation's type and severity as a labelled badge (never colour alone), its text, the suggested action, a ProvenanceChip with Show math for the Facts it rests on, and links to the flagged sites. It SHALL be in the `/design` gallery with sample data confined to `src/app/design/` and listed in `docs/design.md`.

#### Scenario: Card content
- **WHEN** an observation with two flagged sites is rendered
- **THEN** the card shows type, severity, text, action, chip, Show math and two site links

#### Scenario: Gallery
- **WHEN** `/design` is opened
- **THEN** it shows a risk, a value and a gap card in dark and light
