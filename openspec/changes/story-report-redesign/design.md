# Design

## Context

`StoryDocument` renders one chapter list for screen and print. Chapters come from `buildStory` (`lines` with `{{fact:id}}` tokens plus `cards` ids). The dashboard already has `FigurePanel`, `InlineStat`, `pick`, `ChartFrame`, `InfoPopover`, `explainer()`, `renderTemplate` and `BANNED_ON_SCREEN`. See proposal.md for scope.

## Goals / Non-Goals

**Goals:** reuse dashboard components so the story looks like the dashboard; no new numbers; one shared width for text and cards.

**Non-Goals:** print redesign, story game, sidebar, `src/proxy.ts`, new engine measures, mobile.

## Decisions

1. **Chapter shape in data.** `StoryChapter` becomes `{ id, title, lines: Template, hero, chart?, cards: [2..3] }`. `chart` is a key (`co2e-comparison`, `avoided-trend`, `waste-treatment`, `requests-trend`); the document maps keys to the same dashboard chart markup. Shared chart blocks are lifted out of the dashboard pages only if copy is more than a few lines; otherwise the story calls the same components with engine data.
   *Alternative:* a hand-written JSX per chapter. Rejected: priority reordering and print need data-driven chapters.
2. **Emissions/water lead.** Water and carbon keeps one chapter. Hero is net CO2e saved always (confirmed). Supporting cards are water saved, energy saved and delivery emissions. `emissionsLeadCards` and the pick-dependent lead go away. Percent Facts and delivery share stay in sentences and Show math only (no ring).
3. **Unset values.** Chapter `lines` use `Template` with `ifMissing`, rendered by `renderTemplate`. Euros uses the same Costs sentence the dashboard uses. A figure card still shows "Needs input" plus `needsInputHint`.
4. **Wording.** Extend `on-screen-wording.test.ts` FILES with the story files. Rewrite: "Critical dormant garments" to "garments unused for a long time"; "baseline" to "comparison"; `OPEN_QUESTIONS` drops "(T001)". **Confirmed:** T ids appear only as data cells in the collapsed team-assumption table (rendered from `a.id`, so the prose scan does not see them). Visible sentences use plain labels. No banned-list exception, no new ADR.
5. **Plain team-assumption labels.** `assumptionRows()` gains a plain `label` per T id (for example T001 "Weekly rental fee per piece"). Table columns: Id, What it is, Value, Status.
6. **Collapsibles.** Native `<details>` in one small `Collapsible` component (keyboard and a11y for free, no dependency). Screen is closed by default; the print route passes `open` so everything prints. This narrows the old "no accordions" rule: only detail tables collapse, chapter text and summaries never do.
7. **Readiness summary.** The page counts sources with a non-zero Fact from `dataReadinessFacts`; zero rows show one line, otherwise the line names how many sources have findings and the collapsible lists them. Counting rows already in Facts is selection, not computation.
8. **Header area.** One `StoryHeader` block under the title: left customer, period and comparison; right "Play the review" and "Export PDF"; below, the priority picker. The picker keeps its link behaviour (ADR 0019).
9. **Layout.** The page uses one container (`max-w-5xl`) and one grid; chapter text and the panels share the left edge and the chapter intro uses the full container width up to 65ch only for the sentence, never a narrower column than the cards.
10. **Registry.** Follow ADR 0028 as the dashboard applies it: an "i" on every non-obvious figure and every chart title, none on delivery sites, active wearers or garments in circulation. Existing keys cover nearly every card; add keys only where a story figure has none (`chart:requests-trend` for the service requests chart, and the data-readiness finding Facts). No `panel:` entries for the methodology and readiness summaries: they are text, not figures. Entries use tokens only, no banned words, `ifMissing` where a token can be unset.

## Risks / Trade-offs

- [Recharts on the print route] `AreaChartInteractive` is client-side with toggles → on print the chart shows as its table fallback (confirmed); `/story/print` must render without errors, checked in the browser.
- [Fewer cards per chapter] Percent variants and delivery share leave the cards → they stay in sentences, Show math and the dashboard (confirmed).
- [Print layout drift] Shared `StoryDocument` changes print too → keep print tests green; visual redesign is deferred.

## Open Questions

- Whether the Service hero should later get an on-time monthly series (separate engine change).
