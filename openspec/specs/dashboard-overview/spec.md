# dashboard-overview Specification

## Purpose
Gives the Overview six section cards in the manner of a product dashboard (value, trend, small chart, comparison) and one interactive chart, each tied to the plain meaning of the number and to its provenance.

## Requirements

### Requirement: Grouped panels
After its intro, the Overview SHALL show grouped panels instead of one card per figure: Environment (water saved as hero, with net CO2e saved and energy saved), Money (avoided purchase cost as hero, with garment value in use), Garments and service (utilization as hero, with on-time rate and repairs) and Needs attention (the signal counts), then the interactive chart, then a Coverage panel (active wearers, garments in circulation, delivery sites). Each panel SHALL have one hero figure, one small visual where one fits, and related figures as inline stats; every figure SHALL keep a compact provenance chip and Show math, with a short on-screen label. Panels SHALL fill the grid evenly (two columns at 640px of main area and above, one below; no orphan panel).

#### Scenario: Panels
- **WHEN** the Overview opens for CUST001
- **THEN** every figure shows the same value, unit and provenance as its Fact, and no figure repeats a value shown in the chart

#### Scenario: Narrow main area
- **WHEN** the AI sidebar and app sidebar are both open at 1230px
- **THEN** the panels stay readable with no sideways scroll and no chip wraps

### Requirement: Sites named under counts
A figure that counts sites SHALL name them as links to their site pages, keeping the customer, baseline and sensitivity. The Overview SHALL show up to three names under the figure and "+N more" as a link to the Signals page at that signal, keeping the same params; the Signals page SHALL list all. The names SHALL come from the engine's observations for the same signal as the count.

#### Scenario: Names match the count
- **WHEN** the Overview shows "2 sites" with garments unused too long for CUST001
- **THEN** two site names are shown, each linking to `/dashboard/sites/{id}` with the current params

#### Scenario: More than three
- **WHEN** a signal flags five sites
- **THEN** three names and "+2 more" are shown, the last linking to the Signals page at that signal with the params kept

### Requirement: Trend indicator
A figure with an engine monthly series SHALL show its change from the series' `trend` as the signed percent with its comparison spans next to the figure it belongs to (for example "+10.3% Oct–Dec vs Jul–Sep", or "−3.2% Dec vs Sep" for a snapshot), never on a panel header. It SHALL NOT repeat the direction as a word ("Up +10.3%"), SHALL NOT say whether the change is good or bad and SHALL stay neutral in colour. Screen readers SHALL get the direction and the exact periods. A figure without a monthly series (on-time cycle rate, sites with garments unused too long) SHALL show no trend and no invented trend.

#### Scenario: Trend
- **WHEN** the water saved figure renders and the engine's trend is up
- **THEN** it shows the engine's signed percent and "Oct–Dec vs Jul–Sep" beside the value, with no word "Up"

#### Scenario: Tooltip names the period
- **WHEN** the KAM reads or focuses a trend
- **THEN** the two periods compared are stated in full (visibly in short form, to screen readers in full)

#### Scenario: No monthly data
- **WHEN** the on-time rate figure renders
- **THEN** it has no trend and no sparkline

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
