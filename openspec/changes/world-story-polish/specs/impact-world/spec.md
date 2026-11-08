## ADDED Requirements

### Requirement: World gate in the customer view
In the customer view `/world` SHALL show a locked panel instead of the hub, a zone or the company picker until the story ending has been reached for the current customer. The panel SHALL read "Finish the review to open" in the same style as the report's gated link, and link to the game keeping all params. An address holding `ended=1` SHALL open the page and SHALL record the ending as reached. The KAM view SHALL NOT be gated. The gate is a UI convenience over synthetic data, not access control. Until the client has read both `sessionStorage` and the address, the gate SHALL render a neutral placeholder (the skeleton), so neither the locked panel nor the world content flashes on first paint.

#### Scenario: Direct visit before the ending
- **WHEN** `/world?view=customer&customer=CUST002` is opened and the ending has not been reached
- **THEN** the locked panel and a link back to the game are shown, and no hub or figure

#### Scenario: The ending link always opens
- **WHEN** the reader presses "See your impact on the world" on the ending, even with storage unavailable
- **THEN** `/world` opens with `ended=1` and the hub is shown

#### Scenario: No flash on first paint
- **WHEN** `/world?view=customer` is loaded
- **THEN** the neutral placeholder is shown until storage and address are read, and neither the locked panel nor the hub appears before that

#### Scenario: KAM view
- **WHEN** `/world` is opened with no `view`
- **THEN** the hub is shown whatever the game progress

#### Scenario: Reload after opening
- **WHEN** the world was opened through the ending and the reader then opens `/world` without `ended`
- **THEN** it opens, because the ending is recorded for the tab

### Requirement: How we got here strip
The Trees zone SHALL show a three-step strip titled "How we got here": (1) the garments washed, as the washed weight; (2) the CO2e from washing, for Lindström and for the comparison, delivery included; (3) the difference between them divided by the per-tree factor, giving the tree count. Every number SHALL be a Fact token with provenance and Show math. In the Lindström-needs-more case step 3 SHALL read the difference as extra, not as a saving. A step whose Fact is unset SHALL read "Needs input" with a plain hint, never 0. The strip SHALL fit at 1230px and 1280px in light and dark, and its motion SHALL be CSS only and off under reduced motion.

#### Scenario: Three steps
- **WHEN** the Trees zone is shown with all Facts set
- **THEN** three numbered steps are shown, each with its Fact figure, chip and Show math

#### Scenario: Negative difference
- **WHEN** the service footprint exceeds the comparison footprint
- **THEN** step 3 says Lindström needs more trees and shows the extra count

#### Scenario: Unset factor
- **WHEN** T011 is unset
- **THEN** step 3 shows "Needs input" and steps 1 and 2 still show

## MODIFIED Requirements

### Requirement: Trees zone
The Trees zone SHALL present the trees as an equivalence, never as something that was saved: the emissions the service avoided equal what a number of young trees absorb in 10 years. The headline SHALL read "The emissions you avoided equal what {{fact:trees_saved}} young trees absorb in 10 years." and SHALL show the trees for the comparison's emissions and for Lindström's emissions (process and delivery) beside it. The words "trees saved" SHALL NOT appear on any surface (hub, zone, "i" text, card labels, chart labels, accessible names, report, gallery). Every count SHALL be an engine Fact. When Lindström needs more trees than the comparison, the zone SHALL say so in plain words, SHALL NOT show the headline sentence, and SHALL show the difference as extra. The stage SHALL draw at most 300 icons and show a fixed legend "One tree icon = N trees" with N from the engine. Show math SHALL state the factor (0.060 tCO2e per urban tree seedling grown for 10 years), its source (US EPA) and that icon counts are rounded up for drawing.

#### Scenario: Saving
- **WHEN** the comparison needs more trees than Lindström
- **THEN** the headline reads as an equivalence with the Fact value, the stage shows the comparison's trees, marks the share Lindström needs and the rest, and the card figure is labelled by the equivalence, not "saved"

#### Scenario: Lindström needs more
- **WHEN** the net CO2e saved is below zero
- **THEN** no equivalence headline is shown, the text says Lindström's service needs more trees than the comparison, and the stage marks the extra trees

#### Scenario: Cap
- **WHEN** the tree count is large
- **THEN** no more than 300 icons are drawn and the legend gives N

#### Scenario: Needs input
- **WHEN** a tree Fact has no value
- **THEN** the zone shows "Needs input" with a plain hint and draws no trees

#### Scenario: No "saved" wording
- **WHEN** the tests scan the hub, zone and explainer text for "trees saved"
- **THEN** none is found
