# 0029. Story is a navigation group, the game steps back, and the customer view picks its company

- Status: accepted
- Date: 2026-11-08
- Supersedes: 0023 in part (the locked customer), 0025 in part (the flat Shared items and the locked switcher); builds on 0019, 0021

## Context

Story is two screens, the game and the report, but the sidebar showed one link, the game only moved forward, and the customer view was locked to a customer it never asked about: a customer-side reader could not say which company they are from. A reader who finished the review could not jump to a chapter.

## Decision

- Story is a collapsible group in the Shared section (shadcn sidebar-07 nested pattern). Sub-row Review (the game) is always there; on `/story` the report chapters follow as in-page anchors in page order, which follows `?priorities=`. The chapter in view is active (a scroll listener, a static fill, no new motion). No new state or param: the rows come from the route and `?priorities=`, and the group's open state is local and not persisted. Collapsed to icons, Story is one link to the game.
- The game has a Previous control on every beat (disabled on the first). Stepping back changes only `scene` and `beat`, so choices stay in the address; a revisited question marks the chosen answer ("Chosen") and lets the reader change it.
- The customer view opens on a company picker, "Which company are you from?", the same three customers as the KAM view. The pick sets `?customer=`. Before the pick, scene 1 shows only lines that name no customer, and after it the card shows only the chosen company's figures (no before value, no other customer). The sidebar customer switcher is hidden in the customer view and on the game. A customer already in the address (the proxy keeps `customer`) shows as the marked choice and can be changed. Start over clears the customer in both views and returns to the picker. `src/proxy.ts` is unchanged.
- Before a customer is chosen the game's right panel shows "Choose a customer to see this" where the net CO2e figure would be, with no chip or Show math.
- The report header takes the scenario strip's surface and the priority chips a segmented look, from one shared class module.

## Consequences

- The old "locked customer" confirmation, its intro lines and "Start the review" are gone; the switcher's `locked` mode is deleted.
- The customer view's scene 1 has no explain beats (they read the default customer's data), so its script is shorter.
- The sub-menu primitives are added to the ported sidebar. The parent row is a toggle button when expanded, so `Story` is no longer a link there; the Review sub-row is the link.
- The anchor targets are the existing chapter headings (`chapter-<id>`).
