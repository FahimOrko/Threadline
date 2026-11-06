# 0001. Next.js App Router on Vercel, npm, no database

- Status: accepted
- Date: 2026-11-06
- Supersedes: none

## Context

A hackathon app needs a fast path from code to a public URL, and the data is a fixed synthetic dataset.

## Decision

Use Next.js (App Router, TypeScript) deployed on Vercel, npm as package manager, and no database.

## Consequences

Deploys are one push. Anything that needs server state (shared edits, accounts) is out of scope. Server routes exist only for AI calls.
