# 0002. Base data as static JSON plus browser overlay for edits

- Status: accepted
- Date: 2026-11-06
- Supersedes: none

## Context

Users edit and curate points during the review, but there is no database.

## Decision

Ship base data as static JSON generated at build time. Store user edits in the browser as a small overlay merged over the base data. Reset clears the overlay.

## Consequences

Edits are per browser and can be exported and imported. The server must receive the overlay when it needs to compute the same numbers the user sees.
