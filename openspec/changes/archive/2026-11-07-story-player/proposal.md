# Proposal

## Why

Story is the showpiece view and the spine of the customer-ready review, but `/story` is an empty stub. A deterministic story built only from engine outputs gives the KAM something to present and to print before any AI exists, and it is the fallback the product spec requires if the AI fails. The methodology and data-readiness notes are submission deliverables and belong in the story so the printed review carries them.

## What Changes

- `/story` becomes a deterministic template story for the selected customer. Every number in it is a Fact from the engine, resolved through `{{fact:id}}` tokens and rounded only at display. No AI call, no hardcoded number.
- It reads `?customer=`, `?baseline=` and `?sensitivity=` through the same resolvers and fallback notices as the dashboard, so a shared URL reproduces the story.
- Personalization: the reader picks two priorities from six (water, cost, emissions, circularity, service, hygiene). The picks live in the URL as `?priorities=a,b`. Chapters are reordered (the picked chapters lead, in pick order) and each picked chapter gets a "Your priority" badge. Water and emissions share one chapter; picking both shows both badges on it and reorders nothing further. The picker is a plain link/form control, nothing hides content.
- Two closing chapters: **How we calculated this** (sources, team assumptions T001 to T010 split into set and unset, the illustrative local-laundry baseline behind the CO2e saved figure, sensitivity framing per ADR 0017) and **Data readiness** (data-quality report counts, unset assumptions as "Needs input", open questions for Lindström).
- An unset team assumption (today T001) reads "Needs input" in story text, never a value.
- The header keeps `?priorities=` when switching view (`ViewLinks` rebuilt the address from three known params only). `ParamSelect` already copies every existing param; a test locks that in.
- A missing or unreadable `data-quality.json` fails the build and the page never renders an empty readiness chapter.
- The "unknown priorities dropped" notice is marked so a print route can hide it.
- A small engine function turns the data-quality report into Facts so its counts are not computed in the page. The report is loaded server-side next to the generated data.
- New ADR 0019: story priorities live in the URL (extends the ADR 0014/0017 pattern).
- All chapters render fully expanded in one column with no tabs, steppers or hover-only content, so the print route can reuse them.

### Decisions (settled in review)

All recommendations were accepted. Options kept for the record.

| Choice | Options | Decision |
|---|---|---|
| Priority list | A) the six chips in the Personalization section of the spec (water, cost, emissions, circularity, service, hygiene). B) the nine `industry_priorities.csv` themes. C) Chips plus per-industry default picks | **A.** B is per-industry and cannot be a common picker. C adds a default table the data pipeline does not load. |
| Default when no picks | A) spec chapter order, picker shows "choose two". B) pre-select the industry's top two. | **A.** No hidden defaults; a URL without picks tells the same story every time. B is easy to add later. |
| Route path | A) `/story` (spec route list, stub exists). B) `/story/[storyId]` now. | **A.** Story ids belong to later AI/stored stories; the print route can become `/story/print` or `/story/[id]/print` then. |
| URL param | A) `?priorities=water,cost` (ordered, comma list). B) `?p1=water&p2=cost`. | **A.** One param, order is the pick order. Unknown, duplicate or extra values are dropped with a notice. |
| Emphasis | A) reorder plus a "Your priority" badge and the priority's key Facts first inside the chapter. B) reorder only. | **A.** Badge uses words, not colour alone. |
| Chapters | Spec default list minus "Next year's plan" (needs curation and AI, out of scope) | Cover, Your year in numbers, Kept out of the bin, Water and carbon, Euros, Where we see risk, Service and reliability (kept, review decision), then the two closing chapters. Closing chapters always stay last. |
| Hygiene chip | Maps to "Where we see risk" (dormant and over-allocation garment signals) | Confirmed: the chapter exists. Flag: it is titled for risk, not hygiene, so its intro line names hygiene. A dedicated chapter would need a hygiene-readiness Fact the engine does not have. |

## Capabilities

### New Capabilities
- `story-player`: the deterministic Story page, its URL-driven selection, two-priority personalization, closing methodology and data-readiness chapters, and the print-safe layout rule.

### Modified Capabilities
<!-- None. baseline-sensitivity already requires Story to keep the params; this change only starts using them. -->

## Impact

- Code: `src/app/story/page.tsx`; `src/components/app-shell.tsx` (`ViewLinks` carries `priorities`); new story builder and priority resolver under `src/lib` (priorities beside `selection.ts`); a data-readiness Fact builder in `src/lib/engine`; a data-quality loader beside `generatedSource`; reuse of `Panel`, `SectionHeader`, `FactStatCard`, `ObservationCard`, `ShowMathPopover`, `states`. One new reusable component for the priority picker and one for a story chapter, added to `/design` and `docs/design.md`.
- Docs: ADR 0019 and its index row; `docs/conventions.md` line for `?priorities=`.
- No new dependency. Out of scope: AI sidebar, PDF/print route, mobile layout, Impact World, Next year's plan, scenes and visual-novel effects.
