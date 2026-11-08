# story-choices-game Specification

## Purpose
An interactive decision layer over the story, played as visual-novel dialogue: the reader makes choices that set existing levers and sees which existing Facts change, reproducible from the address.

## Requirements

### Requirement: Scenes map choices to existing levers only
The game SHALL present an ordered sequence of scenes. Each scene SHALL end its dialogue with one plain-language question and offer choice buttons that each set exactly one value of one existing lever: `?customer=`, `?baseline=`, `?sensitivity=` or `?priorities=`. A choice SHALL NOT change any other state or introduce any new parameter that affects numbers.

#### Scenario: Baseline scene
- **WHEN** the reader chooses "Home washing" in the baseline scene
- **THEN** the address holds `?baseline=B_HOME` and the next beat is built with that baseline through the existing resolver

#### Scenario: Unknown value
- **WHEN** the address holds `?baseline=NOPE`
- **THEN** local laundry is used and a notice names "NOPE", as on the Story page

### Requirement: Visual-novel stage
Each scene SHALL show a simple setting background with a visible setting label, two original characters on stage, and a dialogue box at the bottom with a speaker name tag. The settings SHALL be: scene 1 meeting room, scene 2 plant floor, scene 3 sustainability office, scene 4 meeting room. The characters SHALL be a Lindström KAM who guides the reader and the customer's ops lead, whose name tag uses the company name of the resolved customer. Character and background art SHALL be original, built in code from theme tokens, with no external image assets and no likeness of any existing character or brand mascot.

#### Scenario: Speaker tag
- **WHEN** the ops lead speaks and the resolved customer is "Customer Co"
- **THEN** the name tag reads "Customer Co ops lead" and that character is emphasised

#### Scenario: Customer not yet chosen
- **WHEN** the reader is in scene 1 before choosing a customer
- **THEN** the ops lead tag reads "Customer ops lead"

### Requirement: Dialogue advances on click
The dialogue SHALL advance one beat at a time when the reader clicks the dialogue box or its "Next" control, or presses Enter or Space on it. Each scene's beats SHALL be the intro lines, the question with choice buttons, the ops lead's reaction, and the KAM's answer. The question beat SHALL not advance without a choice.

#### Scenario: Click to advance
- **WHEN** the reader clicks the dialogue box on an intro line
- **THEN** the next line is shown

#### Scenario: Keyboard
- **WHEN** focus is on the dialogue box and the reader presses Enter
- **THEN** the next beat is shown

### Requirement: Dialogue is fixed template text
Every line spoken by a character SHALL be fixed template text resolved by the existing story helpers over `{{fact:id}}` tokens. A character SHALL NOT state any number that is not a Fact. Text SHALL appear at once, with no AI generation and no per-character typing.

#### Scenario: Number in a line
- **WHEN** the KAM answers with a saving
- **THEN** the number comes from a `{{fact:id}}` token and is formatted like the same Fact elsewhere

#### Scenario: Template check
- **WHEN** the tests scan all dialogue templates
- **THEN** none contains a digit outside a `{{fact:id}}` token

### Requirement: Consequences are existing Facts
After a choice the game SHALL show, beside the dialogue box in the reaction and answer beats, the Facts that differ between the state before that choice and the state after it, each with its before value, after value and delta, resolved from engine Facts and rounded only for display. Every shown value SHALL carry provenance and Show math. The game SHALL NOT show any score, total, rank or outcome that is not an engine Fact.

#### Scenario: Baseline changes footprint Facts only
- **WHEN** the reader moves the baseline from local laundry to home washing
- **THEN** the card lists the water, energy and CO2e savings Facts that changed and no Fact that did not change

#### Scenario: Customer changes everything
- **WHEN** the reader chooses another customer
- **THEN** the card lists changed Facts for that customer against the previous one, each with provenance

#### Scenario: Priorities move no Fact
- **WHEN** the reader chooses a priority
- **THEN** the dialogue and card state the chapter that now leads and show that chapter's Facts as they stand, with no delta

### Requirement: Needs input is never a number in a delta
A Fact whose value is null because a team assumption is unset SHALL read "Needs input" in dialogue and card and SHALL have no delta, before value or after value shown as a number.

#### Scenario: Cost of unused allocation
- **WHEN** T001 is unset and the card lists the cost of unused allocation (the customer scene does)
- **THEN** it reads "Needs input" and shows no delta

### Requirement: Sensitivity framing
The sensitivity scene's dialogue and its consequence SHALL present the options with the Cautious, Standard and Generous estimate labels and SHALL describe the range as the team's declared estimate range, not a measurement or a forecast. The T002 framing of ADR 0017 SHALL live in Show math and methodology, not in the button labels. A stated spread SHALL come from the T002 Fact through a token.

#### Scenario: Generous estimate
- **WHEN** the reader chooses Generous estimate
- **THEN** the KAM line names that label and says it is the declared estimate range, not a measurement

#### Scenario: High sensitivity
- **WHEN** the reader chooses high
- **THEN** the KAM line names the level by its label and says the range is the team's declared estimate range, not a measurement

### Requirement: Game state lives in the address
The scene, the dialogue step (beat) and every choice made SHALL be held in the address (`scene`, `beat` and the four lever params) so that any beat can be shared and reproduced. Opening the same address SHALL show the same beat, choices and numbers.

#### Scenario: Reload mid-game
- **WHEN** the reader reloads at scene 3, beat 2, with earlier choices in the address
- **THEN** the same beat appears with the same stage, line, choices and consequence

#### Scenario: Bad scene or beat value
- **WHEN** the address holds a scene or beat outside the sequence
- **THEN** the first valid beat is shown with a notice naming the value

#### Scenario: Reaction without a choice
- **WHEN** the address asks for a reaction beat but holds no choice for that scene's lever
- **THEN** the question beat is shown instead

### Requirement: Links preserve existing query params
Every link the game produces (dialogue next, choices, ending buttons, `/story` and `/story#export`) SHALL preserve all existing query params, including ones the game does not know, and SHALL change only `scene`, `beat` and the lever params that the step sets.

#### Scenario: Unknown param
- **WHEN** the address holds `?view=customer&x=1` and the reader advances, chooses or opens `/story`
- **THEN** the resulting address still holds `view=customer` and `x=1`

### Requirement: Customer view picks its company
The game SHALL resolve a view with a single resolver whose default is the KAM behaviour described above. When it resolves to the customer view, scene 1 SHALL open on a company picker whose question reads "Which company are you from?", listing the same three customers as the KAM view, with no suggestion badge. Choosing one SHALL set `?customer=` and every later line, figure and suggestion SHALL follow that customer. Before a company is chosen, scene 1 SHALL show only lines that name no customer and no customer data. After the choice, scene 1 SHALL show the reaction and the answer, and its card SHALL list the chosen company's figures as they stand, with no before value, delta or other customer's figures. All other scenes SHALL behave as in KAM view. The KAM view SHALL keep its current picker wording.

#### Scenario: Default
- **WHEN** no `?view=` is present
- **THEN** scene 1 lists the customers with the KAM wording and the suggestion badge, as specified above

#### Scenario: Customer view
- **WHEN** the resolved view is the customer view and no customer is chosen
- **THEN** scene 1 reaches a question "Which company are you from?" with three company buttons, no badge, and no line or figure that names a customer

#### Scenario: The pick drives the game
- **WHEN** the reader in the customer view chooses a company
- **THEN** the address holds that `?customer=` and the dialogue, the ops lead's name tag, the figures and the suggestions in later scenes are for that company

#### Scenario: Customer view card
- **WHEN** the reader has chosen a company in the customer view and the reaction or answer beat is shown
- **THEN** the card shows that company's figures with provenance and Show math, and no figure of another customer

#### Scenario: Customer already in the address
- **WHEN** the customer view is opened with `?customer=CUST002`
- **THEN** the picker marks that company as chosen and the reader can change it

### Requirement: Existing routes unchanged
`/story` SHALL behave as before except as the story-export capability changes it; the game SHALL NOT alter their chapters, text or params.

#### Scenario: Story unaffected
- **WHEN** `/story` is opened with the same params as a finished game
- **THEN** it renders exactly as it did before this change

### Requirement: Presentation
The game SHALL be laid out for a 1280px desktop viewport in light and dark themes, using only `docs/design.md` tokens, with dialogue box and consequence card side by side in consequence beats. Beats MAY change with a short fade and SHALL NOT use other animation; the fade SHALL be off under reduced motion. Name tags, deltas and choices SHALL use words, not colour alone, and text SHALL keep AA contrast. The dialogue box, choice button, character stage and delta badge SHALL be reusable components listed in `/design` and `docs/design.md`.

#### Scenario: Dark theme
- **WHEN** the app theme is dark
- **THEN** stage, characters, dialogue, card and ending render with dark tokens and keep AA contrast

#### Scenario: Reduced motion
- **WHEN** the reader prefers reduced motion
- **THEN** beats change with no fade

### Requirement: Baseline named in card column headers
The consequence card SHALL label baseline-dependent rows with neutral names that name no baseline (for example "Water saved", "CO2e saved"). The Before and After column headers SHALL name the baseline each column was computed against, resolved from the actual lever values, never hard-coded. Rows that do not depend on a baseline SHALL keep their normal label. Engine and dashboard Fact labels SHALL be unchanged.

#### Scenario: Baseline scene
- **WHEN** the reader moves the baseline from local laundry to home washing
- **THEN** the Before header names the local laundry, the After header names home washing, and no row label names a baseline

#### Scenario: Other scene
- **WHEN** a scene changes a lever other than the baseline
- **THEN** both headers name the same resolved baseline

### Requirement: Start over
The game SHALL show a "Start over" control at the top left, beside the page title, on every beat including the first and the ending. It SHALL clear `scene`, `beat`, `customer` and the three other lever params and return to scene 1, keeping `view` and every unknown param. In the customer view this returns to the company picker. On the very first beat with no lever chosen it SHALL be shown disabled, not hidden, so the layout does not move.

#### Scenario: Keeps view and unknown params
- **WHEN** the address holds `?view=customer&x=1&customer=CUST002&baseline=B_HOME&scene=3&beat=2` and the reader presses Start over
- **THEN** the address holds `view=customer` and `x=1`, no lever, scene or beat, and the company picker is shown again

#### Scenario: First beat
- **WHEN** the reader is on the first beat of scene 1 with no lever chosen
- **THEN** Start over is shown disabled in the same place

#### Scenario: Later beats and the ending
- **WHEN** the reader is on any later beat or on the ending
- **THEN** Start over is enabled

### Requirement: Link to the full report
The game header SHALL show a "Read the full report" control beside "Start over", in the same place on every beat. It SHALL be disabled on every beat until the ending, with the visible hint "Finish the review to open your report", and SHALL be active on the ending, opening `/story` with every query param kept (only `scene` and `beat` dropped). The ending's own "Read the full report" and "Download the data" buttons SHALL stay in the same place.

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

### Requirement: Previous control
Every beat SHALL show a "Previous" control beside "Next" in the dialogue box, or in the same place where the beat has no Next. It SHALL step back one beat, crossing into the previous scene's last beat from a scene's first beat, and SHALL be shown disabled on the first beat of scene 1. Stepping back SHALL change only `scene` and `beat`, so choices stay in the address.

#### Scenario: Back within a scene
- **WHEN** the reader is on the reaction beat of scene 2 and presses Previous
- **THEN** the question beat of scene 2 is shown and the earlier choice is still in the address

#### Scenario: Back across a scene
- **WHEN** the reader is on the first beat of scene 3 and presses Previous
- **THEN** the last beat of scene 2 is shown, with every choice kept

#### Scenario: Back from the ending
- **WHEN** the reader is on the first beat of the ending and presses Previous
- **THEN** the last beat of the last scene is shown

#### Scenario: First beat
- **WHEN** the reader is on the first beat of scene 1
- **THEN** Previous is shown disabled in the same place and the layout does not move

#### Scenario: Params preserved
- **WHEN** the address holds `?view=customer&x=1` and the reader presses Previous
- **THEN** the resulting address still holds `view=customer` and `x=1`

### Requirement: Changing a choice after stepping back
A question beat reached by stepping back SHALL mark the option already chosen, by a word and not colour alone, and SHALL let the reader choose another. Choosing SHALL set that lever as on a first visit and move forward. A first visit SHALL mark nothing.

#### Scenario: Chosen option marked
- **WHEN** the reader steps back to a question beat that has a choice in the address
- **THEN** that option reads as chosen and no other does

#### Scenario: Change a choice
- **WHEN** the reader stepped back to a question beat and chooses another option
- **THEN** the address holds the new value and the next beat is the reaction for the new choice

#### Scenario: First visit
- **WHEN** the reader reaches a question beat for the first time
- **THEN** no option is marked

### Requirement: Right panel before a customer is chosen
Until `?customer=` holds a customer, the right panel's net CO2e line SHALL show the placeholder "Choose a customer to see this" in the muted style instead of a figure, with no provenance chip and no Show math, and SHALL show the figure with its chip and Show math once a customer is chosen. The panel's other content and layout SHALL stay as they are.

#### Scenario: Before the choice
- **WHEN** `/story/game` is opened with no `?customer=`
- **THEN** every path-strip entry reads "not chosen yet" and the net CO2e line shows the placeholder, not a figure

#### Scenario: After the choice
- **WHEN** a customer is chosen
- **THEN** the net CO2e line shows the figure for that customer with its chip and Show math

### Requirement: Game links keep the view
Every link in the game and every link from the report back into the app SHALL carry `?view=` unchanged (ADR 0023): the company picker choices, Previous, Next, Start over, "Read the full report", "Download the data", the priority chips and the site links.

#### Scenario: Picker keeps the customer view
- **WHEN** the reader in the customer view chooses a company
- **THEN** the address still holds `view=customer` and the customer view is shown

#### Scenario: Report links
- **WHEN** `/story?view=customer` is open
- **THEN** every priority chip and site link holds `view=customer`, and the export link is unchanged

### Requirement: Opening explanation
Scene 1 SHALL open, before any other line and in both views, with short plain lines saying why the review matters, what the reader and the KAM do in it (four short choices, each showing what it changes) and that after the review the reader will see how it affects the world. The lines SHALL name no customer and no customer data, contain no digit and no banned word, and be fixed template text.

#### Scenario: First beats
- **WHEN** the game opens on scene 1, beat 0, in the KAM view or the customer view
- **THEN** the first lines explain why the review matters, what happens in it and that the world view follows

#### Scenario: Wording scan
- **WHEN** the tests scan all dialogue templates
- **THEN** the new lines contain no digit, "baseline", "sensitivity" or "Fact"

### Requirement: Ending scene with the Impact World link
After the last scene the game SHALL show an ending scene in which the KAM recaps each choice in order with its plain-language label, and buttons to the report's export card (`/story#export`, "Download the data"), `/story` ("Read the full report") and `/world` ("See your impact on the world", the primary button). Every button SHALL carry `?customer=`, `?baseline=`, `?sensitivity=`, `?priorities=` and every other query param, including `view`. The ending text SHALL NOT mention a PDF.

#### Scenario: Links keep params
- **WHEN** the reader ends a game with `?customer=CUST002&baseline=B_HOME&sensitivity=high&priorities=cost&view=customer`
- **THEN** all three buttons open with those values unchanged

#### Scenario: Impact World button
- **WHEN** the ending is shown
- **THEN** "See your impact on the world" opens `/world` with the same params and `scene` and `beat` dropped
