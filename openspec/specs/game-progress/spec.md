# game-progress Specification

## Purpose
TBD - created by archiving change world-story-polish. Update Purpose after archive.

## Requirements

### Requirement: Progress is kept for the tab session
The app SHALL keep the story game's progress in `sessionStorage`, keyed by view and customer: the current `scene` and `beat`, the four lever choices (so the choices made) and whether the ending has been reached. The address SHALL stay the source of truth (ADR 0014, 0021); storage only restores it. The game SHALL save on every address change that holds a scene, beat or lever, and mark the ending reached when `scene=end` is shown. Nothing SHALL be stored outside the tab session and no number or fact value SHALL be stored.

#### Scenario: Round trip through the world
- **WHEN** the reader is on scene 3, beat 2 with a customer, a comparison and an estimate chosen, opens `/world`, and returns to the game from the sidebar
- **THEN** the game opens at scene 3, beat 2 with the same choices

#### Scenario: Refresh
- **WHEN** the reader refreshes the tab part-way through the game
- **THEN** the same beat and choices are shown

#### Scenario: New tab
- **WHEN** the game is opened in a new tab
- **THEN** it starts fresh

### Requirement: Restore only on a bare address
The game SHALL restore stored progress only when its address holds no `scene` and no `beat`. Anything the address does hold (a lever such as `customer`, `view`, unknown params) SHALL win over storage; storage only fills what is missing. An address with a `scene` or `beat` SHALL win entirely. A restored address SHALL keep `view` and every unknown param and SHALL replace the bare entry, so Previous in the browser does not return to an empty game.

#### Scenario: Address wins
- **WHEN** the reader opens `/story/game?scene=2&beat=0` while storage holds scene 4
- **THEN** scene 2 is shown and storage is updated to it

#### Scenario: Bare address with progress
- **WHEN** the reader opens `/story/game?view=customer&customer=CUST002` and storage holds progress for that view and customer
- **THEN** the stored scene, beat and choices are restored and `view` stays

### Requirement: Start over clears progress
Start over SHALL remove the stored progress and the ending flag for the current view, for every customer, before it navigates, and the address it opens SHALL NOT hold `ended`. This applies in the KAM and the customer view.

#### Scenario: Cleared
- **WHEN** the reader presses Start over and then opens `/story/game` bare
- **THEN** the first beat of scene 1 is shown and the Impact World gate is locked again in the customer view

#### Scenario: ended removed from the address
- **WHEN** the reader presses Start over from an address holding `ended=1`, in either view
- **THEN** the address opened has no `ended`, and `/world` in the customer view shows the locked panel

### Requirement: Storage failure falls back to a fresh game
Every read and write of storage SHALL be inside try/catch. When storage is unavailable, blocked, full or holds data that is not the expected shape, the game SHALL behave as a fresh game with the address as its only state, and SHALL show no error.

#### Scenario: Storage throws
- **WHEN** `sessionStorage` access throws
- **THEN** the game opens fresh, works through the address, and nothing is shown to the reader

#### Scenario: Corrupt value
- **WHEN** the stored value is not valid JSON or names an unknown scene
- **THEN** it is ignored and removed, and a fresh game is shown
