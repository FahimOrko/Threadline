## Context

- Game state is the address (ADR 0021): `scene`, `beat`, `customer`, `baseline`, `sensitivity`, `priorities`. Navigating to `/world` and back via the sidebar link (`GAME_PATH` plus carried params) lands on a bare game address, so the game restarts. No code uses web storage today.
- The report gate is purely address-based: `reportLinkState` disables "Read the full report" until `scene=end`, with `REPORT_HINT`. The server cannot see `sessionStorage`, so a world gate has to be decided on the client.
- `/world` already resolves the customer picker in the customer view (`_world-view.tsx`); the sidebar (`app-sidebar.tsx`) is a client component driven by `nav.ts` data.
- Trees: `treeFacts` builds `tree_factor`, `trees_comparison`, `trees_service`, `trees_saved`, `tree_icon_scale`. The id `trees_saved` is used by `world.ts` (hub headline), `explain.ts`, `_world-view.tsx`, `/design` sample data and tests. There is no Fact for garments washed; the footprint code already sums `customer_washed_kg` as an input.
- The first slide text exists twice: `SCENES[0].intro[0]` and `CUSTOMER_VIEW_INTRO[0]`.

## Goals / Non-Goals

**Goals:**
- Progress survives a trip to `/world` and a refresh, within the tab, with a safe fallback.
- The customer view cannot reach the world before the ending, except through the ending's own link.
- Trees are presented as an equivalence, with a visible three-step derivation, and no number is computed outside the engine.
- Story copy is warm and consistent, and the rule is written down.

**Non-Goals:**
- Server-side or cross-tab progress, accounts, or any persistence beyond the tab session.
- Real access control: the gate is a UI convenience over synthetic data.
- New zones, or any edit to `docs/product-spec.md`.

## Decisions

1. **Storage mirrors the address; the address wins.** A small client module `src/lib/story/progress.ts` (read, write, clear, all in try/catch, validated with the existing resolvers) and a client component `GameProgress` mounted on `/story/game`. On mount: if the address has no `scene`, `beat` or lever, read storage and `router.replace` to the stored query (keeping `view` and unknown params); otherwise write the current query. Alternative considered: a Zustand store (ADR 0014 and 0021 favour the address, and a store would give two sources of truth). Rejected.
2. **Key** `lvr.game.<view>.<customerId|none>`, plus a pointer `lvr.game.<view>.last` holding the last customer id, so a bare address with no `customer` (customer-view picker, KAM before scene 1 is answered) can find the record. Value is the stored query string, e.g. `scene=3&beat=2&customer=...`, and a separate `ended` boolean in the same JSON. No Fact values are stored, only addresses already in the URL.
3. **Ending flag** is set when `scene=end` is shown and when `ended=1` reaches `/world`. It is per view and customer. Start over (a client button replacing the server `Link`, same classes) removes every `lvr.game.<view>.*` key, then navigates.
4. **Gate is a client wrapper.** `WorldGate` wraps the server-rendered `WorldView` output and takes `view` and `customer`. KAM passes through. Customer view: `useSyncExternalStore` over the storage state with a `false` server snapshot and a separate "known" flag, so the first paint is the skeleton, then either the content or the locked panel (same visual language as `REPORT_HINT`, with a link to `gameHref`). `ended=1` in the address bypasses and records. Alternative: gate in `proxy.ts`. Rejected, because the proxy cannot see `sessionStorage`; a cookie would add server state ADR 0001 avoids.
5. **Sidebar** reads the same hook. `NavItem` gets an optional `gate: "review"`; `navGroupsFor` stays pure data and the component decides locked from the hook plus the view. A locked item renders as a disabled `SidebarMenuButton` with a Phosphor `Lock` and `aria-disabled`, and a description id with the "Finish the review to open" text.
6. **Ending link** uses `exitHref(IMPACT_WORLD_HREF, ...)` plus `ended=1`, so it works with storage broken.
7. **Trees relabel, ids stay.** Renaming `trees_saved` would touch the registry, sample data and tests for no reader benefit. The label, formula text and every string change; a Vitest scan fails on "trees saved" in labels, `EXPLAIN` and the world components. `factText` appends the unit, so `trees_saved` gets the unit "young trees" and the headline template reads "...equal what {{fact:trees_saved}} absorb in 10 years" (renders "7 200 young trees"). The other tree Facts keep "trees". No resolver change.
8. **"How we got here" strip.** New engine Fact `washed_kg` (step 1) from the rows `footprintFacts` already sums, so no second sum. Step 2 uses `comparison_footprint` and `service_footprint`. Step 3 uses `trees_saved` and `tree_factor`. A presentational `HowWeGotHere` component receives Facts only and joins them with arrows; it is added to `/design` and `docs/design.md`. Negative case: step 3 uses the "needs more" wording and the `extra` Fact view, never a minus-signed "saving".
9. **Copy pass is data-only.** Edits stay inside `SCENES`, `CUSTOMER_VIEW_*`, `END_LINES`, `CHAPTERS`, `closing.ts`, `EXPORT_TEXT` and `explain.ts`. Existing scans (`tests/story-game.test.ts`, `explainers.test.ts`, `on-screen-wording.test.ts`) protect tokens, banned words and digits. The voice rules go in `docs/conventions.md`: speak to "you", short sentences, contractions allowed, say why before what, define a term the first time (e.g. CO2e), no "the data pack says", no raw ids except T ids in Show math, honest about uncertainty without hedging every line.
10. **ADR 0033** "Game progress is kept in sessionStorage" refines (does not supersede) 0014 and 0021: the address stays the source of truth, storage only restores it and carries the ending flag. The index row and the conventions line are added in the same change. `/world` retains "no stored state" for the zone (ADR 0031); the gate flag is game state, not world state.

## Risks / Trade-offs

- **Flash of skeleton** on `/world` in the customer view while storage is read: accepted, one frame, avoids showing then hiding content.
- **Stale restore** (a returned game after a data change): addresses hold only choices, which the resolvers revalidate, and unknown values already fall back with a notice.
- **`ended=1` can be typed by hand**: accepted; it is not a security boundary.
- **Copy drift**: new lines may slip in a digit or banned word; the existing scans cover it, and the ten rewrites are reviewed before apply.
- **Relabel breaks saved exports**: the `.md` and JSON export use Fact labels; the export test is updated, and no external consumer exists.

## Open Questions

- The ten rewrites in the proposal are drafts; the user's review may change the voice before the full pass.
