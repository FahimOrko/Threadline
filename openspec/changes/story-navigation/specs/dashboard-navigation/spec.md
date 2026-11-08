# Spec Delta

## MODIFIED Requirements

### Requirement: Customer switcher
The sidebar's top slot SHALL hold, below the Threadline wordmark row, a switcher row with an avatar showing the customer's initials, the customer's name, a subtitle with its industry and its site count (from the customer data and the delivery-sites Fact, never typed in) and a chevron. Activating it SHALL open a menu listing every customer, the current one checked; choosing one SHALL change only the `customer` param. When the sidebar is collapsed the row SHALL show the avatar alone with the customer's name as its tooltip and accessible name. In the customer view the row SHALL NOT be shown, because the reader picks their company in the game.

#### Scenario: Change customer
- **WHEN** the KAM opens the switcher and chooses another customer
- **THEN** the current section reloads for that customer and the other params stay

#### Scenario: Collapsed sidebar
- **WHEN** the sidebar is collapsed
- **THEN** only the avatar is shown, its accessible name and tooltip give the customer's name, and it still opens the menu

#### Scenario: Customer view
- **WHEN** the view is customer
- **THEN** no switcher row is rendered, in the expanded or the collapsed sidebar
