# Spec Delta

## MODIFIED Requirements

### Requirement: Header placeholders
The app SHALL show one thin header row on every view, holding only the sidebar trigger, a breadcrumb of the current location and the AI sidebar toggle. The customer switcher SHALL be in the sidebar's switcher slot, and the baseline and estimate choices SHALL be the scenario strip at the top of dashboard pages, never in the header. The theme toggle and the KAM/Customer view toggle SHALL be in the sidebar footer.

#### Scenario: Header on the dashboard
- **WHEN** the user opens a dashboard route
- **THEN** the header shows the trigger, breadcrumb and AI toggle only, and, on Overview and Environmental footprint, the scenario strip is the first thing in the page

#### Scenario: Header visible on all views
- **WHEN** the user opens Impact World
- **THEN** the header shows the trigger, breadcrumb and AI toggle, and no baseline or estimate control is shown

#### Scenario: Switch theme from header
- **WHEN** the user activates the theme toggle in the sidebar footer
- **THEN** the app switches to the other theme immediately

#### Scenario: Picker is operable
- **WHEN** the user focuses the customer switcher and chooses a customer with the keyboard
- **THEN** the selection changes as described in the customer-selection capability

### Requirement: App sidebar
The app SHALL show a left navigation sidebar on every view. It SHALL collapse to an icon column and expand again by a trigger in the header and by `Ctrl+B`, and SHALL show a label tooltip on each icon when collapsed. Its group "Dashboard" SHALL list Overview, Garments and utilization, Costs, Environmental footprint, Signals and Sites; its group "Shared" SHALL list the Story group (see its requirement) and Impact World. The active item SHALL be marked `aria-current="page"`. The chosen state SHALL persist in a cookie and SHALL NOT be a URL param. Every item SHALL use a Phosphor icon, and the active and hovered item SHALL show an indicator that glides between items; under `prefers-reduced-motion: reduce` it SHALL be a static fill. The wordmark SHALL be its own row above the customer switcher. The sidebar's footer SHALL hold the KAM / Customer view links and the theme toggle. There SHALL be no top tab bar.

#### Scenario: Collapse
- **WHEN** the user activates the trigger
- **THEN** the sidebar shrinks to icons, the main area takes the space, and each icon still has an accessible name and a tooltip

#### Scenario: Persisted
- **WHEN** the user collapsed it and reloads
- **THEN** it is collapsed again once the page has loaded

#### Scenario: Active item
- **WHEN** the route is `/dashboard/costs`
- **THEN** only "Costs" is marked active

### Requirement: Story group in the sidebar
The sidebar's "Shared" section SHALL show Story as a collapsible group: a parent row "Story" with a chevron and indented sub-rows. The sub-row "Review" SHALL always be present and open `/story/game`; reached from `/story` it SHALL open the game at its ending (`scene=end&beat=0`) with the address's customer, comparison, estimate and priorities, so it never reads as a restart. In the expanded sidebar the parent row SHALL toggle the sub-rows; in the collapsed icon sidebar it SHALL be a link to `/story/game` and the sub-rows SHALL be hidden. The group SHALL start expanded on `/story` and `/story/game` and collapsed elsewhere; the reader's toggle wins until reload and is not persisted. The parent row SHALL show the active style on both routes. Links SHALL keep the existing carried params as before.

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

