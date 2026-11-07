# Design

## Context

See proposal.md. `AppShell` renders the sidebar when `sidebarOpen` is true (default true), as `<Separator/>` plus `<aside className="w-80 p-4">` next to `<main className="min-w-0 flex-1 p-6">`.

## Goals / Non-Goals

**Goals:** below `md` the placeholder takes no space and cannot block clicks; `md`+ unchanged.

**Non-Goals:** the overlay, any sidebar content, changing state or persistence (Slice 6).

## Decisions

- Pure CSS: add `hidden md:block` to the `<aside>` and `hidden md:block` to the separator wrapper/element. No JS media query, no new state, so no hydration flicker.
- The toggle button gets `hidden md:inline-flex` (it is an inline-flex `Button`), so no dead control shows below `md`.
- jsdom does not evaluate Tailwind breakpoints, so the component test asserts the responsive classes are present; real layout is verified by Playwright.

## Risks / Trade-offs

- Users below `md` have no sidebar control until Slice 6 adds the overlay. Low impact: the sidebar only holds "Coming soon."
- The browser check is ad-hoc (not in CI), same as earlier changes.
