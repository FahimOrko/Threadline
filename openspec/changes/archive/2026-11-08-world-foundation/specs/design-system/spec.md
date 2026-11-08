## ADDED Requirements

### Requirement: World components in the gallery
The world hub, the zone layout and the trees stage SHALL be reusable components listed in `docs/design.md` and shown on `/design` in their states (hub with one built and five coming-soon zones, a zone with explanation and card, trees stage in saving, Lindström-needs-more and needs-input states, reduced motion), using only labelled sample data confined to `src/app/design/`.

#### Scenario: Gallery
- **WHEN** the user opens `/design`
- **THEN** the hub, zone layout and trees stage appear with their states and the sample-data label
