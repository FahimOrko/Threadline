## ADDED Requirements

### Requirement: Impact World is locked in the customer view until the review ends
In the customer view the sidebar item "Impact World" SHALL show a locked state until the ending has been reached for the current customer: a lock glyph, not a link, `aria-disabled`, and the text "Finish the review to open" as its accessible description, with a tooltip in the collapsed icon sidebar. In the KAM view the item SHALL never be locked. Once the ending is reached the item SHALL be a normal link. When storage is unavailable the item SHALL read as locked until an address holds `ended=1`.

#### Scenario: Customer view, review not finished
- **WHEN** `?view=customer` and the ending has not been reached
- **THEN** Impact World is shown with a lock, is not a link and says "Finish the review to open"

#### Scenario: Customer view, ending reached
- **WHEN** the reader has reached the ending in this tab
- **THEN** Impact World is a link to `/world` with the carried params

#### Scenario: KAM view
- **WHEN** the view is KAM
- **THEN** Impact World is a link whatever the progress

### Requirement: Review row keeps progress
The sidebar's Story group "Review" row SHALL open the game with the stored progress when the address holds none (see game-progress), and SHALL NOT clear it.

#### Scenario: Back from the world
- **WHEN** the reader activates "Review" on `/world`
- **THEN** the game opens at the stored beat
