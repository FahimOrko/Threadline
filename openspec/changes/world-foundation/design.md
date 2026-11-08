# Design

## Context

See proposal.md for motivation and the visual direction. Built today: the Story game ends with an empty Impact World slot (`IMPACT_WORLD_HREF = null`), `/impact` is a title-only stub, `footprintFacts` already holds `comparison_footprint`, `service_footprint` (process + delivery) and `co2e_saved`, `FigurePanel`, `ChartFrame`-style provenance and `InfoPopover` exist, and `motion` is installed. `carryParams` already keeps customer, baseline, sensitivity and priorities between non-dashboard routes, so `/story` to `/world` needs no new rule. The proxy matches `/dashboard` only, so `/world` is open to both views.

## Goals / Non-Goals

**Goals:** one foundation (route, hub, layout, registry) plus Trees, so the next zones are a registry entry, an engine function, a stage and a card. No number computed outside the engine. Static end state under reduced motion.

**Non-Goals:** other zones, 3D, GSAP, mobile, new colour tokens, stored state, a score or ranking across zones.

## Decisions

1. **Zone in `?zone=`, one page.** `/world` reads `zone` through `resolveZone` (in `src/lib/world.ts`, pure, like `resolvePriorities`). Alternative `/world/trees`: needs new `carryParams` rules and per-route Suspense for no gain.

2. **Zone registry as plain data** (`ZONES` in `src/lib/world.ts`): `{ id, name, icon, status: "built" | "soon", headlineFactId?, explainKey }` (Air has no `headlineFactId`; its segment shows no figure). The hub maps over it; the page picks the stage and card renderer from a small map keyed by id. Adding a zone means a registry flip and one renderer. Equal wedges come from `360 / ZONES.length`, never from data. Alternative: a component per zone wired in the hub; rejected, it is the rework the user wants avoided.

3. **Hub geometry in SVG, labels in HTML.** Wedge paths are drawn in SVG (decorative, `aria-hidden`, hover lift via CSS on a group). Labels are absolutely positioned HTML at each wedge's bisector (percent coordinates from fixed angle constants), so Phosphor icons, `ProvenanceChip` and `ShowMathPopover` work and nothing nests a popover trigger inside a link. The zone name is the `Link`; the wedge forwards clicks to it. A coming-soon label is plain text with `aria-disabled`. Alternative: SVG `foreignObject`; rejected for focus and popover quirks.

4. **Tree maths in the engine.** `src/lib/engine/equivalences.ts` exports `treeFacts(footprintFacts)` returning the Facts and a `TreeStage` `{ perIcon, comparisonIcons, serviceIcons, savedIcons }`. It takes the footprint Facts as input (same inputs, no second computation of emissions), divides tonnes by T011, picks N from the ladder, and rounds up for drawing. A component only renders N icons from those integers. The stage is told by a `TreeStage` field when the saving is negative (extra Lindström icons, no saved icons). Icons are placed by a deterministic index-based layout (no `Math.random`) so server and client markup match; this is geometry, not a displayed number.

5. **T011 and the source.** `TeamAssumption` gains an optional `source: "PUBLIC_REFERENCE"`; default stays ASSUMPTION (ADR 0016). `treeFacts` uses it when present, and `teamAssumptionInputs` lists the source. ADR 0032 records this and the ILLUSTRATIVE method. T011 also appears in the story's team-assumptions table, labelled in plain words; its test is updated. The EPA value (0.060 tCO2e per seedling, 10 years) is checked against the source when implementing; the T011 note records the source URL and states that it is a CO2 factor applied to CO2e as an approximation.

6. **Motion is one CSS timeline.** Each icon gets `--delay` and `--row` custom properties; keyframes (fall, tint, fade) live in `globals.css` inside `@media (prefers-reduced-motion: no-preference)`, with `animation-fill-mode: backwards`. The base style is the end state, so reduced motion is the static state with no extra code. Replay re-keys the stage. `AnimatedValue` handles the count-up; the accessible text carries the final string from the first render. GSAP would add a dependency and an ADR for control this fixed three-beat timeline does not need.

7. **Header strip.** Extract the two `Segmented` controls from `scenario-strip.tsx` into `ScenarioControls` (client, reads and writes `baseline`/`sensitivity`), used by `ScenarioStrip` and by a `WorldHeader` built on the Story header surface. Same look, one source.

8. **Customer picker.** A small `CompanyPicker` on the world page reuses `ChoiceButton`, `optionsFor` and `CUSTOMER_VIEW_QUESTION`. It renders only when the view is customer and `?customer=` is absent; "Change company" is a link that drops `customer` and keeps all else.

9. **Wording.** Zone text lives in `src/lib/explain.ts` under `zone:<id>` with `{{fact:id}}` tokens and `{comparison}`; zone ids join `BANNED_ON_SCREEN` and digit scans, and the new world files join `FILES` in `tests/on-screen-wording.test.ts`. Illustration note: "These pictures illustrate the figures. They are not audit-ready reporting."

10. **Story text.** The opening lines go in `SCENES[0].intro` and `CUSTOMER_VIEW_INTRO` as fixed templates with no digits; `tests/story-game.test.ts` already scans them. `IMPACT_WORLD_HREF = "/world"`; the ending button uses `exitHref`, which keeps `view` and unknown params. `END_LINES.actions` loses the PDF wording. The data-sources note in `closing.ts` is the one sentence changed; the export reads the same constant.

## Risks / Trade-offs

- [Home washing can make Lindström need more trees] → explicit negative-saving state in the engine result, stage and text; tested.
- [Hub labels crowd at 1230px] → clamp circle size to the viewport, fixed label box about 150px, check at 1230 and 1280 before sign-off.
- [300 animated SVG nodes] → CSS transforms on `<use>` only, no JS per icon; check with the browser performance panel once.
- [Icon legend step changes with the comparison] → legend states N for the current view and the Show math explains the ladder.
- [T011 enters the story's team-assumptions table] → plain label, and the table test is updated, not loosened.
- [Air has no headline] → shown as "Coming soon" with no figure; `world-zones` defines it.
