<p align="center">
  <img src="src/app/icon.svg" alt="Threadline logo" width="96" />
</p>

# Threadline

Threadline turns a year of Lindström workwear service into a customer value review. An account manager (KAM) can open a customer's dashboard, check where every figure comes from, and walk the customer through a short story game and report. A customer can run the same review on their own. Every number comes from one calculation engine and carries its source.

> Built for the Lindström x Since AI Hackathon 2026. All data is synthetic and the app is not audit-ready reporting.

**[Try the live app](https://lindstrom-value-review.vercel.app/)** · **[Watch the demo video](https://youtu.be/wKhfGThETrM)**

## Demo

[![Threadline demo video](https://img.youtube.com/vi/wKhfGThETrM/maxresdefault.jpg)](https://youtu.be/wKhfGThETrM)

Live app: [lindstrom-value-review.vercel.app](https://lindstrom-value-review.vercel.app/)

Open the app on a desktop browser and pick a role on the landing page: **Step in as Lindström's account manager** for the dashboard, or **See it as a customer** for the story review. The [user guide](docs/user-guide.md) walks through both.

## Features

- **Landing page** to pick a role: account manager or customer.
- **Dashboard** for the KAM: Overview, Garments and utilization, Costs, Environmental footprint, Signals and Sites, with a page per site.
- **Story review**: a short guided game that sets the comparison, the estimate level and your priorities, then a report.
- **Export** of the report data as Markdown or JSON.
- **Impact World**: the customer's impact as a picture. The Trees zone is built; more zones are coming.
- **Provenance everywhere**: every figure shows its source, with "Show math" and plain-language "i" explainers.

## Tech stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, shadcn/ui on Base UI, Recharts, Motion, Zod, Vitest. Data is static CSV turned into JSON at build time, with no database. Deployed on Vercel.

## Getting started

Prerequisites: Node.js 20.9 or newer (the minimum Next.js 16 needs; there is no `.nvmrc`) and npm.

```bash
git clone https://github.com/FahimOrko/lindstrom-value-review.git
cd lindstrom-value-review
npm install
cp .env.example .env.local   # optional, see below
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

`npm run dev` builds `data/generated/` from `data/raw/` first, so there is no extra data step.

### Environment

The app runs without any environment variables today. `.env.example` lists the three variables reserved for the AI guide, which is not built yet: `OPENROUTER_API_KEY`, `OPENROUTER_MODELS` and `AI_MAX_TOOL_STEPS`. Keep real values in `.env.local`, never in a file you commit, and never prefix them with `NEXT_PUBLIC_`.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Builds the data, then starts the dev server. |
| `npm run build` | Builds the data, then makes a production build. |
| `npm start` | Serves the production build. |
| `npm test` | Runs the Vitest suite once. |
| `npm run lint` | Runs ESLint. |
| `npm run data:build` | Turns the CSVs in `data/raw/` into JSON in `data/generated/`. Fails if a file does not match its sheet. |
| `npm run check:contrast` | Checks colour contrast of the theme tokens. |
| `npm run check:design-imports` | Checks that components are imported the way the design system expects. |

## Project structure

```
src/app/          Routes: landing, dashboard, story, world, design
src/components/   Reusable components (also shown on /design)
src/lib/engine/   The one calculation engine: every number comes from here
src/lib/story/    Story game script, report and export
src/lib/data/     Data loading and schemas
data/raw/         Source CSVs (synthetic data pack)
data/generated/   JSON built from the CSVs (not committed)
docs/             User guide, conventions, design, ADRs, runbooks
openspec/         Specs of what is built, and change proposals
tests/            Vitest tests
```

## Learn more

- [User guide](docs/user-guide.md): how to use Threadline as an account manager or a customer.
- [Conventions](docs/conventions.md): code, copy voice and testing rules.
- [Design](docs/design.md): design system and component list.
- [Decisions](docs/adr/README.md): architecture decision records.
- [OpenSpec](openspec/specs): what is built, as specs.

## Data and status

All data is synthetic. No row stands for a real customer, wearer or laundry result. The app is a prototype, not audit-ready reporting.

## License

The code is released under the [MIT License](LICENSE).

The hackathon data pack in `data/raw/` (and the JSON built from it) is not covered by this license. It is the "Lindström x Since AI Hackathon 2026 Customer Value & Sustainability Review" synthetic data pack, and it belongs to its provider.
