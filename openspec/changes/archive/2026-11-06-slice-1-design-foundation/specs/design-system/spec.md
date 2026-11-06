# Spec Delta

## Purpose

Defines the shared visual foundation of Threadline: themes, tokens, typography, icons, base components and the /design gallery, so every later slice builds UI from one source.

## ADDED Requirements

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
