# 0008. Code lives in src/

- Status: accepted
- Date: 2026-11-06
- Supersedes: none

## Context

create-next-app was run without a `src/` directory, but the product spec, conventions and agent rules all refer to paths under `src/`.

## Decision

Move `app/`, `components/` and `lib/` into `src/`. The `@/` alias points to `./src/*`. Dev dependency `@types/node` is `^24` to match the Node runtime and satisfy vitest's peer range.

## Consequences

Paths in docs and rules match the repo. New code goes under `src/`; tests live in `tests/` at the root.
