# Proposal

## Why

The review ends on numbers and a report. Nothing yet shows a customer, in one glance, what the service did for the world around them. Impact World is meant to be the app's most visual page. This change builds its foundation (route, hub, shared zone layout, zone registry) and one complete zone, Trees, so the other five zones (`world-zones`, a later change) slot in with no rework.

Everything shown is an illustration of engine Facts, never audit-ready reporting.

## What Changes

- **Route `/world`**, full width in the app shell, replacing the empty `/impact` stub (deleted). The sidebar's Impact World row points to it in both views. The AI sidebar starts collapsed here, as on the game, so the stage gets the width. The zone is held in `?zone=trees` (no stored state); no `zone` shows the hub; an unknown value shows the hub with a notice.
- **Customer**: KAM uses the sidebar switcher. Customer view uses `?customer=`; with none, `/world` shows the "Which company are you from?" picker (same wording and buttons as the game). A "Change company" link clears it.
- **Header strip**: the Story-header surface with customer name, period, and the existing comparison and estimate controls. The two segmented controls are extracted from `ScenarioStrip` into one shared piece so no new control is built.
- **Hub**: a central circle of six equal segments (Trees, Water, Air, Energy, Circularity, Delivery). Equal on purpose, never sized by data (the units do not compare). Each segment shows its headline Fact with chip and Show math. Trees is built; the other five are visibly "Coming soon" and keep their place.
- **Zone layout** (shared): explanation top-left (plain words, Show math, "i"), stage left, compact data card right (a `FigurePanel` with a ring and one small bar), "All zones" button back to the hub.
- **Trees zone**: trees fall and settle. Trees needed for the comparison's emissions against trees needed for Lindström's (delivery included); the difference is trees saved. If Lindström needs more (possible with home washing), the zone says so plainly and shows no "saved". Factor: US EPA, 0.060 tCO2e per urban tree seedling grown for 10 years, ILLUSTRATIVE and PUBLIC_REFERENCE, source in Show math. Icons capped at 300 with a fixed legend (one icon = N trees).
- **Engine**: new Facts for tree counts and the legend scale, all computed in `src/lib/engine`. New assumptions-config entry **T011** for the factor.
- **ADRs**: 0031 (Impact World foundation: route, `?zone=`, equal hub, zone registry) and 0032 (public-reference factors: a T id, but source PUBLIC_REFERENCE instead of ASSUMPTION, refining 0016).
- **Story intro**: two or three plain lines at the very start of the game on why the review matters, what we do, and that the world view follows.
- **Game ending**: a primary "See your impact on the world" button to `/world` with all params including `?view=`. `IMPACT_WORLD_HREF` is set.
- **Report data note** now says equivalences such as trees appear in Impact World as labelled illustrations.
- **/design** gets the hub, zone layout and trees stage.

### Visual direction (for review before code)

Colour uses existing tokens only. No green token exists and adding one needs a contrast pair, so: **teal `--primary` = Lindström** and **grey `--chart-comparison` = the comparison**, the same meaning as the dashboard charts. Amber appears only on the ILLUSTRATIVE chip.

**Hub.** A circle about 560px across (`min(100%, 100dvh - 15rem)`, clamped 480 to 620) centred under the header strip, over a quiet backdrop: `--background` easing to `--card`, faint concentric contour rings, and a thin outer ring with six ticks that turns once a minute. Six 60° wedges start at 12 o'clock clockwise (Trees first), separated by 3px gaps in the background colour, with a hole of about 22% of the radius. The hole holds the customer name, "Your impact on the world" and an "Illustration" badge. A built wedge is `--primary` at 10% with a 40% hairline, 20% on hover or focus, and lifts 6px outward along its bisector. A coming-soon wedge is `--muted` at 60%, no hover, with a lock glyph and the words "Coming soon". Inside each wedge, at about 65% of the radius: Phosphor icon, zone name, headline figure in mono with its compact chip and Show math. The wedge is a link (keyboard focusable); the label is the accessible name.
*Motion:* wedges grow from the centre, staggered 70ms, 450ms ease-out (about 0.8s in total); the outer ring turns slowly; wedge lift 180ms.

**Trees zone.** Stage is SVG in 3 depth layers: sky (`--card` to `--background`, a soft `--primary` glow top-right, two slow clouds drifting 60s), far hills (`--muted` at 40%), near hills and a ground strip. Trees stand in about 12 rows: back rows smaller and paler (scale 0.6 to 1.0 with depth), so the grove reads as depth. One custom SVG tree symbol reused through `<use>`. One grove tells the story in three beats:
1. **0 to 2.6s, "The comparison needs this many trees."** All comparison icons fall from above the stage in grey, rows staggered, each about 700ms ease-in with a 120ms squash on landing, whole fall done in about 2.2s. The count-up (the existing `AnimatedValue`) runs the same 2.2s.
2. **3.0s, "Lindström needs these."** The first M icons crossfade to teal over 400ms, sweeping left to right.
3. **3.6s, "These are saved."** The rest fade to 30% over 600ms and the saved count ticks up.
Total about 4.5s, with a Replay button. Under reduced motion nothing moves: the end state (teal, faded, numbers shown) is the base style, and the animation only exists under `prefers-reduced-motion: no-preference`. Words carry the meaning, not colour alone: a legend lists "Needed with Lindström", "Not needed" and "One icon = N trees". A persistent "Illustration" badge sits on the stage.

**Rendering.** 2D SVG; falls, tint and fade are one CSS keyframe timeline with per-icon delays (compositor only, no JS per icon). `motion` (already installed) is used only for the existing count-up. GSAP is not proposed: one fixed timeline does not need it.

### Decisions I made (say if you disagree)

- **Air** headline is net CO2e saved (kg). The pack has no air-quality data, so Air is the climate side of the same Fact that Trees re-expresses.
- Other hub headlines: Water = water saved, Energy = energy saved, Circularity = recycling and reuse share, Delivery = delivery emissions (absolute, so delivery stays honest).
- Zone lives in `?zone=` rather than `/world/trees`, so every link keeps its params through the existing helpers.
- The icon legend step comes from the engine and can change when the comparison changes; the legend says so.
- The stale "You can open the PDF version" line in the ending (PDF was removed by ADR 0030) is corrected, since that button row is being edited.

### Licences and assets

Phosphor icons (MIT) are the only icon set. Trees, sky, hills and ground are original SVG. No React Bits component, no online asset and no new dependency are used. The EPA factor is a public figure cited, not an asset.

## Capabilities

### New Capabilities
- `impact-world`: the `/world` route, customer handling, header strip, hub, zone registry and shared zone layout, the Trees zone, illustration labelling, motion and reduced-motion rules.

### Modified Capabilities
- `kpi-engine`: tree-count Facts and the icon-scale Fact (illustrative equivalences, public reference).
- `team-assumptions`: T011 tree factor; an entry may carry source PUBLIC_REFERENCE.
- `story-choices-game`: intro lines about why the review matters; the Impact World link replaces the empty slot; corrected ending line.
- `app-shell`: Impact World nav row to `/world`; AI sidebar starts collapsed there.
- `story-player`: the report's data-sources note.
- `design-system`: hub, zone layout and trees stage are listed in `/design` and `docs/design.md`.

## Impact

- Code: new `src/app/world/`, `src/lib/world.ts` (zone registry), `src/lib/engine/equivalences.ts`, `src/components/` (world hub, zone layout, trees stage, extracted scenario controls); edits to `nav.ts`, `app-shell.tsx`, `scenario-strip.tsx`, `story/game.ts`, `_game-view.tsx`, `story/closing.ts`, `explain.ts`, `assumptions-config.ts`, `src/app/design/page.tsx`; delete `src/app/impact/`.
- Docs: `docs/design.md`, `docs/conventions.md`, `docs/adr/` (0031, 0032, README index). `docs/product-spec.md` is not touched.
- Tests: engine (tree Facts, cap, null, negative saving), assumptions, nav, zone resolver, wording and digit scans extended to the new files, game intro and ending, hub and stage component tests.
- Out of scope: the five other zones (`world-zones`), 3D, GSAP, mobile, any number computed outside the engine.
