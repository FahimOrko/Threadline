# 0006. Vercel AI SDK with OpenRouter free models, version pinned, key server-only

- Status: accepted
- Date: 2026-11-06
- Supersedes: none

## Context

The AI assistant must run at no cost, and the key must never reach the browser.

## Decision

Use the Vercel AI SDK with the OpenRouter provider and free models only (OPENROUTER_MODELS, a priority list ending in :free). Cap tool steps with AI_MAX_TOOL_STEPS. All calls go through server routes. Pin the SDK version in package.json when it is added and record that version here in a new ADR if it changes.

## Consequences

Free models are rate limited (20 requests/minute), so rule-based observations and the template story must work without the AI. The key lives only in .env.local and Vercel env vars.
