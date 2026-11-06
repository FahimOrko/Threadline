# Tasks

## 1. Docs and dependencies

- [x] 1.1 Read `node_modules/next/dist/docs/` for layout and metadata, then write `docs/design.md` with principles, token table, and the planned component list; verify the file lists every component named in the design-system spec.
- [x] 1.2 Install `@phosphor-icons/react` and `next-themes`, set `iconLibrary` in `components.json`, replace Lucide imports in `src/components/ui/*` and `app-shell.tsx`, remove `lucide-react`; verify `grep -r lucide src package.json` is empty, `next-themes` appears in `package.json` with a version whose peer range accepts the installed Next.js, and `npm run build` passes.

## 2. Tokens and theme

- [x] 2.1 Define dark (default) and light token sets, teal accent, `--certain` and `--uncertain` tints, radius scale and the `.num` tabular-figure utility in `globals.css`; verify both themes render in `/` and body text, chips and the amber tint pass 4.5:1.
- [x] 2.2 Add a client `ThemeProvider` (`next-themes`, `attribute="class"`, `defaultTheme="dark"`, `enableSystem={false}`, `disableTransitionOnChange`) in `layout.tsx` with `suppressHydrationWarning` on `<html>`, after reading the Next docs for provider placement; verify a fresh visit renders the dark class on `<html>` and the Zustand role store is unchanged.
- [x] 2.3 Add the theme toggle in the header (leaf client component using `useTheme`, rendered after mount, Phosphor icon, accessible name); verify in the browser that switching works, the choice survives a reload and a reload in light shows no dark flash.
- [x] 2.4 Restyle Button, Separator and Toggle to the tokens (focus ring in accent, hairline borders, 6px radius, no shadows); verify they look correct in both themes and keyboard focus is visible.

## 3. Provenance components

- [x] 3.1 Build ProvenanceChip with method and source labels, glyphs and the least-certain-wins tint rule; verify a Vitest test covers CALCULATED (neutral), ESTIMATED (amber), and ALLOCATED + ESTIMATED (amber with both labels).
- [x] 3.2 Build the ShowMath panel with the accent thread line, formula, inputs, assumption IDs, baseline and range, and keyboard toggle with `aria-expanded`; verify with a Vitest test that Enter toggles it and `aria-expanded` changes.

## 4. Layout and state components

- [x] 4.1 Build Panel, SectionHeader, Badge and Tooltip to the radius and border rules; verify they render without shadows in both themes.
- [x] 4.2 Build StatCard (label, value in mono, ProvenanceChip slot) and the loading skeleton, empty and error states; verify each state renders and the skeleton matches the StatCard layout.

## 5. Design gallery

- [x] 5.1 Create `src/app/design/` with anchored sections Tokens, Provenance, Data display, Controls, States and Effects, and sample data in `src/app/design/_sample/`; verify every component from `docs/design.md` appears in all its states.
- [x] 5.2 Show the "sample data, not engine output" label wherever a sample number appears and mark Effects as reserved for Story and Impact World; verify visually in `/design`.
- [x] 5.3 Add `npm run check:design-imports` that fails when a file outside `src/app/design/` imports `_sample`; verify it passes now and fails when a temporary import is added (then removed).

## 6. Integration checks

- [x] 6.1 Run `npm test`, `npm run lint`, `npm run build` and `npm run check:design-imports`; verify all pass.
- [x] 6.2 Run a contrast check on the neutral chip, the amber-tint chip, body text and the accent in both themes by computing ratios from the rendered token colours; verify every text pair is at least 4.5:1, chip edges differ from the page background, and record the ratios in `docs/design.md`.
- [x] 6.3 Open `/design`, `/dashboard`, `/impact` and `/story` in dark and light on desktop and mobile widths and run the design-taste-frontend browser checker; verify no layout break, no console errors and contrast holds.

## 7. ADR, convention and runbook updates

- [x] 7.1 Write the ADR for the sample-data exception (sample data only inside `/design`, labelled, never imported elsewhere) and an ADR for the theme and token approach if the decisions above changed; verify each file follows the ADR template.
- [x] 7.2 Add to `docs/conventions.md` the rules: nothing outside `src/app/design/` imports the sample data, numbers use Geist Mono with tabular figures, icons come from Phosphor, and theme tokens are the only colour source; verify the file reads consistently with the existing UI section.
- [x] 7.3 Update `docs/design.md` so the component list matches what was built, and add a short runbook `docs/runbooks/add-design-component.md` (add to `/design` and `docs/design.md`, run the checks); verify the steps run as written.
- [x] 7.4 Update the ADR index `docs/adr/README.md` with the new ADRs; verify every ADR file is listed.

## Done when

- `/design` lists every component from `docs/design.md` in all its states, in both themes.
- Dark is the default; the toggle switches to light; the choice persists across reload with no flash.
- Role still persists through Zustand as before.
- Contrast ratios for the neutral chip, the amber-tint chip, body text and the accent are recorded and all text pairs are at least 4.5:1 in dark and light.
- A value with ALLOCATED and ESTIMATED shows both labels and the amber tint.
- Sample data exists only under `src/app/design/` and `npm run check:design-imports` passes.
- No Lucide imports remain; icons are Phosphor.
- `npm test`, `npm run lint` and `npm run build` pass.
- The new ADR, conventions, `docs/design.md`, the runbook and the ADR index are updated.

## Workflow follow-up

- User reviews the implemented change, then archive it with `/opsx:archive` so the three specs merge into `openspec/specs/`.
