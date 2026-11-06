# 0005. All numbers computed in the engine, AI uses fact tokens and never writes digits

- Status: accepted
- Date: 2026-11-06
- Supersedes: none

## Context

A language model can invent or mis-copy numbers.

## Decision

A deterministic engine in src/lib/engine computes every number. The AI writes text with fact tokens that the app resolves to engine values, and never writes digits itself.

## Consequences

Engine changes need Vitest tests. No arithmetic on data outside src/lib/engine. Text stays correct when data changes.
