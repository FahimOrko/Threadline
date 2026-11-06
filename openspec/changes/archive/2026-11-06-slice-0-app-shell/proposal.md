## Why

The project is a bare create-next-app with a starter page. Every later slice (data, engine, dashboard, story, AI) needs a shared shell, the project-knowledge docs agents read before coding, and a working deploy. Doing the deploy now means build and env problems show up early, not before the pitch.

## What Changes

- Move `app/`, `components/`, `lib/` into `src/` so the code matches `docs/product-spec.md` and `CLAUDE.md`
- Add the base dependencies (zod, zustand, papaparse; tsx, vitest, @types/papaparse as dev) and the npm scripts `test` and `data:build` (stub)
- Add `.env.example` with `OPENROUTER_API_KEY`, `OPENROUTER_MODELS`, `AI_MAX_TOOL_STEPS`, and un-ignore it in `.gitignore`
- Write the seed ADRs 0001 to 0007, the ADR index, `docs/conventions.md` and four seed runbooks
- Replace the starter page with the app shell: header with placeholders, view switcher (Dashboard, Impact World, Story), collapsible empty AI sidebar, empty route pages
- Add a Zustand store holding `role`, persisted in the browser
- Manual checkpoint for the user: link the repo to Vercel and deploy the empty shell

**Out of scope:** data pipeline, calculation engine, AI calls, methodology route, real customer/baseline pickers.

## Capabilities

### New Capabilities
- `app-shell`: header, view switching between Dashboard, Impact World and Story, empty view pages, and a collapsible empty AI sidebar
- `role-mode`: KAM/customer role toggle whose choice survives a page reload

### Modified Capabilities

None. Docs, dependencies, scripts and the `src/` move change no behavior, so they have no spec.

## Impact

- Code: all existing files under `app/`, `components/`, `lib/` move to `src/`; `tsconfig.json` (`@/*` path) and `components.json` (css path) change
- Config: `package.json`, `.gitignore`, new `.env.example`
- Docs: new `docs/adr/`, `docs/conventions.md`, `docs/runbooks/`
- Dependencies: zod, zustand, papaparse, tsx, vitest, @types/papaparse
- External: a Vercel project and env vars, set by the user
