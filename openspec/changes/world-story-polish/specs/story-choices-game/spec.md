## ADDED Requirements

### Requirement: First slide wording
The first line of scene 1, in both views, SHALL read exactly: "Good to see you. Let's look back at your year with us: what our service saved you, and what it cost, compared with washing the same workwear another way. You can open the math behind any number." It SHALL name no customer, contain no digit and no banned word.

#### Scenario: Both views
- **WHEN** the game opens on scene 1, beat 0, in the KAM view or the customer view
- **THEN** that line is the first thing said

### Requirement: Copy voice
All dialogue, intros, "what this means" beats, card labels and explainers in the game SHALL follow the Copy voice section of `docs/conventions.md`: warm, natural, like an account manager speaking, with a short plain explanation where a line is terse or jargony. The `{{fact:id}}` tokens, the banned words and the digit rule SHALL hold unchanged.

#### Scenario: Scan
- **WHEN** the tests scan all dialogue templates
- **THEN** none contains a digit outside a token, `CO2e` or a T id, or a banned word

### Requirement: Ending link opens the world
The ending's "See your impact on the world" link SHALL add `ended=1` to the world address and SHALL open `/world` in the customer view whatever the stored state is.

#### Scenario: Link
- **WHEN** the ending is shown
- **THEN** the primary button's address is `/world` with the carried params and `ended=1`

## MODIFIED Requirements

### Requirement: Start over
The game SHALL show a "Start over" control at the top left, beside the page title, on every beat including the first and the ending. It SHALL clear `scene`, `beat`, `customer` and the three other lever params and return to scene 1, keeping `view` and every unknown param, and SHALL clear the stored progress and ending flag for the view (see game-progress). In the customer view this returns to the company picker. On the very first beat with no lever chosen it SHALL be shown disabled, not hidden, so the layout does not move.

#### Scenario: Keeps view and unknown params
- **WHEN** the address holds `?view=customer&x=1&customer=CUST002&baseline=B_HOME&scene=3&beat=2` and the reader presses Start over
- **THEN** the address holds `view=customer` and `x=1`, no lever, scene or beat, and the company picker is shown again

#### Scenario: Progress cleared
- **WHEN** the reader presses Start over and reloads the bare game address
- **THEN** the first beat is shown, not the earlier progress

#### Scenario: First beat
- **WHEN** the reader is on the first beat of scene 1 with no lever chosen
- **THEN** Start over is shown disabled in the same place

#### Scenario: Later beats and the ending
- **WHEN** the reader is on any later beat or on the ending
- **THEN** Start over is enabled

### Requirement: Opening explanation
Scene 1 SHALL open with the first-slide wording, followed in both views by short plain lines saying what the reader and the KAM do in the review (four short choices, each showing what it changes) and that after the review the reader will see how it affects the world. The lines SHALL name no customer and no customer data, contain no digit and no banned word, and be fixed template text.

#### Scenario: First beats
- **WHEN** the game opens on scene 1, beat 0, in the KAM view or the customer view
- **THEN** the first line is the first-slide wording, then the lines explain what happens and that the world view follows

#### Scenario: Wording scan
- **WHEN** the tests scan all dialogue templates
- **THEN** the lines contain no digit, "baseline", "sensitivity" or "Fact"
