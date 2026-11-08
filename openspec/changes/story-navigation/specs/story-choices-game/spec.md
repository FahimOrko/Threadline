# Spec Delta

## RENAMED Requirements

- FROM: `### Requirement: Locked customer mode`
- TO: `### Requirement: Customer view picks its company`

## MODIFIED Requirements

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

## ADDED Requirements

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
Every link in the game and every link from the report back into the app SHALL carry `?view=` unchanged (ADR 0023): the company picker choices, Previous, Next, Start over, "Read the full report", "Open PDF version", the priority chips and the site links.

#### Scenario: Picker keeps the customer view
- **WHEN** the reader in the customer view chooses a company
- **THEN** the address still holds `view=customer` and the customer view is shown

#### Scenario: Report links
- **WHEN** `/story?view=customer` is open
- **THEN** every priority chip and site link holds `view=customer`, and the export link is unchanged
