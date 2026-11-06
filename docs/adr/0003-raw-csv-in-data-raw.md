# 0003. Raw CSVs in data/raw/, not in docs/

- Status: accepted
- Date: 2026-11-06
- Supersedes: none

## Context

Claude Code reads docs/ as context, and the source CSVs are about 2 MB.

## Decision

Keep source CSVs in data/raw/ and generated JSON in data/generated/. Agents do not read data/raw/ unless a task needs it.

## Consequences

Context stays small. The build script is the only normal reader of data/raw/.
