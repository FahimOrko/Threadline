## MODIFIED Requirements

### Requirement: Heatmap above the table
The Sites section SHALL show the sites by month heatmap above the table, with a Utilization or Repairs toggle that changes only the heatmap. Cells SHALL be neutral by default and highlighted only where the engine marks a problem: for utilization, months below the over-allocation cut-off; for repairs, the spike months of the repair band. The title SHALL be the question the chart answers. The legend SHALL say what a highlighted cell means and give the cut-off or rule from engine values. Hover and focus SHALL show the value and month. Sites SHALL be ordered with the most highlighted months first (ties by name) and each row SHALL link to its site page keeping the customer, baseline and sensitivity. A highlight SHALL never be the only signal: each highlighted cell SHALL carry a mark and its text alternative SHALL say "highlighted".

#### Scenario: Toggle
- **WHEN** the KAM selects "Repairs"
- **THEN** the heatmap shows repairs and the table is unchanged

#### Scenario: Utilization highlights
- **WHEN** a site's December utilization is below the cut-off
- **THEN** that cell is highlighted and a cell at or above it is neutral

#### Scenario: Repair highlights
- **WHEN** the repair band flags a site's month as a spike
- **THEN** that cell is highlighted, and no other repair cell is

#### Scenario: Order
- **WHEN** one site has three highlighted months and another has one
- **THEN** the first site's row comes first

#### Scenario: Cut-off unset
- **WHEN** the cut-off assumption has no value
- **THEN** no utilization cell is highlighted and the legend says the cut-off is not set
