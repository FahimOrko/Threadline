## 1. Read first

- [x] 1.1 Read `docs/conventions.md`, `docs/adr/README.md`, `docs/design.md`, and the bundled Next.js guides for Proxy (`01-app/01-getting-started/16-proxy.md`, `03-file-conventions/proxy.md`) and layouts. Verify: the PR description names the guides read.

## 2. View mode and link params

- [x] 2.1 Add `carryParams` and `customerViewRedirect` to `src/lib/selection.ts`. Verify: Vitest in `tests/` covers dashboard to Story drops params and keeps `view`, in-dashboard keeps all, KAM default adds nothing, customer redirect keeps only `view` and `customer`, unknown `view` means KAM.
- [x] 2.2 Add `src/proxy.ts` (matcher `/dashboard/:path*`) calling `customerViewRedirect`. Verify: `curl -I "http://localhost:3000/dashboard/costs?view=customer&customer=CUST001&baseline=B_HOME"` is a redirect to `/story/game?view=customer&customer=CUST001`; without `view` the page loads; a site URL redirects too.
- [x] 2.3 Use `carryParams` in `AppShell` `ViewLinks`; hide the Dashboard link in customer view. Verify: RTL test: customer view shows Story and Impact World only; on `/dashboard?customer=CUST002&baseline=B_HOME`, the Story link has no customer or baseline.
- [x] 2.4 Replace the role toggle with `?view=` links; delete `src/store/role-store.ts` once `grep -r useRoleStore src` finds no reader. Verify: toggle sets and clears `view`, a reload keeps it, `npm run build` passes.

## 3. Dashboard layout and routes

- [x] 3.1 Create `src/app/dashboard/layout.tsx` and `DashboardSidebar` (six links, `aria-current`, labelled pickers on top with the plain sensitivity labels); hide header pickers on `/dashboard` paths. Verify: pickers show once on `/dashboard/costs`, still show in the header on `/impact`, and a picker change keeps the other params.
- [x] 3.2 Add routes `garments`, `costs`, `footprint`, `signals`, `sites`. Each opens with its subheading and token intro (from the proposal table) and holds its existing cards. Verify: Vitest renders each intro for CUST001 and asserts no "Fact" or `T0` text; a missing-token case shows "needs input".
- [x] 3.3 Move the observations to Signals with site links keeping customer, baseline, sensitivity and view; move `SiteTable` to `/dashboard/sites`; move the site page under the layout with its back link to `/dashboard/sites`. Verify: NorthStar shows five observations; a site link from `?customer=CUST001&baseline=B_HOME&sensitivity=high` keeps all three; site-page values equal the table row.
- [x] 3.4 Verify no card was lost or doubled. Verify: a script or test lists the Fact ids rendered across the six pages for CUST001 and equals the ids on the old page.

## 4. Docs, design and checks

- [x] 4.1 Add `DashboardSidebar` to `/design` and `docs/design.md`; add the view and link-param convention to `docs/conventions.md`; add an ADR for view mode and the Proxy redirect with its `docs/adr/README.md` row. Verify: `npm run check:design-imports` passes; no existing ADR edited.
- [x] 4.2 Run `openspec validate dashboard-refactor`, `npm test`, `npm run lint`, `npm run build`. Verify: all pass.
- [x] 4.3 Check each section in dark and light at 1280px with the browser tool, no console errors. Verify: screenshots of Overview and Sites in both themes.
