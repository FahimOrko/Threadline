# Spec Delta

## MODIFIED Requirements

### Requirement: Show math panel
A Show math control SHALL open a popover that lists the formula, inputs, assumption IDs, baseline and low/base/high range of a value, and SHALL link them to the value with a thread line in the accent colour. Show math SHALL always open as a popover, on cards and in table headers alike, and SHALL NOT change the size or layout of what it sits in.

#### Scenario: Open the math
- **WHEN** the user activates a value's "show math" control
- **THEN** a popover opens showing formula, inputs, assumption IDs, baseline and range, and the card or table around it keeps its size

#### Scenario: Keyboard access
- **WHEN** the user focuses the control and presses Enter
- **THEN** the popover opens, the control reports its expanded state to assistive technology, and Esc closes it and returns focus to the control

#### Scenario: Outside click and one at a time
- **WHEN** a popover is open and the user clicks outside it or opens another Show math
- **THEN** it closes, so only one is open at a time

## ADDED Requirements

### Requirement: Compact provenance chip
ProvenanceChip SHALL offer a compact variant that shows only the glyph of each method in the certainty tint, with the full method and source text available in a tooltip and an accessible label. The compact variant SHALL be reachable and operable by keyboard, SHALL show its tooltip on focus as well as on hover, and SHALL NOT rely on colour alone: the glyph and the accessible label carry the method.

#### Scenario: Compact content
- **WHEN** a value has method CALCULATED and source SYNTHETIC and the compact chip is shown
- **THEN** it shows the CALCULATED glyph in the neutral tint, shows no visible method or source text, and has an accessible name containing "Calculated" and "Synthetic"

#### Scenario: Tooltip on focus
- **WHEN** the user tabs to the compact chip
- **THEN** it takes focus with a visible focus ring and a tooltip shows the full method and source text

#### Scenario: Tooltip on hover
- **WHEN** the user hovers the compact chip
- **THEN** the same tooltip shows

#### Scenario: Several methods
- **WHEN** a value has methods ALLOCATED and ESTIMATED and the compact chip is shown
- **THEN** it shows both glyphs, uses the amber tint, and its accessible name lists both methods and the source

#### Scenario: Same tone as the full chip
- **WHEN** the full chip and the compact chip are shown for the same value
- **THEN** both use the same tint and, in both themes, the glyph meets the same contrast as the full chip's text

#### Scenario: In the gallery
- **WHEN** the user opens `/design`
- **THEN** the compact chip appears next to the full chip, including the stress case with the longest method combination, and is listed in `docs/design.md`
