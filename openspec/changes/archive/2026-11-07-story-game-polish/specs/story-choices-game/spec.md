## ADDED Requirements

### Requirement: Baseline named in card column headers
The consequence card SHALL label baseline-dependent rows with neutral names that name no baseline (for example "Water saved", "CO2e saved"). The Before and After column headers SHALL name the baseline each column was computed against, resolved from the actual lever values, never hard-coded. Rows that do not depend on a baseline SHALL keep their normal label. Engine and dashboard Fact labels SHALL be unchanged.

#### Scenario: Baseline scene
- **WHEN** the reader moves the baseline from local laundry to home washing
- **THEN** the Before header names the local laundry, the After header names home washing, and no row label names a baseline

#### Scenario: Other scene
- **WHEN** a scene changes a lever other than the baseline
- **THEN** both headers name the same resolved baseline

### Requirement: Start over
The game SHALL show a "Start over" control at the top left, beside the page title, on every beat including the first and the ending. It SHALL clear `scene`, `beat` and the four lever params and return to scene 1, keeping `view` and every unknown param. In the customer view it SHALL keep the locked customer. On the very first beat with no lever chosen it SHALL be shown disabled, not hidden, so the layout does not move.

#### Scenario: Keeps view and unknown params
- **WHEN** the address holds `?view=customer&x=1&baseline=B_HOME&scene=3&beat=2` and the reader presses Start over
- **THEN** the address holds `view=customer` and `x=1`, no lever, scene or beat, and the customer stays locked

#### Scenario: First beat
- **WHEN** the reader is on the first beat of scene 1 with no lever chosen
- **THEN** Start over is shown disabled in the same place

#### Scenario: Later beats and the ending
- **WHEN** the reader is on any later beat or on the ending
- **THEN** Start over is enabled

### Requirement: Link to the full report
The game header SHALL show a "Read the full report" control beside "Start over", in the same place on every beat. It SHALL be disabled on every beat until the ending, with the visible hint "Finish the review to open your report", and SHALL be active on the ending, opening `/story` with every query param kept (only `scene` and `beat` dropped). The ending's own "Read the full report" and "Open PDF version" buttons SHALL stay as they are.

#### Scenario: Before the ending
- **WHEN** the reader is on any beat before the ending
- **THEN** the header control is disabled, the hint is visible, and the layout is the same as on the ending

#### Scenario: On the ending
- **WHEN** the address holds `?scene=end&view=customer&x=1&baseline=B_HOME`
- **THEN** the header control opens `/story` with `view`, `x` and `baseline` unchanged, and the hint is gone

### Requirement: Guided script
Each scene SHALL open with an explain beat before its question, saying in plain words what the lever is and why it matters for the resolved customer, and SHALL close with a "what this means" beat after the answer, saying what moved, in which direction, and what that says about the customer's year. Dialogue SHALL name every comparison in full (for example "compared with a local laundry washing the same garments"), SHALL state units, and SHALL NOT contain the words "baseline", "sensitivity" or "Fact". Sensitivity lines SHALL use the Cautious, Standard and Generous estimate labels and SHALL say the range is the team's declared estimate range, not a measurement. A Fact that needs input SHALL be explained: the KAM says the value needs input from Lindström and why it matters.

#### Scenario: Explain beat first
- **WHEN** a scene starts
- **THEN** an explain beat precedes the question beat

#### Scenario: Needs input explained
- **WHEN** the cost of unused allocation needs input
- **THEN** the KAM says it needs input from Lindström and that without it the cost of idle garments cannot be stated

#### Scenario: Forbidden words
- **WHEN** the tests scan every dialogue line, including conditional lines and fallbacks
- **THEN** none contains "baseline", "sensitivity" or "Fact"

### Requirement: Data-conditioned dialogue
Dialogue slots SHALL be chosen by conditions on the resolved customer's Facts and Slice 5 observations. Conditions and lines SHALL be plain data next to the lines in the story game module and evaluated by one pure function; no condition SHALL live in a component. Every conditional slot SHALL have a fallback line used when no condition fires, so every customer gets a complete script with no empty beat. Lines SHALL stay fixed template text over `{{fact:id}}` tokens and plain-word tokens; no number SHALL be stated that is not a Fact, and no AI SHALL be used.

#### Scenario: Observation present
- **WHEN** the customer has a repair-spike observation
- **THEN** the ops lead raises the repair spike in scene 1

#### Scenario: Observation absent
- **WHEN** the customer has no repair-spike observation
- **THEN** the fallback line is shown and the spike is not mentioned

#### Scenario: Every customer complete
- **WHEN** the script is built for each customer in the data pack
- **THEN** every beat has non-empty text

#### Scenario: Digit scan
- **WHEN** the tests scan conditional lines and fallbacks
- **THEN** none contains a digit outside a `{{fact:id}}` token

### Requirement: Game layout
`/story/game` SHALL use the full content width with two columns: the character stage and dialogue box on the left; one bordered panel on the right holding the path strip at the top and the consequence cards below. The panel's top edge SHALL align with the stage's top edge (below the setting label) and its bottom edge with the dialogue box's bottom edge, and the panel itself (background and border) SHALL fill that full height. Its content SHALL scroll inside the panel when it overflows, so long card lists never move the stage. The character stage SHALL leave no empty band below the table. All styling SHALL use `docs/design.md` tokens.

#### Scenario: Long card list
- **WHEN** the card list is taller than the stage and dialogue box together
- **THEN** the panel keeps its height and its content scrolls inside it

#### Scenario: Aligned edges
- **WHEN** any beat is shown at 1230px or wider
- **THEN** the panel's top equals the stage's top and its bottom equals the dialogue box's bottom, and the setting label sits above both

### Requirement: Stage scales to fit
The character stage SHALL scale its scene to the width available, keeping its aspect ratio, and SHALL NOT crop the characters. This SHALL hold at 1230px, 1280px, 1440px and 1536px wide, with the AI sidebar open and closed, in light and dark themes.

#### Scenario: Narrow stage
- **WHEN** the viewport is 1230px wide and the AI sidebar is open
- **THEN** both characters, heads included, are fully inside the stage

#### Scenario: Wide stage
- **WHEN** the viewport is 1536px wide and the AI sidebar is closed
- **THEN** the stage is no taller than a fixed maximum and both characters are fully inside it

### Requirement: Suggested choices
Each choice scene SHALL mark exactly one option with a "Suggested for a first run" badge and one plain-language line saying why. The suggestion SHALL aim for the clearest, most representative run and SHALL NOT be chosen by size of number. It SHALL be computed by one pure function from conditions held as data: the customer with the most fired Slice 5 observations (ties to the lowest customer id), the data pack's default baseline, the Standard estimate, and the priority chapter with the most fired observations attached (ties to default chapter order; the first pickable chapter in default order when none fire). The priority why line SHALL frame it as where the customer's year had the most going on, not as a problem. The suggestion SHALL NOT pre-select an option or advance the game; the reader SHALL always click. In the customer view the locked customer scene SHALL show no badge.

#### Scenario: One per scene
- **WHEN** any choice scene is shown for any customer
- **THEN** exactly one option carries the badge and the why line, and none is pre-selected

#### Scenario: Customer suggestion follows the data
- **WHEN** the number of fired observations for a customer changes
- **THEN** the suggested customer changes accordingly, and equal counts resolve to the lowest customer id

#### Scenario: Priority suggestion follows observations
- **WHEN** the observations attached to a chapter change in number, or none fire
- **THEN** the suggested chapter changes accordingly, and with none fired the first pickable chapter in default order is suggested

#### Scenario: Customer view
- **WHEN** the resolved view is the customer view
- **THEN** scene 1 shows no suggestion badge

#### Scenario: No auto-advance
- **WHEN** a scene with a suggestion is shown
- **THEN** the address and the dialogue do not move until the reader clicks an option

## MODIFIED Requirements

### Requirement: Sensitivity framing
The sensitivity scene's dialogue and its consequence SHALL present the options with the Cautious, Standard and Generous estimate labels and SHALL describe the range as the team's declared estimate range, not a measurement or a forecast. The T002 framing of ADR 0017 SHALL live in Show math and methodology, not in the button labels. A stated spread SHALL come from the T002 Fact through a token.

#### Scenario: Generous estimate
- **WHEN** the reader chooses Generous estimate
- **THEN** the KAM line names that label and says it is the declared estimate range, not a measurement

#### Scenario: High sensitivity
- **WHEN** the reader chooses high
- **THEN** the KAM line names the level by its label and says the range is the team's declared estimate range, not a measurement
