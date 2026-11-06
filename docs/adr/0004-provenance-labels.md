# 0004. Provenance labels on every displayed value

- Status: accepted
- Date: 2026-11-06
- Supersedes: none

## Context

Customers will challenge numbers, so each value must show how and where it was produced.

## Decision

Every displayed value carries a method (measured, calculated, allocated, estimated) and a source (synthetic, team-made, public reference). Users can click a number to see the math.

## Consequences

UI components take values with provenance, not bare numbers. Facts need a stable id so explanations can be fetched.
