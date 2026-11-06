@AGENTS.md

## Project rules

- `docs/product-spec.md` is the vision, `openspec/specs/` is what is built. Never edit `docs/product-spec.md` unless the user asks.
- Before coding, read `docs/conventions.md` and `docs/adr/README.md`.
- Before building UI, read `docs/design.md` and check `src/components`. Every new reusable component is added to `/design` and `docs/design.md` in the same change.
- Never apply an OpenSpec change before the user has reviewed the proposal.
- No numbers computed outside `src/lib/engine`.
- Every displayed value carries provenance.
- Engine changes need Vitest tests.
- ADRs are append-only: a changed decision gets a new ADR that supersedes the old one.
- Never read `data/raw/` into context unless a task needs it.
- Vercel AI SDK: use the version pinned in `package.json` (see ADR 0006) and read its matching docs before writing AI code. Do not mix syntax from other major versions.
