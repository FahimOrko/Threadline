## MODIFIED Requirements

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

### Requirement: Sites named under counts
A figure that counts sites SHALL name them as links to their site pages, keeping the customer, baseline and sensitivity. The Overview SHALL show up to three names under the figure and "+N more" as a link to the Signals page at that signal, keeping the same params; the Signals page SHALL list all. The names SHALL come from the engine's observations for the same signal as the count.

#### Scenario: Names match the count
- **WHEN** the Overview shows "2 sites" with garments unused too long for CUST001
- **THEN** two site names are shown, each linking to `/dashboard/sites/{id}` with the current params

#### Scenario: More than three
- **WHEN** a signal flags five sites
- **THEN** three names and "+2 more" are shown, the last linking to the Signals page at that signal with the params kept
