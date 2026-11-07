# Proposal

## Why

The 320px AI sidebar placeholder leaves the main area 0px wide at a 360px viewport, so the dashboard cards and "Show math" popovers cannot be clicked on phones. Slice 6 will build the real small-screen overlay, but that is far off.

## What Changes

- Below the `md` breakpoint, the AI sidebar placeholder (and its separator) is hidden, so it never overlays or blocks the main area.
- At `md` and above, nothing changes.
- The sidebar toggle button is hidden below `md` too, so no dead control is visible on narrow screens.
- This is a stopgap. The small-screen overlay remains a requirement of Slice 6 (AI chat sidebar) in the backlog and must not be removed from it.

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- `app-shell`: the "Collapsible AI sidebar" requirement gains a narrow-screen rule.

## Impact

- `src/components/app-shell.tsx` (CSS classes on the sidebar and separator)
- `tests/app-shell.test.tsx`
- An ad-hoc Playwright + Chrome check (no dependency added to `package.json`)
- `docs/product-spec.md` is untouched.
