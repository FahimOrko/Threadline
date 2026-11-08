## ADDED Requirements

### Requirement: Opening explanation
Scene 1 SHALL open, before any other line and in both views, with short plain lines saying why the review matters, what the reader and the KAM do in it (four short choices, each showing what it changes) and that after the review the reader will see how it affects the world. The lines SHALL name no customer and no customer data, contain no digit and no banned word, and be fixed template text.

#### Scenario: First beats
- **WHEN** the game opens on scene 1, beat 0, in the KAM view or the customer view
- **THEN** the first lines explain why the review matters, what happens in it and that the world view follows

#### Scenario: Wording scan
- **WHEN** the tests scan all dialogue templates
- **THEN** the new lines contain no digit, "baseline", "sensitivity" or "Fact"

## REMOVED Requirements

### Requirement: Ending scene
**Reason**: Replaced by "Ending scene with the Impact World link", which turns the empty Impact World slot into a real button and drops the PDF mention.
**Migration**: None; the recap and the two report buttons are unchanged.

## ADDED Requirements

### Requirement: Ending scene with the Impact World link
After the last scene the game SHALL show an ending scene in which the KAM recaps each choice in order with its plain-language label, and buttons to the report's export card (`/story#export`, "Download the data"), `/story` ("Read the full report") and `/world` ("See your impact on the world", the primary button). Every button SHALL carry `?customer=`, `?baseline=`, `?sensitivity=`, `?priorities=` and every other query param, including `view`. The ending text SHALL NOT mention a PDF.

#### Scenario: Links keep params
- **WHEN** the reader ends a game with `?customer=CUST002&baseline=B_HOME&sensitivity=high&priorities=cost&view=customer`
- **THEN** all three buttons open with those values unchanged

#### Scenario: Impact World button
- **WHEN** the ending is shown
- **THEN** "See your impact on the world" opens `/world` with the same params and `scene` and `beat` dropped
