## 1. Engine and data

- [x] 1.1 Add pure `factDelta(before, after)` to `src/lib/engine` (null if either value null, same unit) and export it
- [x] 1.2 Add Vitest tests: normal delta, negative delta, null before, null after, unit mismatch rejected

## 2. Game logic

- [x] 2.1 Add `src/lib/story/game.ts`: scene data with settings, per-scene beat list (intro lines, ask, react, answer), fixed template lines for both speakers, `scene` and `beat` resolvers (bad value falls back with a rejected value, beat past `ask` without a choice clamps to `ask`), href builder carrying all four lever params, before-state derivation
- [x] 2.2 Add `changedFacts(before, after)` using `factDelta`; keep only Facts whose value differs; priority scene returns the leading chapter's Facts with no delta
- [x] 2.2a Add `resolveView` next to the other selection resolvers (`"kam"` default, `"customer"`), and a customer-view beat list for scene 1 (ops lead intro, one "Start the review" button, no customer choice, no reaction or card)
- [x] 2.2b Make the game href builder copy all existing query params and overwrite only `scene`, `beat` and the four lever params; route every game link (Next, choices, ending, `/story`, `/story/print`) through it
- [x] 2.2c Tests: `resolveView` default and unknown values; customer-view scene 1 lists no other customer and links to scene 2; an unknown param such as `view=customer` or `x=1` survives on every link type
- [x] 2.3 Add `IMPACT_WORLD_HREF = null` slot with a marking comment; render nothing while null
- [x] 2.4 Tests: resolvers, href builder, before-state derivation (baseline scene touches only footprint Facts; priority scene yields no deltas), a scan that fails on any digit outside a `{{fact:id}}` token in every dialogue template, every token resolves to an existing Fact, sensitivity lines mention the declared T002 spread

## 3. UI (read `docs/design.md` and check `src/components` first)

- [x] 3.1 DeltaBadge in `src/components`: signed mono value, word and glyph, light and dark tokens
- [x] 3.2 ChoiceButton: link-styled button on the existing Button, one line label, focus ring, press state
- [x] 3.3 DialogueBox: speaker name tag, body, "Next" link, keyboard operable, 150 ms fade keyed by beat, off under reduced motion
- [x] 3.4 CharacterStage with SceneBackdrop and the shared figure component: four settings, two original figures with neutral and reacting poses, speaker emphasis, visible setting label; fallback prop for initials cards
- [x] 3.5 Add DialogueBox, ChoiceButton, CharacterStage and DeltaBadge to the `/design` gallery and to `docs/design.md` in the same change
- [x] 3.6 Build `src/app/story/game/page.tsx`: reads `scene`, `beat` and the lever params, renders stage, dialogue or choices, and the consequence card (before/after with provenance and Show math, "Needs input" without a delta) beside the dialogue box on `react` and `answer`
- [x] 3.7 Ending scene: KAM recap in order, buttons to `/story/print` and `/story` with all four params, empty marked Impact World slot, notices for rejected values
- [x] 3.8 Sensitivity scene framing of T002 as the declared spread

## 4. Docs and verification

- [x] 4.1 Add the ADR (game state and beat in the URL; delta helper placement); add a line in `docs/conventions.md`
- [x] 4.2 Run `npm test`, lint, typecheck, `check:contrast` and `check:design-imports`
- [x] 4.3 Check every scene and the ending at 1280px in light and dark, with the dialogue box and consequence card side by side; confirm `/story` and `/story/print` are unchanged
