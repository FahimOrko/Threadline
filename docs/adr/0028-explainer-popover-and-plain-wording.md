# 0028. The "i" explainer, one registry of plain wording and the rules that keep it plain

- Status: accepted
- Date: 2026-11-07
- Supersedes: none (extends 0004 and 0005; refines 0024's rule on hatching)

## Context

Figures and charts on the dashboard were readable only with a guide: jargon ("Critical dormant", "Set T001 in the assumptions config", "Share of home washing"), a waterfall that needed explaining, a heatmap whose colour meant only "higher", and sentences such as "cost Needs input". Show math (ADR 0004) already carries formula, inputs and sources, but a KAM in a meeting needs the meaning first.

## Decision

- Every card, panel figure and chart whose meaning is not obvious from its label shows an "i" at its top-right (`InfoPopover`). It opens on click, Enter, Space or hover and closes on Escape. It says what the figure means and why it matters, in plain words. Show math stays a separate control and keeps formula, inputs and sources.
- The text is fixed template text in one registry, `src/lib/explain.ts`, keyed by Fact id or by a `chart:` or `panel:` id, never inside a component. A number appears only as a `{{fact:id}}` token (ADR 0005); the selected comparison is the word `{comparison}`. Obvious figures (active wearers, garments in circulation, delivery sites) have no entry and show no "i".
- A sentence is plain text or `{ text, ifMissing }`. A sentence whose figure can be unset (ADR 0016) carries the sentence to use in that case, so a page never reads "cost Needs input". A plain sentence whose token has no value is left out. The same sentence form is used for section intros.
- A figure with no value says what is missing in plain words from one map in the registry ("Needs a rental fee from Lindström"). The assumption id stays in Show math.
- Jargon is banned on screen and tested: "Fact", assumption ids, "baseline", "assumptions config", "tier", "trailing average", "critical", "dormant", "cut-off". `BANNED_ON_SCREEN` in `explain.ts` is the one list. Tests check every registry entry, the section intros, the observation texts and the dashboard's prose string literals. Digits outside tokens are also tested.
- Chart legends fill words from engine values (the cut-off, the repair rule) the way intros fill `{customer}` and `{period}`; tests check the printed values equal the engine's.
- Hatching means a missing value only, as with ADR 0016. An illustrative value gets no bar or a plain one.

## Consequences

One file holds all explanation wording, so it can be reviewed and tested as a whole. A new figure that needs explaining is a registry entry plus a prop. Wording inside components, a digit outside a token or a banned word fails a test. Registry text is English only and unlocalised.
