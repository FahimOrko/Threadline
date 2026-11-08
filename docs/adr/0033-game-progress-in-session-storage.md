# 0033. Game progress is kept in sessionStorage, the address stays the source of truth

- Status: accepted
- Date: 2026-11-08
- Refines: 0014, 0021

## Context

The story game holds scene, beat and the four levers in the URL (ADR 0021). Leaving for `/world` and coming back through the sidebar lands on a bare game address, so the reader loses their place. The customer view also needs to know whether the ending was reached, to lock `/world` until then, and the server cannot see browser storage.

## Decision

- `sessionStorage` mirrors the game address (`scene`, `beat`, the levers) and an `ended` flag, under `lvr.game.<view>.<customerId|none>`, plus a pointer `lvr.game.<view>.last`. It lives for the tab only and holds no Fact values, only choices already in the URL.
- The address wins. Storage is read only when the game opens with no `scene` and no `beat` (the sidebar carries levers such as `customer` back from `/world`); the stored query then fills what the address lacks, with `router.replace`. Any address with a scene or beat is written to storage.
- Start over removes every `lvr.game.<view>.*` key and drops `ended` from the address it opens, in both views.
- Every storage access is in try/catch. A failing, empty, full or corrupt store means a fresh game and no error.
- The customer-view `/world` gate is a client wrapper over this flag. The ending's own link carries `ended=1`, so it opens even if storage fails. It is a UI convenience over synthetic data, not access control.

## Consequences

Two places hold game state, but one is only a copy that is never trusted over the address. Impact World still keeps no stored state of its own (ADR 0031). Cross-tab and server-side progress remain out of scope.
