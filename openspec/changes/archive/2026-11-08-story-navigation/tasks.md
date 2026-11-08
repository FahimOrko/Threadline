# Tasks

## 1. Decision record

- [x] 1.1 Write `docs/adr/0029-story-navigation-and-customer-view-picker.md` (supersedes 0023 and 0025 in part) and update the `docs/adr/README.md` index and the two superseded rows; verify the index lists 0029 and marks both
- [x] 1.2 Update `docs/conventions.md`: customer view picks its company (no locked customer), the customer switcher is hidden in customer view and on the game, Story is a nav group; verify no "locked" wording about the customer remains

## 2. Game: customer view picker and Start over

- [x] 2.1 In `src/lib/story/game.ts`: customer view scene 1 beats are generic intro, ask, react, answer, meaning; view-specific question "Which company are you from?" and `customerViewAnswer`; remove `CUSTOMER_VIEW_CONFIRM`, `START_REVIEW_LABEL` and the `{company}` intro; verify with the updated `tests/story-game.test.ts` (no digit, no forbidden words, every beat non-empty for every customer in both views)
- [x] 2.2 `startOverHref` and `startOverState` clear `customer` in both views and count it as a lever; verify with unit tests for both views (view and unknown params kept, picker shown again)
- [x] 2.3 In `_game-view.tsx`: customer view shows the picker with no badge, the "Customer ops lead" tag until chosen, and a `standing` card for the chosen company; verify in the browser pass (3.4) that no other customer's figure appears

## 3. Game: Previous, placeholder, label bug

- [x] 3.1 Add pure `previousStep` to `game.ts` (within scene, across scenes, from the ending, `null` on scene 1 beat 0, params kept) with unit tests for each case
- [x] 3.2 Rework `src/components/dialogue-box.tsx` so Next (stretched link, Enter and Space still work) and Previous (sibling link, disabled on the first beat) sit in one footer on every beat; add `selected` to `ChoiceButton` for a revisited question; verify by tests of both components' rendered links and a keyboard check
- [x] 3.3 Right panel: net CO2e placeholder "Choose a customer to see this" with no chip or Show math until `?customer=` is set; verify with a render test for both states
- [x] 3.4 One reproduction attempt of the highlighted "Customer" label in light theme and customer view (read computed styles of the label and its parents). If it reproduces, fix the cause and add a regression check; if not, drop the task and note below as not reproduced (likely a user text selection)
- [x] 3.5 Update `docs/design.md` and the `/design` gallery for `DialogueBox` (Previous), `ChoiceButton` (`selected`); verify `npm run check:design-imports` passes

## 4. Sidebar Story group

- [x] 4.1 Add `SidebarMenuSub`, `SidebarMenuSubItem`, `SidebarMenuSubButton` (and the base-ui collapsible) to `src/components/ui/sidebar.tsx`; verify they render in `/design`
- [x] 4.2 `src/lib/nav.ts`: the Story item becomes a group with `Review` and the chapter links (only on `/story`, order from `buildStory(priorities)` then methodology and data readiness); unit tests in `tests/nav.test.ts` for default order, `priorities=cost,hygiene`, non-story routes and customer view
- [x] 4.3 `app-sidebar.tsx`: render the group (parent toggle with chevron, icon link when collapsed, default open by route), the chapter-in-view hook with a static active fill, `aria-current`, param carrying, and hide the customer switcher in customer view (delete `locked` in `param-selects.tsx`); verify with `tests/app-shell.test.tsx` updates
- [x] 4.4 Add `scroll-mt` to chapter headings; update `docs/design.md` (AppSidebar, Sidebar primitives) and the `/design` sidebar sample (expanded group, active chapter); verify the gallery shows both states

## 5. Report header

- [x] 5.1 Create `src/lib/segmented-style.ts`, use it in `Segmented` and `PriorityPicker`; restyle `StoryHeader` with the strip's border and background; verify the existing picker tests still pass (links, `aria-current`, "(selected)")
- [x] 5.2 Update the `docs/design.md` rows for StoryHeader and PriorityPicker and the `/design` gallery

## 6. Integration

- [x] 6.1 `npm test`, `npm run check:contrast`, `npm run check:design-imports`, lint and typecheck pass
- [x] 6.2 After the user approves and all of the above is applied: browser check at 1230px and 1280px, dark and light, in KAM and customer view, covering the sidebar group on `/story/game` and `/story` (chapter in view, reorder with priorities, collapsed icons), Previous through a choice, the picker and Start over, the placeholder, the label, the report header

## 7. Follow-up bugs

- [x] 7.1 Links keep `view`: `storyHref`, `PriorityPicker` and the report's site links carry it (export unchanged); tests that picker choices, Previous, Next, Start over and the exit links keep `view=customer`
- [x] 7.2 Review from `/story` opens `scene=end&beat=0` with the carried params (`NavChild.ending`); test in `tests/app-shell.test.tsx`
- [x] 7.3 Browser check: customer picker keeps customer view; Review from `/story` lands on the ending; 1280px dark and 1230px light, KAM and customer view

## Notes

- 3.4: not reproduced. One attempt in light theme and customer view (plus dark, KAM, after a click-through): no path-strip label had a background, outline or selection style (computed styles checked). Dropped as likely a user text selection; the spec requirement for it was removed.
