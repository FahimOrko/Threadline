# Proposal

## Why

The story is two screens (the game, then the report) but the sidebar treats it as one link, the game only moves forward, and the customer view is locked to a customer it never asks about. A reader who finishes the review cannot jump to a chapter, cannot step back to change an answer, and a customer-side reader cannot say which company they are from. The report header also looks unlike the dashboard's scenario strip, and the game's right panel shows a figure for a customer nobody has chosen yet.

## What Changes

- **Sidebar**: "Story" becomes a collapsible group in Shared (shadcn sidebar-07 nested pattern: parent row with chevron, indented sub-rows). Sub-rows: **Review** (the game), always; the report chapters as anchor links to their sections, only while on `/story`, in the current chapter order (which follows the chosen priorities). The active indicator highlights the chapter in view. Param carrying is unchanged.
- **Game, Previous**: a Previous control next to Next steps back through beats and scenes. Going back past a choice keeps the choice and lets the reader change it. Disabled on the very first beat.
- **Game, customer view**: scene 1 opens on a company picker, "Which company are you from?", with the three customers. The pick sets `?customer=`; data, dialogue and suggestions follow it. The sidebar customer switcher is hidden in customer view. Start over returns to the picker. KAM view keeps its picker wording. **BREAKING** for the old "locked customer" behaviour (ADR 0023, ADR 0025): the customer view no longer shows a locked customer or a "Start the review" confirmation.
- **Report header**: the Story header block takes the scenario strip's look (teal-tinted border and background) and the priority chips become a segmented-style group. Styling only.
- **Bug**: before a customer is chosen, the game's right panel shows a placeholder instead of the Net CO2e figure.
- **Bug**: the "Customer" label in the game's right panel renders highlighted like a stray selection or focus style; find and fix the cause.
- Right panel content and layout otherwise unchanged. Not touched: the open questions section, the print route, export.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `app-shell`: the Story sidebar item becomes a group with Review and chapter sub-rows; the customer switcher is also hidden in customer view.
- `dashboard-navigation`: the customer switcher row no longer shows a "locked customer" in customer view; it is hidden there.
- `story-choices-game`: customer view picks its company instead of a locked confirmation; Previous control; Start over clears the customer in both views; placeholder in the right panel before a customer is chosen; plain path-strip labels.
- `story-player`: the report header block matches the scenario strip, with a segmented priority picker.

## Impact

- Code: `src/lib/nav.ts`, `src/components/app-sidebar.tsx`, `src/components/ui/sidebar.tsx` (sub-menu primitives), `src/components/param-selects.tsx` (`locked` goes away), `src/lib/story/game.ts` (customer view beats, Previous, Start over), `src/app/story/game/_game-view.tsx`, `src/components/dialogue-box.tsx`, `src/components/choice-button.tsx`, `src/components/story-header.tsx`, `src/components/priority-picker.tsx`.
- Docs: new ADR 0029 (supersedes 0023 and 0025 in part), `docs/adr/README.md`, `docs/conventions.md`, `docs/design.md`, `/design` gallery.
- Tests: `tests/story-game.test.ts`, `tests/nav.test.ts`, `tests/app-shell.test.tsx`.
- No engine, data or proxy change. `src/proxy.ts` keeps redirecting `/dashboard` in customer view and keeps `customer`, which now pre-selects the picker.
