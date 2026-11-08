## ADDED Requirements

### Requirement: World route and selection
The app SHALL serve Impact World at `/world`, full width inside the app shell, and SHALL NOT serve `/impact`. It SHALL read `?customer=`, `?baseline=`, `?sensitivity=` and `?zone=` with the existing resolvers; an unknown value falls back (hub for `zone`) with a visible notice naming it. The zone SHALL be held only in the address; no state is stored. Every link on the page SHALL keep all other query params, including `view` and unknown ones.

#### Scenario: Hub by default
- **WHEN** `/world` is opened with no `zone`
- **THEN** the hub is shown

#### Scenario: Unknown zone
- **WHEN** the address holds `?zone=NOPE`
- **THEN** the hub is shown and a notice names "NOPE"

#### Scenario: Params kept
- **WHEN** the address holds `?view=customer&customer=CUST002&x=1` and the reader opens the Trees zone and goes back
- **THEN** every address on the way holds `view`, `customer` and `x` unchanged

### Requirement: Customer on the world page
In the KAM view the customer SHALL come from the sidebar switcher (`?customer=`, default as elsewhere). In the customer view the customer SHALL come from `?customer=` only; with none, the page SHALL show the question "Which company are you from?" with the same three customers as the game and no zone, hub or figure. Choosing one SHALL set `?customer=`. In the customer view a "Change company" link SHALL clear `?customer=` and keep every other param.

#### Scenario: Customer view without a company
- **WHEN** `/world?view=customer` is opened
- **THEN** the question and three company buttons are shown and no figure names a customer

#### Scenario: Customer view with a company
- **WHEN** `/world?view=customer&customer=CUST002` is opened
- **THEN** the hub is shown for that company and "Change company" returns to the question

#### Scenario: KAM view
- **WHEN** `/world` is opened with no `view`
- **THEN** the hub is shown for the resolved customer and the sidebar switcher is present

### Requirement: Header strip
The page SHALL open with one header block using the Story header surface (accent-tinted border and background) holding the customer name, the period, and the existing comparison and estimate controls, which SHALL read and write `?baseline=` and `?sensitivity=` only. The controls SHALL be the same component the dashboard scenario strip uses, not a copy.

#### Scenario: Switching the comparison
- **WHEN** the reader chooses another comparison
- **THEN** the address holds the new `baseline`, all other params stay, and every figure on the page follows it

### Requirement: Hub of equal segments
The hub SHALL be one circle of six segments of equal size, in the order Trees, Water, Air, Energy, Circularity, Delivery, and no segment SHALL be sized, ordered or ranked by data. Each segment SHALL show the zone's icon, name and headline figure, taken from an engine Fact named in the zone registry, with a provenance chip and Show math. The Air segment SHALL have no headline Fact in this change: it SHALL show only its icon, name and "Coming soon", with no figure, chip or Show math, until `world-zones` defines its own framing. A zone not yet built SHALL keep its place and read "Coming soon" in words with a glyph and SHALL NOT be a link. A built zone SHALL be a keyboard-focusable link to `?zone=<id>`. The hub centre SHALL name the customer and carry an "Illustration" label.

#### Scenario: Six equal segments
- **WHEN** the hub is shown
- **THEN** six segments of equal angle are present and the Trees segment is a link

#### Scenario: Coming soon
- **WHEN** the hub is shown before the other zones exist
- **THEN** Water, Air, Energy, Circularity and Delivery read "Coming soon" and are not links; Water, Energy, Circularity and Delivery still show their headline figure and provenance, and Air shows no figure

#### Scenario: Figure unset
- **WHEN** a headline Fact has no value
- **THEN** its segment reads "Needs input" with a plain hint, never 0

#### Scenario: Zone slots in
- **WHEN** a later change marks a zone built in the registry and supplies its stage and card
- **THEN** the hub and the zone page need no other change

### Requirement: Shared zone layout
Every zone SHALL use one layout: the explanation top-left (what the zone shows and how it is calculated, in plain words, with Show math and an "i" per the explainers capability), the animation stage on the left, a compact data card on the right holding one or two small charts or rings and no more, and an "All zones" control that returns to the hub keeping all params.

#### Scenario: Layout at 1230px and 1280px
- **WHEN** a zone is shown at 1230px or 1280px wide
- **THEN** explanation, stage and card are all fully visible with no horizontal scroll, in light and dark

#### Scenario: Back to the hub
- **WHEN** the reader activates "All zones"
- **THEN** the hub is shown and the address has no `zone`

### Requirement: Trees zone
The Trees zone SHALL show the trees needed to absorb the comparison's emissions and the trees needed to absorb Lindström's emissions (process and delivery), and their difference as trees saved. Every count SHALL be an engine Fact. When Lindström needs more trees than the comparison, the zone SHALL say so in plain words and SHALL NOT show trees saved. The stage SHALL draw at most 300 icons and show a fixed legend "One tree icon = N trees" with N from the engine. Show math SHALL state the factor (0.060 tCO2e per urban tree seedling grown for 10 years), its source (US EPA) and that icon counts are rounded up for drawing.

#### Scenario: Saving
- **WHEN** the comparison needs more trees than Lindström
- **THEN** the stage shows the comparison's trees, marks the share Lindström needs, marks the rest as not needed, and the card shows trees saved with chip and Show math

#### Scenario: Lindström needs more
- **WHEN** the net CO2e saved is below zero
- **THEN** no trees saved figure is shown, the text says Lindström's service needs more trees than the comparison, and the stage marks the extra trees

#### Scenario: Cap
- **WHEN** the tree count is large
- **THEN** no more than 300 icons are drawn and the legend gives N

#### Scenario: Needs input
- **WHEN** a tree Fact has no value
- **THEN** the zone shows "Needs input" with a plain hint and draws no trees

### Requirement: Illustrations are labelled
Every visual on `/world` SHALL carry a visible "Illustration" label, the tree figures SHALL carry the ILLUSTRATIVE method and PUBLIC_REFERENCE source on their chips, and no text SHALL describe the page as audit-ready reporting.

#### Scenario: Label present
- **WHEN** the hub or a zone is shown
- **THEN** an "Illustration" label is visible and the text says the pictures illustrate the figures and are not audit-ready reporting

### Requirement: Motion
The hub and the Trees stage MAY animate (segments growing in, ring turning, trees falling, tinting and fading) with 2D SVG and CSS. Under `prefers-reduced-motion: reduce` nothing SHALL move and the static end state SHALL show every number. The final counts SHALL be present in the accessible text from the first render. A Replay control SHALL restart the Trees animation.

#### Scenario: Reduced motion
- **WHEN** the reader prefers reduced motion
- **THEN** the hub and the stage show their end state at once, with the same numbers

#### Scenario: Numbers while animating
- **WHEN** the animation is running
- **THEN** screen readers already find the final counts and the legend

### Requirement: Plain wording and tokens
Zone wording SHALL live in the explainers registry keyed by zone and Fact id, SHALL carry numbers only as `{{fact:id}}` tokens, SHALL NOT contain a banned word or a digit outside a token, and SHALL name the comparison as "comparison".

#### Scenario: Scan
- **WHEN** the tests scan the zone wording and the world page sources
- **THEN** no banned word and no stray digit is found
