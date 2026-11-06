# Switch the free model

Use when a model is slow, rate limited or down.

1. Pick free models that support tool calling on OpenRouter (IDs end in `:free`).
2. Edit `OPENROUTER_MODELS` in `.env.local`: comma-separated, best first. The list is passed to OpenRouter's `models` array or tried in order.
3. Restart `npm run dev`.
4. On Vercel, change the same variable in Project Settings > Environment Variables and redeploy.
5. If every free model is down, the rule-based observations and template story keep the demo working without AI.
