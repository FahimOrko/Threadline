# Deploy to Vercel and set environment variables

1. Push the repo to GitHub.
2. In Vercel, choose Add New > Project and import the repo. The Next.js preset is detected.
3. In Project Settings > Environment Variables add, for Production and Preview:
   - `OPENROUTER_API_KEY` (never `NEXT_PUBLIC_`)
   - `OPENROUTER_MODELS` (comma-separated, all ending in `:free`)
   - `AI_MAX_TOOL_STEPS` (3)
4. Deploy and open the Vercel URL.
5. Check the shell loads, views switch, and the role toggle survives a reload.
6. After changing env vars, redeploy; they apply to new deployments only.
