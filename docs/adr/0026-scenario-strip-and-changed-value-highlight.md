# 0026. The scenario strip, the customer switcher menu and a fifth dashboard effect

- Status: accepted
- Date: 2026-11-07
- Supersedes: 0025 in part (where the baseline and estimate controls sit; the list of allowed dashboard effects; the motion dependency note). 0024 is refined, not replaced (see Dependencies).

## Context

After the look-and-feel review of the sidebar and Overview the user asked for three changes. The baseline and estimate change every savings figure, but as two small dropdowns in the header they read as chrome, not as the scenario the page is showing. The customer picker in the sidebar was a label plus a select. A reader who switches the scenario cannot tell which cards moved.

## Decision

- **Scenario strip.** The baseline and estimate leave the header. Every dashboard page shows, above its title, a tinted, accent-bordered strip with "Comparing against" (local laundry, home washing, in-house laundry) and "Estimate" (Cautious, Standard, Generous estimate) as segmented buttons with every option visible, a plain tooltip per option (estimates keep ADR 0017's framing: the range is declared by the team, T002, not measured) and one line saying the choices change the savings figures. Where a page has no savings figure the line says which pages they affect. The URL params and their rules (0014, 0017) are unchanged. The header keeps the sidebar trigger, the breadcrumb and the AI toggle on every route.
- **Customer switcher.** A sidebar-07 style row under the wordmark: avatar with initials, name, industry and site count (customer data and the delivery-sites Fact), chevron, and a menu of customers. Collapsed it is the avatar with the name as tooltip. In the customer view it is the locked customer with no menu.
- **Breadcrumb.** Every segment except the current page links and keeps the params.
- **Fifth effect: changed-value highlight.** After a scenario switch, a card whose Fact value differs from the one it showed gets a brief ring. "Changed" is the Fact's value now against its value before; no arithmetic. Off under `prefers-reduced-motion` and never on first load. The closed list is now five effects: count-up, sidebar indicator, tile spotlight, one-time chart fade-in, changed-value highlight. A sixth needs a new ADR.
- **Provenance chip.** Cards use a one-line `label` variant: the least certain method's word, "+N" for more, the source mark; the full text is its name and tooltip. One legend line per page.

## Dependencies

`motion@^14` (not ^12 as 0025 noted; current at the time) drives the count-up and the sidebar indicator. CountUp and SpotlightCard from React Bits were read and adapted in house rather than installed: the count-up must land on `formatCardValue`'s exact string with the same text in the accessible name, and both needed token colours, so a verbatim install would have been rewritten. The fade-in and the highlight are CSS. `recharts@^3.8` draws the two time charts (area and thread line); the other charts are plain token-coloured markup, so the shadcn `chart` item was not added.

## Consequences

- Header pickers, `EstimateSelects` and `ParamSelect` are gone; the strip and the switcher read the URL through `useSelection`.
- The strip adds a row above every title; at 1230px with both sidebars open its two groups stack on separate lines.
- 0025 stays as written; read it together with this record.
