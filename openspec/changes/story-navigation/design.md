# Design

## Context

See `proposal.md` for motivation. Current state that shapes the approach:

- `src/components/ui/sidebar.tsx` is a hand port of shadcn base-nova `sidebar` (ADR 0025) with no sub-menu primitives. `src/components/app-sidebar.tsx` renders flat items from `src/lib/nav.ts` and a glide indicator (`motion` `layoutId`).
- Story is one nav item pointing at `/story/game`, active on all `/story*` routes. Chapter headings already carry `id="chapter-<id>"` (`StoryChapter`), so anchors exist.
- The game keeps scene, beat and levers in the URL (ADR 0021). `beatsFor(scene, view)` gives a locked customer scene in customer view (intro, explain, one confirmation). `DialogueBox` is one `<Link>` to the next beat, so a second link cannot nest in it.
- `startOverHref` keeps `customer` in customer view. The right panel's net CO2e line always renders from the resolved (default) customer. `src/proxy.ts` redirects `/dashboard` in customer view to the game and keeps `customer`.
- `Segmented` is a `"use client"` module; the priority picker is server-rendered links (ADR 0019).

## Goals / Non-Goals

**Goals:**
- One URL-only model: Previous, the picker and chapter links add no new state or param.
- The customer view never shows another customer's figures.
- Reuse existing pieces: `gameHref`/`stepHref`, `optionsFor`, `ConsequenceCard` `standing`, `buildStory`, `resolvePriorities`.

**Non-Goals:**
- The open questions section, print route and export.
- Mobile or narrow layouts (desktop only, 1230 and 1280px).
- New engine numbers; any proxy change.

## Decisions

**1. Sidebar group from pure data.** `nav.ts` gets `storyLinks(pathname, priorities)`: `Review` always, chapter links only when `pathname === "/story"`. Chapters come from `buildStory(priorities)` (titles and ids, reordered by priorities) plus the two fixed chapters, so the order cannot drift from the page. `app-sidebar.tsx` reads `?priorities=` with the existing `resolvePriorities`. Alternative: pass the chapter list from the server page; rejected, the sidebar already reads the URL on the client and the list needs no data.

**2. Nested markup: add `SidebarMenuSub`, `SidebarMenuSubItem`, `SidebarMenuSubButton` to the ported `ui/sidebar.tsx`** (the sidebar-07 pattern) and use the base-ui `Collapsible` for the chevron toggle. Alternative: a plain `useState` plus `aria-expanded`; fine too, but the base-ui part gives keyboard and height handling for free and matches the ported primitives. Expanded: the parent row is a toggle button. Collapsed to icons: the parent is a link to the game with a tooltip and the sub-rows are hidden, so Story stays reachable. Open state is local `useState`, initialised from the route, not persisted (the sidebar cookie stays the only persisted sidebar state).

**3. Chapter in view by an `IntersectionObserver` hook** inside the sidebar client component, observing the `h2[id^="chapter-"]` elements with a `rootMargin` that puts the line near the top; the last heading above the line is active, the first chapter when none is. It runs only on `/story`. The active fill is static (no `layoutId`), so the closed motion list of `docs/design.md` is untouched. `SidebarView` takes `activeChapter` as a prop so `/design` can show the state. Anchors are in-page links (`#chapter-x`), so the query string is untouched; the section headings get `scroll-mt` to clear the 40px header.

**4. Customer view picks its company; drop the locked branch.** In `beatsFor`, customer view scene 1 is two generic intro lines, the ask, then react, answer, meaning. The explain slots are left out there because they are conditioned on the default customer's data, which a customer-side reader must not see before choosing. The ask uses a view-specific question ("Which company are you from?"). The intro lines drop `{company}`. `CUSTOMER_VIEW_CONFIRM` and `START_REVIEW_LABEL` go. The scene's `answer` text says "against the starting customer"; customer view needs a variant, so the scene carries an optional `customerViewAnswer`, picked by view in `_game-view`. Its card uses `ConsequenceCard` `standing` over the scene's `cards` for the chosen company, not `changedFacts` against the default customer. Alternative: keep the locked confirmation and add a picker before it; rejected, two steps for one decision.

**5. Switcher hidden in customer view.** `showCustomer` becomes `pathname !== GAME_PATH && view === "kam"`; `locked` is deleted from `CustomerSwitcher`.

**6. Previous from one pure function.** `previousStep(params, view)` in `game.ts` returns the beat or scene/beat to step back to (or `null` on scene 1, beat 0), built on `beatsFor`, `resolveScene`, `resolveBeat` and `stepHref`, so levers are untouched. `DialogueBox` becomes a container: the box stays one big "Next" target using a stretched link (`after:absolute after:inset-0` on the Next link) while "Previous" is a separate sibling link with `relative z-10`, because anchors cannot nest. Beats with no Next (ask, actions) still show Previous in the same footer. Space still activates Next as today. When a question beat is revisited with a choice already in the address, `ChoiceButton` gets a `selected` prop (a "Chosen" word plus `aria-current`, not colour alone); it does not pre-select anything for a first visit. `clampBeat` needs no change: forward-only guards stay valid because choices are kept.

**7. Start over clears the customer in both views** by dropping the `view === "customer" ? {} : ...` branch in `startOverHref`/`startOverState`; the first-beat disabled rule then counts `customer` in both views.

**8. Right panel placeholder.** "Customer chosen" is `hasChoice(SCENES[0], params)`. The net CO2e row renders the muted placeholder with no chip and no Show math when false. The path strip already reads the same flag. Unknown `?customer=` values still count as chosen (the notice names them), as the strip does today. A customer view opened from the dashboard redirect arrives with `?customer=` and so shows the figure and a marked picker; accepted, noted in the spec.

**9. Report header restyle.** `StoryHeader` takes the strip's classes (`border-primary/40 bg-primary/5`). The picker's links take the segmented look. Segment class strings live in a plain module (`src/lib/segmented-style.ts`) imported by both `Segmented` and `PriorityPicker`; exporting them from the `"use client"` `Segmented` file would turn them into client references in a server component. The picker stays links with `aria-current`, no client state.

**10. Highlight bug is found, not guessed.** It did not reproduce in dark theme at 1280px after a click-through in KAM view. First task: reproduce in light theme, customer view, after Start over and by keyboard, read the computed styles of the "Customer" `li` span and its parents, and fix the actual cause. A test or a design-gallery state guards it.

**11. ADR 0029** records this change and supersedes ADR 0023 (locked customer, switcher shown locked) and ADR 0025 (flat Shared items, switcher locked) in part; the index marks both. `docs/conventions.md` loses "locked customer" wording.

## Risks / Trade-offs

- [Stretched Next link plus a Previous link inside one box can break the click-anywhere and Space behaviour] → keep the box tests in `tests/` and check by keyboard and mouse in the browser pass.
- [Scroll-spy flicker near short chapters] → choose the last heading above the line, no animation on the fill.
- [Hash links and the sticky header hide the heading] → `scroll-mt` on headings; checked in the browser.
- [Dropping explain beats in customer view scene 1 changes the script length] → `ALL_TEMPLATES` and "every customer complete" tests still cover every line; update them.
- [Customer-view reader reaches the game with `?customer=` already set] → the picker marks it chosen and lets them change it.
- [Highlight bug cause unknown] → a reproduction task comes first; if it cannot be reproduced, it is reported to the user rather than closed.

## Migration Plan

No data or URL migration: old addresses keep working. `?customer=` in a customer-view address now marks the picker's choice instead of locking it. Roll back by reverting the change.
