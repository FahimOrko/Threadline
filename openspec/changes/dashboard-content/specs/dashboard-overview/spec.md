# dashboard-overview Specification

## Purpose
Gives the Overview six section cards in the manner of a product dashboard (value, trend, small chart, comparison) and one interactive chart, each tied to the plain meaning of the number and to its provenance.

## ADDED Requirements

### Requirement: Six section cards
After its intro and legend, the Overview SHALL show six section cards in this order: water saved, CO₂e saved, avoided purchase cost, garment utilization, on-time cycle rate, critical dormant sites. Each card SHALL show a plain-language label, the value and unit, one line saying what it means, one compact provenance chip and Show math. All six SHALL have the same height and layout, and the grid SHALL reflow by the width of the main area (three columns at 640px and above, two below).

#### Scenario: Cards
- **WHEN** the Overview opens for CUST001
- **THEN** six cards show the same values, units and provenance as the matching Facts

#### Scenario: Narrow main area
- **WHEN** the AI sidebar and app sidebar are both open at 1230px
- **THEN** the cards stay readable with no sideways scroll and equal heights

### Requirement: Trend indicator
A card with an engine monthly series SHALL show a trend badge from the series' `trend`: a word (Up, Down or Flat), a Phosphor glyph and the signed percent. It SHALL NOT use colour alone and SHALL NOT say whether the change is good or bad. Its tooltip, and Show math, SHALL state the exact comparison period, for example "Oct to Dec 2025 against Jul to Sep 2025" or "Dec 2025 against Sep 2025". A card without a monthly series (on-time cycle rate, critical dormant sites) SHALL show no trend badge and no invented trend.

#### Scenario: Trend
- **WHEN** the water saved card renders and the engine's trend is up
- **THEN** the badge reads "Up" with an up glyph and the engine's percent

#### Scenario: Tooltip names the period
- **WHEN** the KAM hovers or focuses a trend badge
- **THEN** the tooltip states the two periods compared

#### Scenario: No monthly data
- **WHEN** the on-time rate card renders
- **THEN** it has no trend badge and no sparkline

### Requirement: Sparkline and comparison
A card SHALL show a sparkline of the engine's monthly series for water saved, CO₂e saved, avoided purchase cost and garment utilization. The water and CO₂e cards SHALL show a thin comparison bar of Lindström against the selected comparison laundry from the engine's footprint comparison; the utilization card SHALL show the over-allocation cut-off as a tick. A card without a sparkline SHALL show a short fixed context line in the sparkline's slot, so no slot is left empty.

#### Scenario: Water card
- **WHEN** the comparison is "Home washing"
- **THEN** the water card's bar compares the service's water use with home washing, labelled with both values

#### Scenario: Context line
- **WHEN** the critical dormant sites card renders
- **THEN** a context line saying the figure has no monthly breakdown sits where the sparkline would be

### Requirement: Count-up lands on the displayed value
The value of each card MAY count up once, when first scrolled into view. The text it lands on SHALL be exactly the string the display rules produce for that value (whole at 100 or above, one decimal below, percent with one decimal), and that same string SHALL be present in the accessible text from first render. With `prefers-reduced-motion: reduce` the final string SHALL show with no animation. A card whose value is null SHALL NOT animate and SHALL show "Needs input". No other number on a data page SHALL animate.

#### Scenario: Lands exactly
- **WHEN** the count-up on a card finishes
- **THEN** the text equals the formatted Fact value, and Show math still shows the unrounded value

#### Scenario: Reduced motion
- **WHEN** the user prefers reduced motion
- **THEN** the card shows the final value at once

#### Scenario: Screen reader
- **WHEN** a screen reader reaches an animating card
- **THEN** it reads the final value, not intermediate numbers

### Requirement: Main interactive chart
Under the cards the Overview SHALL show the interactive area chart defined in dashboard-charts, titled with the question it answers, with its unit, caption, chip and Show math.

#### Scenario: Default
- **WHEN** the Overview opens
- **THEN** the chart shows water saved over 12 months

### Requirement: Soft spotlight on cards
Each section card MAY show a soft pointer-following spotlight on hover, drawn from theme tokens. It SHALL NOT tilt or move the card, SHALL NOT shift layout, and SHALL NOT appear at rest or with `prefers-reduced-motion: reduce`.

#### Scenario: Hover
- **WHEN** the pointer moves over a card
- **THEN** a faint light follows it and the card does not move

#### Scenario: Reduced motion
- **WHEN** the user prefers reduced motion
- **THEN** no spotlight is drawn
