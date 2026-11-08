# 0031. Impact World: one route, an equal hub, the zone in the address and a registry

- Status: accepted
- Date: 2026-11-08

## Context

Impact World is the app's visual showcase. It must show several kinds of impact (trees, water, air, energy, circularity, delivery) that have different units and cannot be compared, in a way that lets zones be added one at a time without reworking the page.

## Decision

- The route is `/world`, full width in the app shell. The empty `/impact` stub is deleted and not redirected. The AI sidebar starts collapsed there, as on the game.
- The hub is six equal segments in a fixed order. Size and order never come from data, because the units do not compare. A zone not yet built keeps its place and reads "Coming soon". Air has no headline figure until its own framing exists.
- The zone is `?zone=<id>`, not a nested route, so every link keeps all other params through the existing helpers (ADR 0014, 0017, 0023). An unknown value shows the hub with a notice. No state is stored.
- Zones are plain data in `src/lib/world.ts` (`ZONES`): id, name, icon, status, optional headline Fact and wording key. The page picks each zone's stage and card from a small map; a later zone is a registry flip and one renderer.
- Everything on the page is labelled an illustration of engine Facts and never described as audit-ready reporting. Wording lives in `src/lib/explain.ts` (ADR 0028).
- Motion is 2D SVG and CSS keyframes, off under `prefers-reduced-motion: reduce` with a static end state that still shows every number. No animation library beyond the installed `motion` count-up; GSAP is not used.
- Colour uses existing tokens: teal `--primary` for Lindström, grey `--chart-comparison` for the comparison (ADR 0024).

## Consequences

`/impact` bookmarks return the not-found page. The customer view reaches `/world` from the game's ending. Each later zone needs only a registry entry, wording, a stage and a card.
