## Context

See proposal.md for motivation and the open choices. Observed: `buildStory(picks)` returns chapters of `{{fact:id}}` lines; `storyFacts(data, scope, baseline, sensitivity)` returns all Facts; `resolveLine`/`factText` turn tokens into text; selection resolvers and `storyHref` exist; `/story/print` is the PDF export. Baseline and sensitivity only affect footprint Facts; customer affects all; priorities affect order only. `docs/design.md` allows scene art and motion in Story and Impact World, and keeps one accent (teal), one icon family (Phosphor), one radius scale.

Design read: a guided story scene for a business reader, calm visual-novel language, flat shapes in the existing tokens. Dials: variance 6, motion 3, density 3. Library: existing shadcn Button and Panel on base-ui; no new shadcn items are needed (the shadcn registry was checked; nothing there fits a dialogue box or a stage).

## Goals / Non-Goals

**Goals:** a deterministic scene sequence over the four existing levers, played as dialogue; consequences built only from Facts; full state (scene, beat, levers) in the URL; zero change to `/story` and print.

**Non-Goals:** new engine math, AI text, scoring, mobile, animation beyond a simple fade, dashboard refactor, branching, the Impact World link.

## Decisions

- **Route `/story/game`.** Server page awaits `searchParams`, like Story.
- **Scenes and beats are plain data** in `src/lib/story/game.ts`. A scene is `{ id, lever, setting, question, options: [{ value, label, react }], intro: Line[], answer(optionValue): Line }`. A `Line` is `{ speaker: "kam" | "ops", text }` where `text` is a template over `{{fact:id}}` tokens. The scene's beat list is: intro lines, then `ask`, then `react`, then `answer`. Option values for customer and baseline come from loaded data, so labels are looked up, not hard-coded ids.
- **Speakers.** The KAM name tag reads "Lindström KAM". The ops lead tag reads "<Company> ops lead" using the resolved customer's name. In scene 1, before a customer is chosen, it reads "Customer ops lead". No personal names are invented and no pronouns are needed.
- **URL state:** the four lever params plus `scene=<n>` (1-based, or `end`) and `beat=<k>` (0-based index into the scene's beat list). Every beat is a plain link, so the page needs no client state (as ADR 0019). Defaults: `scene=1`, `beat=0`. A scene or beat outside range falls back to the first valid one with a notice naming the value. A beat at or after `react` with no choice for that scene's lever in the URL is clamped to `ask`.
- **Query params pass through.** The href builder starts from the current `searchParams` and overwrites only the keys the game owns (`scene`, `beat` and the four lever params); every other key, including repeated keys and ones unknown today such as `view`, is copied unchanged. All links go through this one builder: dialogue Next, choice buttons, ending buttons, and `/story` and `/story/print` (built with `storyHref` plus the extra keys). A test feeds an unknown param and asserts it survives on every link type.
- **View resolver (ready for the customer view).** `resolveView(searchParams)` sits next to the other selection resolvers and returns `"kam"` or `"customer"`; any other or missing value gives `"kam"`, the current behaviour, with no notice because the param is not a game concern yet. It is the only place the game reads `view`. In `"customer"` mode scene 1 uses a different beat list: intro lines where the ops lead introduces their own company's year (name tag always "<Company> ops lead"), then one `ask` beat with a single "Start the review" button that links to scene 2, beat 0. The customer lever is read from the resolved customer and never written or listed; no other customer is reachable, and scene 1 has no reaction, answer or card. All later scenes are unchanged. The later customer-view change only sets `?view=customer` and decides who may; it does not touch the game. Until then the mode is exercised by tests and unreachable from the UI.
- **Click to advance.** The dialogue box is one link to the next beat with a visible "Next" control, focusable, Enter and Space work. Choice buttons are links to the same scene's `react` beat with the lever param set. A small client island is only added if click-anywhere on the stage proves needed; the default is the dialogue box itself.
- **"Before" state:** the current params with that scene's lever reset to its default (levers are only set in their own scene in linear play). No `prev` param. Trade-off: revisiting an earlier scene changes later comparisons; noted in the ending.
- **Consequence beat:** `react` shows the ops lead's fixed line; `answer` shows the KAM's line and the card. The card is computed with `storyFacts` twice, keeps Facts whose value differs, and renders each as a before/after pair with a delta badge. Null on either side reads "Needs input" with no delta. The priority scene's card shows the leading chapter's Facts as they stand with no delta.
- **Dialogue text safety.** Lines are resolved only through `resolveLine`/`factText`, so every number in a line is a Fact formatted by `formatCardValue`. A unit test scans all scene templates and fails on a digit outside a `{{fact:id}}` token (T001, T002 style assumption ids are written as tokens or words, not bare digits, so they are allowed only through the existing assumption helper). Sensitivity lines name T002 as the declared spread, never as a measured range.
- **Delta math:** one pure helper `factDelta` in `src/lib/engine` (value after minus before, same unit, null if either side null) with Vitest tests, honouring "no numbers outside the engine".
- **No score.** The path strip lists choices and shows the existing CO2e saved Fact as is.
- **Ending scene:** KAM recap lines list each choice in order with its label, then two buttons: `/story/print` ("Open PDF version") and `/story` ("Read the full story"), each carrying all four lever params via `storyHref`. Below them is a marked slot: a `IMPACT_WORLD_HREF` constant in `game.ts` that is `null` and renders nothing. A code comment and a spec scenario say it is filled in by the Impact World change; `src/app/impact` exists today but is not the Impact World, so it is not linked.
- **Visual design** (all from `docs/design.md` tokens; no new colour unless a contrast pair is added):
  - **Stage** (CharacterStage): a 1280px-wide frame, about 16:7 on screen, with a SceneBackdrop behind two figures, KAM left and ops lead right, the speaker slightly raised and the other muted with `--muted-foreground`. Radius 8px, 1px `--border`, no shadows (design principle).
  - **Backdrops:** four flat SVG settings of a few shapes in `--muted`, `--card`, `--border` and one `--primary` accent, with a visible text label ("Meeting room", "Plant floor", "Sustainability office"). Light and dark both use the same tokens.
  - **Figures:** one shared head-and-shoulders SVG component. KAM uses `--primary` for the garment; the ops lead uses `--foreground` at low contrast and a different silhouette (shoulder width, hair or cap shape, a lanyard). Neutral and reacting pose. Original shapes, not based on any existing character.
  - **DialogueBox:** bottom of the stage, `--card` fill, speaker name tag as a Badge-like label (words, not colour alone), body in Geist at readable size, "Next" with a Phosphor caret icon. Consequence card sits beside it in a right column (about one third width); the dialogue takes the rest.
  - **ChoiceButton:** full-width button in the dialogue box or just above it, two to four options, label on one line, hover and focus-visible ring using `--ring`, active press `scale-[0.98]`. Each states its lever value in words.
  - **DeltaBadge:** signed value in Geist Mono (`.num`), a word ("up", "down", "no change") plus a Phosphor glyph, never colour alone, one neutral style for all (a delta is not good or bad).
  - **Motion:** a 150 ms opacity fade between beats via CSS, off under `prefers-reduced-motion`. No other animation.
- **ADR:** one new ADR records URL-held game state with beat, and the delta helper's placement.

## Risks / Trade-offs

- Hand-built SVG art takes time and can look amateur; the fallback is portrait cards with initials behind the same CharacterStage props, so the rest does not change.
- The priority scene has no Fact delta; mitigated by dialogue and card saying so in words.
- Many beats mean many URLs; fine because they are server-rendered links with no stored state.
- A delta of rounded display values can disagree with the delta of unrounded ones; the helper works on unrounded values and only the display rounds.
- Template lines can drift into stating numbers; the digit-scan test catches it.
- Four new reusable components: `/design` and `docs/design.md` must be updated in the same change.
