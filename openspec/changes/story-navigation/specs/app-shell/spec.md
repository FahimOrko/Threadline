# Spec Delta

## RENAMED Requirements

- FROM: `### Requirement: Story link opens the game`
- TO: `### Requirement: Story group in the sidebar`

## MODIFIED Requirements

### Requirement: Story group in the sidebar
The sidebar's "Shared" section SHALL show Story as a collapsible group: a parent row "Story" with a chevron and indented sub-rows. The sub-row "Review" SHALL always be present and open `/story/game`; reached from `/story` it SHALL open the game at its ending (`scene=end&beat=0`) with the address's customer, comparison, estimate and priorities, so it never reads as a restart. In the expanded sidebar the parent row SHALL toggle the sub-rows; in the collapsed icon sidebar it SHALL be a link to `/story/game` and the sub-rows SHALL be hidden. The group SHALL start expanded on `/story`, `/story/game` and `/story/print` and collapsed elsewhere; the reader's toggle wins until reload and is not persisted. The parent row SHALL show the active style on all three routes. Links SHALL keep the existing carried params as before.

#### Scenario: Link target
- **WHEN** the reader activates "Review"
- **THEN** `/story/game` opens with the carried params

#### Scenario: Review from the report
- **WHEN** the route is `/story?customer=CUST002&priorities=cost,hygiene&view=customer` and the reader activates "Review"
- **THEN** `/story/game` opens at the ending with the same params and `scene=end&beat=0`, and "Read the full report" is already enabled

#### Scenario: Active state
- **WHEN** the route is `/story/game`
- **THEN** the group is expanded, the parent row shows the active style, "Review" is marked `aria-current="page"` and no chapter sub-row is shown

#### Scenario: Elsewhere
- **WHEN** the route is a dashboard section or Impact World
- **THEN** the Story group is collapsed and shows no sub-rows until the reader opens it

#### Scenario: Collapsed icon sidebar
- **WHEN** the sidebar is collapsed to icons
- **THEN** Story is one icon link to `/story/game` with a tooltip, and no sub-row is shown

### Requirement: Header pickers hidden on the game
The customer switcher SHALL NOT be shown on `/story/game`, where the game is the only place those choices are made, and SHALL NOT be shown anywhere in the customer view, where the reader picks their company in the game. It SHALL stay where defined on all other routes in the KAM view, and the scenario strip belongs to Overview and Environmental footprint only.

#### Scenario: On the game
- **WHEN** the route is `/story/game`
- **THEN** no customer switcher is rendered

#### Scenario: Customer view elsewhere
- **WHEN** `?view=customer` and the route is `/story` or `/impact`
- **THEN** no customer switcher is rendered

#### Scenario: Elsewhere
- **WHEN** the route is `/dashboard`
- **THEN** the customer switcher is shown in the sidebar and the scenario strip above the page title (Overview and Environmental footprint)

### Requirement: App sidebar
The app SHALL show a left navigation sidebar on every view except the print route. It SHALL collapse to an icon column and expand again by a trigger in the header and by `Ctrl+B`, and SHALL show a label tooltip on each icon when collapsed. Its group "Dashboard" SHALL list Overview, Garments and utilization, Costs, Environmental footprint, Signals and Sites; its group "Shared" SHALL list the Story group (see its requirement) and Impact World. The active item SHALL be marked `aria-current="page"`. The chosen state SHALL persist in a cookie and SHALL NOT be a URL param. Every item SHALL use a Phosphor icon, and the active and hovered item SHALL show an indicator that glides between items; under `prefers-reduced-motion: reduce` it SHALL be a static fill. The wordmark SHALL be its own row above the customer switcher. The sidebar's footer SHALL hold the KAM / Customer view links and the theme toggle. There SHALL be no top tab bar.

#### Scenario: Collapse
- **WHEN** the user activates the trigger
- **THEN** the sidebar shrinks to icons, the main area takes the space, and each icon still has an accessible name and a tooltip

#### Scenario: Persisted
- **WHEN** the user collapsed it and reloads
- **THEN** it is collapsed again once the page has loaded

#### Scenario: Active item
- **WHEN** the route is `/dashboard/costs`
- **THEN** only "Costs" is marked active

## ADDED Requirements

### Requirement: Report chapters in the sidebar
While the route is `/story`, the Story group SHALL list one in-page anchor sub-row per report chapter below "Review", in the order the chapters have on the page (picked priorities first, the rest in default order, then "How we calculated this" and "Data readiness"). The chapter in view SHALL be marked active with a static fill and `aria-current="location"`. The sub-rows SHALL NOT appear on any other route.

#### Scenario: Default order
- **WHEN** `/story` is open with no `?priorities=`
- **THEN** the sub-rows list the chapters in default order, then the methodology and data-readiness chapters

#### Scenario: Priorities reorder
- **WHEN** `/story?priorities=cost,hygiene` is open
- **THEN** the euros and risk sub-rows come first, in that order, as the sections do on the page

#### Scenario: Chapter in view
- **WHEN** the reader scrolls so that a chapter's heading passes the top of the viewport
- **THEN** that chapter's sub-row is marked active and the previous one is not

#### Scenario: Anchor keeps the address
- **WHEN** the reader activates a chapter sub-row
- **THEN** the page scrolls to that section and every query param stays as it was

#### Scenario: Customer view
- **WHEN** `?view=customer` and the route is `/story`
- **THEN** the same sub-rows are shown
