## Why

The story is a document: readers scroll it, they do not test it. A short decision game lets a reader move the levers the product already has (customer, baseline, sensitivity, priorities) and see which Facts move, so the effect of each modelling choice is concrete instead of explained. It is presented as a visual-novel scene: two characters talk, the reader answers. It must stay honest: it adds no numbers, only a guided way through existing Facts.

## What Changes

- New interactive route `/story/game` that plays four scenes. Each scene is a short dialogue in a simple setting, ends with a question, and each answer button maps to one value of an existing lever (`?customer=`, `?baseline=`, `?sensitivity=`, `?priorities=`).
- Visual-novel presentation: a setting background, two original characters on stage, a dialogue box at the bottom with a speaker name tag. Dialogue advances on click.
  - Characters: a Lindström KAM who guides the reader, and the customer's ops lead (company name from the resolved customer).
  - Settings: scene 1 meeting room, scene 2 plant floor, scene 3 sustainability office, scene 4 meeting room. The ending uses the meeting room.
- Consequence beat after a choice: the ops lead reacts in a fixed template line, the KAM answers in a template line with `{{fact:id}}` tokens, and a before/after card with a delta badge appears beside the dialogue box.
- All dialogue is fixed template text resolved by the existing story helpers. No AI. Characters never state a number that is not a Fact. Unset assumptions read "Needs input". Sensitivity lines frame T002 as the team's declared spread (ADR 0017).
- Game state lives in the URL, including the scene and the dialogue step (beat), so any beat is shareable.
- Ending scene: the KAM recaps the path and offers buttons to `/story/print` and `/story` with the same params. A clearly marked, empty slot is left for a later Impact World link; nothing links to a route that does not exist.
- Desktop 1280px, dark and light, within `docs/design.md` tokens. `/story` and `/story/print` are unchanged.

### Decisions accepted by the reviewer (from the first round)

1. Route `/story/game`. 2. Linear scenes. 3. Four scenes: customer, baseline, sensitivity, one priority. 4. Before/after cards with a delta badge and a path strip. 5. No score. 6. One pure `factDelta` helper in the engine with Vitest tests.

### Ready for a customer view (decided in review)

A customer view (`?view=customer`) is planned in a later change and does not exist yet. The game is built ready for it, not wired to it:

- One small resolver `resolveView` returns `"kam"` (default, the behaviour described above) or `"customer"`. Today nothing sets it, so every reader gets KAM behaviour.
- In customer view scene 1 still appears but is locked to the resolved customer: a confirmation beat where the ops lead introduces their own company's year, with a single "Start the review" button. No other customers are listed or reachable.
- Every game link (scene steps, choices, ending, `/story`, `/story/print`) preserves all existing query params, including ones the game does not know yet such as `?view=`.

### What the levers can actually move (observed in `src/lib/story`, `src/lib/engine`)

- `?baseline=` and `?sensitivity=` change only the footprint Facts: water, energy and CO2e saved (and their percentages), plus the delivery and service footprint Facts that take a baseline. Every other Fact is identical.
- `?customer=` changes every Fact.
- `?priorities=` changes **no** Fact. It only reorders chapters and marks "Your priority". The priority scene therefore shows no delta: the ops lead and KAM talk about the chapter that now leads, and the card shows that chapter's Facts as they stand.
- The cost of unused allocation stays "Needs input" under every move while T001 is unset.

### Open choices (recommendation first, for the reviewer to decide)

1. **Character art.** (a) Hand-built flat SVG busts in code (recommended): one shared figure component, two characters that differ by shape, garment and accent, built from existing theme tokens, a neutral and a reacting pose each. Faceless flat figures avoid skin-tone tokens and look deliberate. Best wow per hour; no licensed assets. (b) Plain silhouettes: fastest, least character. (c) Portrait cards with initials: fastest to build, reads as a chat UI, not a stage; the safe fallback if (a) runs long.
2. **Backgrounds.** (a) Simple layered SVG settings (recommended): four flat scenes of a few shapes each (table and window, machine row, desk and plants), token colours, with a visible setting label. (b) Blurred gradients with a setting label only: half the build time, loses the sense of place.
3. **Transitions.** (a) A short fade between beats (recommended): CSS only, 150 ms, off under reduced motion, gives the click a sense of progress. (b) None: simplest, jarring on a stage.
4. **Text reveal.** (a) Appears at once (recommended): reload shows the same beat with no timing state, nothing to skip, best for accessibility, and reading speed is the reader's. (b) Types out character by character with click to skip: more theatre, but needs client state and a skip rule, and fights a URL-held beat.

## Capabilities

### New Capabilities

- `story-choices-game`: scene sequence, dialogue beats, lever mapping, consequence display from Facts, URL-held state, ending scene and links.

### Modified Capabilities

<!-- None. story-player requirements are unchanged; the game only links to it. -->

## Impact

- New route under `src/app/story/game/`, new `src/lib/story/game.ts` (scenes, beats and dialogue as plain data; URL parse and href builders), reuse of `buildStory`, `resolveLine`, `factText`, `storyFacts`, `resolveBaseline`, `resolveSensitivity`, `resolvePriorities`, `resolveCustomer`, `storyHref`, `STORY_PRINT_PATH`, StatCard, FactStatCard, ProvenanceChip, ShowMathPopover, Panel, Button, Notice.
- Engine: one small pure delta helper plus tests.
- UI: four new reusable pieces added to `/design` and `docs/design.md`: DialogueBox, ChoiceButton, CharacterStage (with its scene backdrop and figure parts) and DeltaBadge. No new colour tokens planned; if one is needed it gets a contrast pair.
- Docs: one new ADR (game state and beat in the URL; delta helper placement). No supersession.
- Out of scope: new engine math, AI text, scoring, animation beyond a simple fade, mobile, dashboard refactor, the Impact World link itself.
