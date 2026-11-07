# Tasks

## 1. Hide the sidebar placeholder below md

- [x] 1.1 In `src/components/app-shell.tsx`, add `hidden md:block` to the sidebar `<aside>` and its `<Separator>`, and `hidden md:inline-flex` to the sidebar toggle button.
- [x] 1.2 In `tests/app-shell.test.tsx`, assert the `AI assistant` aside, its separator and the toggle carry the responsive hidden classes (jsdom cannot evaluate breakpoints).
- [x] 1.3 With the same ad-hoc Playwright + Chrome setup as earlier checks (no dependency added, nothing installed), check at 390px and 1280px, in light and dark themes: at 390px no sidebar and no toggle, every dashboard card and every "Show math" popover trigger is mouse-clickable and the popover opens; at 1280px sidebar and toggle unchanged.
- [x] 1.4 Confirm Slice 6 in `docs/product-spec.md` still lists the small-screen overlay requirement (read only, no edit).
