# Tasks

## 1. Move to src/

- [ ] 1.1 Move `app/`, `components/`, `lib/` into `src/`, set tsconfig `@/*` to `./src/*`, fix the `components.json` css path; verify `npm run build` and `npm run lint` pass

## 2. Config and dependencies

- [ ] 2.1 Add `!.env.example` to `.gitignore` and create `.env.example` with `OPENROUTER_API_KEY`, `OPENROUTER_MODELS` (`:free` models, comma-separated) and `AI_MAX_TOOL_STEPS=3`; verify `git status` lists `.env.example` and `.env.local` stays ignored
- [ ] 2.2 Install zod, zustand, papaparse and dev deps tsx, vitest, @types/papaparse; verify `npm ls` shows them and `npm run build` still passes
- [ ] 2.3 Add scripts `test` (vitest run) and `data:build` (stub that exits 0 with a message); verify both run

## 3. Project knowledge docs

- [ ] 3.1 Write ADRs 0001 to 0007 in `docs/adr/` using the spec's template and `docs/adr/README.md` index; verify each ADR appears in the index with status and one-line summary
- [ ] 3.2 Write `docs/conventions.md` (naming, folders, provenance, testing, numbers only in the engine); verify it matches the CLAUDE.md rules
- [ ] 3.3 Write the four seed runbooks in `docs/runbooks/` (rebuild data, deploy and env vars, switch free model using `OPENROUTER_MODELS`, back up/restore/reset demo state); verify each has numbered steps
- [ ] 3.4 Point CLAUDE.md at the conventions and ADR index (paths now exist); verify the links resolve

## 4. Role store

- [ ] 4.1 Create the Zustand store in `src/store/` with `role` (`kam` default, `customer`), a setter and `persist`; add a Vitest test for the default and the toggle; verify `npm test` passes

## 5. App shell

- [ ] 5.1 Add the needed shadcn components via the CLI (toggle group or tabs, sheet or collapsible); verify files appear under `src/components/ui/`
- [ ] 5.2 Replace the starter page and metadata: `/` redirects to `/dashboard`, add empty `/dashboard`, `/impact`, `/story` pages with titles; verify each URL renders its title
- [ ] 5.3 Build the header (customer and baseline placeholders, role toggle wired to the store) in the root layout; verify the toggle changes role and survives reload without a hydration warning
- [ ] 5.4 Build the view switcher with active state; verify switching changes the route and highlight, and direct links to each view work
- [ ] 5.5 Build the collapsible empty AI sidebar in the layout; verify it collapses, expands and stays open across view changes
- [ ] 5.6 Run `npm run dev` end to end against the spec scenarios (views, sidebar, role and reload); verify `npm run build`, `npm run lint`, `npm test` pass

## 6. Deploy (manual checkpoint for the user)

- [ ] 6.1 User: link the repo to Vercel, set `OPENROUTER_API_KEY`, `OPENROUTER_MODELS`, `AI_MAX_TOOL_STEPS`, deploy; verify the Vercel URL shows the same shell and the role toggle survives reload

## 7. Wrap-up

- [ ] 7.1 Add an ADR, convention or runbook if this change needs one (for example the `src/` move or the deploy steps learned) and update the ADR index; verify the index lists any new ADR
