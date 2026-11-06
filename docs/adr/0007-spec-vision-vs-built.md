# 0007. docs/product-spec.md is the vision, openspec/specs/ is the built truth

- Status: accepted
- Date: 2026-11-06
- Supersedes: none

## Context

Agents must not confuse planned features with built ones.

## Decision

docs/product-spec.md describes the intended product and is only edited on request. openspec/specs/ grows only when a change is archived and describes what exists.

## Consequences

Each slice is an OpenSpec change. When the spec and openspec/specs/ disagree, openspec/specs/ is what the app does.
