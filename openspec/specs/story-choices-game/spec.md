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
The sensitivity scene's dialogue and its consequence SHALL frame the options as the team's declared spread of T002 over illustrative baseline factors and SHALL NOT call it a measured range or a forecast.

#### Scenario: High sensitivity
- **WHEN** the reader chooses high
- **THEN** the KAM line says the range is the declared T002 spread and names the level

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

### Requirement: Ending scene
After the last scene the game SHALL show an ending scene in which the KAM recaps each choice in order with its plain-language label, and buttons to `/story/print` and `/story` that carry the same `?customer=`, `?baseline=`, `?sensitivity=` and `?priorities=`. The ending SHALL contain a clearly marked slot for a later Impact World link that renders nothing until a target route is set, and SHALL NOT link to a route that does not exist.

#### Scenario: Links keep params
- **WHEN** the reader ends a game with `?customer=CUST002&baseline=B_HOME&sensitivity=high&priorities=cost`
- **THEN** both buttons open with those values unchanged

#### Scenario: Impact World slot empty
- **WHEN** no Impact World route has been set
- **THEN** no Impact World button or link is rendered

### Requirement: Links preserve existing query params
Every link the game produces (dialogue next, choices, ending buttons, `/story` and `/story/print`) SHALL preserve all existing query params, including ones the game does not know, and SHALL change only `scene`, `beat` and the lever params that the step sets.

#### Scenario: Unknown param
- **WHEN** the address holds `?view=customer&x=1` and the reader advances, chooses or opens `/story`
- **THEN** the resulting address still holds `view=customer` and `x=1`

### Requirement: Locked customer mode
The game SHALL resolve a view with a single resolver whose default is the KAM behaviour described above. When it resolves to the customer view, scene 1 SHALL be a confirmation beat in which the ops lead introduces their own company's year, with one "Start the review" button, SHALL list and reach no other customer, and SHALL NOT change `?customer=`. All other scenes SHALL behave as in KAM view.

#### Scenario: Default
- **WHEN** no `?view=` is present
- **THEN** scene 1 lists the customers as specified above

#### Scenario: Customer view
- **WHEN** the resolved view is the customer view
- **THEN** scene 1 shows the resolved customer's ops lead and one "Start the review" button that opens scene 2, with no customer listed or reachable

### Requirement: Existing routes unchanged
`/story` and the print route SHALL behave as before; the game SHALL NOT alter their chapters, text or params.

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
