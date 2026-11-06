## Context

Fresh create-next-app: Next 16.4.5, React 19.3, Tailwind 4, shadcn style `base-nova` (Base UI primitives, not Radix), only `Button` installed. Code sits at the repo root while `docs/product-spec.md` and `CLAUDE.md` say `src/`. `.gitignore` ignores `.env*`. See proposal.md for scope.

## Goals / Non-Goals

**Goals:**
- A shell later slices add content to without touching its structure
- Deployable to Vercel as-is

**Non-Goals:**
- Real customer/baseline state, URL state for scene or site, theming work, the methodology route

## Decisions

- **Move to `src/` first, as its own task.** Matches the spec's folder tree and the CLAUDE.md rule paths; doing it now is cheap, later it touches every import. Alternative: keep the root layout and edit the spec. Rejected by the user.
- **One route per view**: `/dashboard`, `/impact`, `/story`; `/` redirects to `/dashboard`. Shared shell lives in the root layout so the sidebar survives navigation. Alternative: one page with client-side tabs; rejected because direct links and reload on a view are free with routes.
- **Role in a Zustand store with `persist` (localStorage)**, default `kam`. Components that show the role render after hydration to avoid an SSR mismatch. Alternative: cookie; rejected, no server need yet.
- **Sidebar open state is local UI state**, not persisted, since the spec only requires the role to persist. Can move into the store later.
- **shadcn components added via the CLI** (toggle group or tabs for the switcher and role, sheet/collapsible for the sidebar). Check the Base UI variants and the Next 16 docs in `node_modules/next/dist/docs/` before writing code.
- **`data:build` is a stub script** that exits cleanly until the data-pipeline slice, so the documented script set exists.
- **Vitest covers the store only** (default role, toggle). No component tests in this slice.
- **ADRs 0001 to 0007** follow the spec's seed list and template; the index is `docs/adr/README.md`.

## Risks / Trade-offs

- [Next 16 differs from training data] → Read the bundled docs before using routing, redirect or metadata APIs.
- [`src/` move breaks imports or shadcn paths] → Do it first, update `tsconfig.json` and `components.json`, run `npm run build` before anything else.
- [Hydration mismatch from persisted role] → Render role-dependent UI only after the store has hydrated.
- [`.gitignore` hides `.env.example`] → Add `!.env.example`; verify with `git status`.
- [Stray `cn` package in `package.json` next to `lib/utils.ts`] → Left alone here; flagged for the user to decide.

## Open Questions

- Exact route name for Impact World (`/impact` per the spec folder tree) is fixed; no other open questions.
