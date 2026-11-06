# 0015. Active wearers: latest-month maximum per site

- Status: accepted
- Date: 2026-11-06
- Supersedes: none

## Context

`service_activity` repeats the same wearers on every product row of a site and month. The pack's `sample_output.csv` sums across product rows (28 367 for NorthStar in December), which counts a person once per product.

## Decision

Active wearers is the maximum of `active_wearers` across product rows per site, summed over sites, for the latest month of the period (December 2025). NorthStar: 9 607. Method CALCULATED. The Fact's inputs show the pack's cross-row sum as "not used" and explain the difference. Service requests per 100 wearers (Dec) divides the full-year request count by these December wearers; it is labelled as such and explained in Show math.

## Consequences

The figure is a December snapshot, not a yearly average, and the per-100 rate mixes a full-year count with it. A later period picker must revisit both. The per-site table uses the same rule so its column sums to the card.
