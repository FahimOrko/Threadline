# Lindström Customer Value Review: Product Spec

Single source of truth for the build. Since AI Hackathon 2026, Turku, 6 to 8 Nov. Solo build with Next.js, npm, Claude Code and OpenSpec.

---

## TL;DR (read this first)

- **What we build**: a web app that turns Lindström's scattered, multi-site customer data into one clear "value we created for you" story for annual steering-committee meetings.
- **Who uses it**: the Key Account Manager (KAM) prepares and presents. The customer can explore the same page during or after the meeting. A simple toggle in the header switches between the two views, no logins or permissions.
- **AI first, KAM decides**: the data is already there before the meeting. The AI analyses it, flags problems and suggests what belongs in the review. The KAM keeps, drops, edits or adds points.
- **Layout**: one app with an AI chat sidebar on the right and three switchable views: **Dashboard**, **Impact World** (3D) and **Story**.
- **The Story is the showpiece**: a game-like, visual-novel page. Low-poly scenes, characters, a dialogue box at the bottom, press Enter to move to the next line. Numbers pop in as data cards. It also exports to **PDF** and **PPTX**.
- **Every number is honest**: each value shows how it was produced (measured, calculated, allocated, estimated) and where it came from (synthetic, team-made, public reference). Click any number to see the math.
- **Money, percentages and footprint matter**: euros saved, percentage improvements, and the carbon footprint of the service including Lindström's deliveries to the customer.
- **Headline impact numbers**: water saved, CO2e avoided, trees (illustrative), garments not produced, textile waste diverted and everyday equivalents (bathtubs, car km), with emphasis per industry. Focus is the workwear garment sector.
- **AI runs on OpenRouter free models** via the Vercel AI SDK. The API key lives only on the server (Vercel env vars), with rate limiting and a spending limit.
- **AI never invents numbers**: a deterministic engine computes everything. The AI only explains and narrates, using data tokens that update live when data changes.
- **No database**: base data is static JSON generated from CSVs at build time. User edits live in the browser as a small overlay on top of the base data.
- **Agents keep project memory**: append-only numbered ADRs, a conventions file and runbooks in `docs/`. Agents read them before coding and add to them as they build.
- **Build order**: manual scaffolding first, then one vertical slice at a time through OpenSpec. `docs/product-spec.md` is the vision, `openspec/specs/` is the truth of what is built.

---

## Table of contents

- Purpose
- Users and the role toggle
- The KAM workflow (AI suggests, KAM decides)
- Demo story
- App layout and views
- Scope and slices
- Data
- Provenance model
- Calculation engine
- KPI catalogue (operational, money, percentages, footprint)
- Garment health signals
- Observations and suggestions
- Personalization
- Impact World (3D view)
- Story view (visual-novel player)
- Exports (PDF and PPTX)
- AI assistant (sidebar)
- Project knowledge: ADRs, conventions, runbooks
- OpenSpec workflow
- Storage (no database)
- Project setup and folder structure (Slice 0)
- Tech stack
- Judging criteria mapping
- Submission checklist
- Open questions for Lindström

---

## Purpose

> **In short:** Lindström's value is real but hidden in site-level reports. We consolidate it into one customer-level story the KAM can present and the customer can trust.

Lindström customers are large multi-site B2B companies. Today their data sits in individual site reports (deliveries, repairs, washing, emissions). Senior decision-makers want one picture: what value did we get, how does it compare to the alternatives, and what should we improve next year.

Guiding principle: **transparent, defensible value beats the biggest claimed savings.** The judges explicitly reward credibility over big numbers.

---

## Users and the role toggle

> **In short:** Two audiences, one app. A toggle in the header switches between KAM view and customer view. No auth, no permissions, it just hides KAM-only things.

- **KAM (primary)**
  - Reviews the AI's suggestions, curates the review, sets customer priorities, adds account knowledge, edits data, generates and exports the story
- **Customer decision-maker**
  - Sees the same numbers and provenance
  - Can fully interact: switch views, drill into sites, chat with the assistant ("how did you calculate the water saving?"), play the story and pick story choices, mark next-year actions as "agree" or "discuss"
- **Toggle**
  - One state flag (`role: "kam" | "customer"`) in the header, persisted in the browser
- **Hidden in customer view**
  - KAM notes and priority settings
  - Sales opportunity / upsell suggestions
  - Suggestions the KAM dropped
  - Curation controls and the data control panel

---

## The KAM workflow (AI suggests, KAM decides)

> **In short:** When the KAM opens a customer, the AI has already analysed the data and proposes a review: flagged issues, value highlights and a storyline. The KAM curates it, then generates the story.

- **Automatic pre-analysis** when a customer is opened
  - The engine computes facts and garment health signals
  - Rules turn signals into observation candidates (risks, value highlights, data gaps)
  - The AI ranks them by industry and customer priorities, phrases them in meeting language and proposes a storyline (chapter order and emphasis)
- **Review Prep panel** (KAM view)
  - A list titled "Suggested for this review", each item showing: what was found, why (linked facts), severity, audience (customer / KAM only)
  - Actions per item: keep, drop, pin to top, edit wording, add a KAM note
  - KAM can add their own points in free text ("they are worried about water costs next year"), and the AI turns them into story content
  - KAM can state priorities in chat or with chips, which re-ranks the suggestions
- **Generate story**
  - Uses only the kept items, creates a new Story page
- **Customer view**
  - Shows only the curated result

---

## Demo story

> **In short:** The 3-minute pitch. Everything not in it is later scope.

- KAM opens the app, selects NorthStar Foods Group (Food & Beverage, 24 sites)
- Dashboard consolidates all sites. The Review Prep panel already shows AI suggestions: a hygiene-risk plant, a hi-vis tear spike, strong water savings, an over-allocated site
- KAM types in the sidebar "water and hygiene matter most to them", and the suggestions and dashboard re-rank
- KAM drops one suggestion, edits another, pins the water story
- KAM drills into the flagged production plant to show the garment signals
- Switch to Impact World: water tanks compare Lindström vs local laundry, toggle to home washing and everything re-animates
- KAM clicks Generate story, and a new visual-novel page opens. Press Enter through the scenes, numbers pop in as data cards
- KAM edits one value in the data control panel, the story numbers update live
- Toggle to customer view. The customer asks the sidebar "how did you calculate the water saving?" and gets the formula and assumption IDs
- KAM exports to PDF and PPTX

---

## App layout and views

> **In short:** Header on top, active view in the middle, AI chat sidebar on the right. Three views share the same selected customer, period, baseline and priorities.

- **Header**
  - Customer picker, reporting period, comparison baseline (local laundry / home washing / in-house), sensitivity (low / base / high)
  - View switcher: Dashboard, Impact World, Story
  - KAM / Customer toggle
- **Right sidebar: AI chat**
  - Collapsible, always available
  - Context-aware: knows the current view, selected site, current story scene
  - Same assistant for KAM and customer, behaviour adjusts to the role
- **Views**
  - **Dashboard**: customer-level KPIs, money and percentage cards, footprint, site table and drill-down, garment signals, Review Prep panel (KAM) or curated insights (customer)
  - **Impact World**: 3D low-poly world with clickable zones
  - **Story**: list of generated stories plus a Generate button (KAM), and the visual-novel player
- **Other pages**: Methodology, Data readiness

Routes (proposal):

- `/dashboard`, `/dashboard/sites/[siteId]`
- `/impact`
- `/story`, `/story/[storyId]`, `/story/[storyId]/print`
- `/methodology`, `/data-readiness`
- `/api/chat`, `/api/story`

---

## Scope and slices

> **In short:** Slice 0 is setup. Then one end-to-end slice at a time. Story comes before Impact World because the exported review is a mandatory deliverable.

### MVP slices (in build order)

- **Slice 0: project setup** (see the setup section)
- **Slice 1: data pipeline plus one KPI end to end**
  - CSV to validated JSON, engine, one KPI card on the dashboard with provenance chip and "show math"
  - Why first: proves the whole pipeline, every later slice reuses it
- **Slice 2: core dashboard**
  - Core KPIs, money and percentage cards, footprint including delivery, customer overview and site drill-down
- **Slice 3: baseline and sensitivity**
  - Baseline selector and low/base/high, all values recompute
- **Slice 4: garment signals and observation rules**
  - Signals plus at least 3 rule-based observations
- **Slice 5: AI chat sidebar**
  - AI assistant with tool calls into the engine, context-aware
- **Slice 6: Review Prep**
  - AI pre-analysis, suggestions list, KAM curation, priorities
- **Slice 7: Story player**
  - Story generation, data-bound tokens, visual-novel player
- **Slice 8: data overlay and control panel**
  - Edits stored in the browser, live updates across views and the story
- **Slice 9: exports**
  - PDF (print route) and PPTX (pptxgenjs) from the story JSON
- **Slice 10: Impact World**
  - Tanks first, then the other zones
- **Slice 11: Methodology and Data readiness pages**

### Later scope

- Month replay / time-skip simulation with alerts into a draft-email inbox
- Dummy scenario injection presets (if not done in Slice 8)
- Extended KPI catalogue
- Site map of Finland coloured by risk
- Prior-year dummy data for year-over-year trends
- More customers and industries

### Non-goals

- Auth, permissions, real multi-user sharing
- Production dashboard or enterprise customer master data
- Audited sustainability reporting or compliance advice
- Person-level tracking or notifying individual employees
- Real Lindström data or integrations

---

## Data

> **In short:** 19 sheets from the synthetic Excel pack, already converted to UTF-8 CSVs in `data/raw/`. A build script turns them into validated JSON. A few data-quality issues were found and must be shown, not hidden.

### Source files (`data/raw/`)

| File                        | What it holds                                            | Rows   |
| --------------------------- | -------------------------------------------------------- | ------ |
| customers.csv               | 3 fictional customers, industry, priority topics         | 3      |
| sites.csv                   | Delivery sites, customer hierarchy, site type, laundry   | 34     |
| products.csv                | 6 garment types, weight, footprint, purchase cost        | 6      |
| laundries.csv               | 4 synthetic laundries                                    | 4      |
| industry_priorities.csv     | What each industry cares about most                      | 9      |
| service_activity.csv        | Monthly wearers, allocation, scans, washes, kg, requests | 1,248  |
| repairs.csv                 | Monthly repairs by type, postponed replacements          | 3,635  |
| service_cycles.csv          | Per-garment scan cycles with timestamps and on-time flag | 16,415 |
| laundry_resources.csv       | Laundry water, energy, process and delivery emissions    | 48     |
| waste_circularity.csv       | Recycling, reuse, energy recovery, incineration          | 48     |
| baselines.csv               | Local laundry, home washing, in-house factors            | 3      |
| customer_impacts.csv        | Allocated footprint and savings vs local laundry         | 1,248  |
| assumptions.csv             | Assumption registry A001 to A008                         | 8      |
| data_quality.csv            | Confidence per dataset                                   | 7      |
| suggested_prompts.csv       | Example KAM and customer prompts                         | 6      |
| sample_output.csv           | Reference values to unit-test the engine                 | 13     |
| data_dictionary.csv         | Field definitions                                        | 139    |
| quick_start.csv, readme.csv | Pack documentation                                       | small  |

All data is 2025, monthly, 100% synthetic.

### Pipeline

- `npm run data:build` parses CSVs, validates with Zod schemas, writes JSON to `data/generated/`
- Heavy work happens at build time: the 16k service cycles are reduced to per-site garment signals and data-quality counts
  - Why: the browser never downloads 2 MB of raw scans, the dashboard stays fast, and user edits happen at the level a KAM actually edits (site, month, product)
- Unmapped or invalid rows are counted and written to a data-quality report, never silently dropped
- Behind a `DataSource` adapter interface, so a future Tableau, Power BI or eLindström export only needs a new adapter

### Data-quality findings (show these in the app)

- About **1,107 out-of-order scans** in service_cycles (cycle number order disagrees with timestamps). Handle by sorting on timestamp and report the count.
- Synthetic garment histories stop cycling long before year end (mean about 134 days idle at 31 Dec), so "days idle at period end" is unreliable. Use gaps between cycles instead.
- `washing_pct` is mostly above 100% (mean about 197%). Definition unclear, do not use it in claims until Lindström confirms.
- Active wearers repeat across product rows. Summing them double-counts people.
- No delivery route kilometres in the pack, although Lindström mentioned having them. Listed as a data gap.
- The brief mentions a Public_References sheet, but it is not in the pack.

### Dummy data policy

- Team-made data is allowed but labelled `SYNTHETIC_TEAM`
- Seeded, reproducible generator script
- Uses: clean demo scenarios (hygiene-risk plant, hi-vis tear spike), editable money assumptions (rental fee per piece), later prior-year data

---

## Provenance model

> **In short:** Every number carries two labels plus its formula. This is worth 20% of the score.

- **Method**: MEASURED, CALCULATED, ALLOCATED, ESTIMATED, ILLUSTRATIVE, MANUAL_EDIT
- **Source**: SYNTHETIC, SYNTHETIC_TEAM, PUBLIC_REFERENCE, ASSUMPTION
- Plus assumption IDs, confidence and the formula
- "Show math" on any number: formula, inputs, assumption IDs, baseline, low/base/high range
- Applies everywhere: dashboard, Impact World panels, story data cards, chat answers, exports

---

## Calculation engine

> **In short:** Pure TypeScript functions that turn data into "facts". Everything else only reads facts. Unit tested against sample_output.csv.

- Output is a list of facts: `{ id, label, value, unit, method, source, assumptionIds, confidence, formula, scope, period, baseline }`
- Runs in the browser (for live updates with user edits) and on the server (for AI tools), same code
- Environmental savings computed for any baseline: `washed_kg x (baseline factor - laundry factor)` with low/base/high. Do not rely on the precomputed "vs local" columns.
- Tests in Vitest, checked against the reference values in sample_output.csv

---

## KPI catalogue

> **In short:** Core KPIs for the MVP, grouped into operational, money, percentages and footprint. Money uses editable assumptions where the pack has no prices.

### Operational (core)

| KPI                     | Source           | Rule                                                       | Method     |
| ----------------------- | ---------------- | ---------------------------------------------------------- | ---------- |
| Delivery sites          | sites            | count per customer                                         | MEASURED   |
| Active wearers          | service_activity | max across product rows per site and month, then sum sites | CALCULATED |
| Garments in circulation | service_activity | allocated_pieces, latest month                             | MEASURED   |
| Repairs                 | repairs          | sum repair_count                                           | MEASURED   |
| Replacements postponed  | repairs          | 1 repair = 1 postponed replacement (A002)                  | ESTIMATED  |
| Service requests        | service_activity | sum, also per 100 wearers                                  | MEASURED   |

### Money (core)

| KPI                       | Rule                                                            | Method                    |
| ------------------------- | --------------------------------------------------------------- | ------------------------- |
| Avoided purchase cost     | replacements postponed x synthetic purchase cost                | ESTIMATED                 |
| Cost of unused allocation | unused pieces x rental fee per piece (editable team assumption) | ESTIMATED, SYNTHETIC_TEAM |
| Garment value kept in use | allocated pieces x purchase cost                                | ILLUSTRATIVE              |
| Admin time saved (later)  | editable hours x editable hourly rate                           | ESTIMATED, ASSUMPTION     |

### Percentages (core)

- Water, energy and emissions saved vs selected baseline, in %
- Garment utilization (active_assets_scanned / allocated_pieces)
- On-time cycle rate
- Recycling and reuse share of textile waste
- Repair rate by product
- Share of garments in a dormant tier
- Delivery share of total service emissions

### Footprint (core)

- **Service footprint**: allocated process emissions plus allocated delivery emissions, total, per washed kg, per wearer
- **Delivery footprint**: Lindström's shared delivery routes to the customer's sites
  - allocated_delivery_kgco2e, delivery share of total, compared with the baseline delivery factor
  - Honesty note: the home-washing baseline has zero delivery emissions, so delivery alone can look worse than home washing. Always show the net comparison next to it. This builds credibility.
  - Route kilometres not in the pack, listed as a data gap
- **Handprint**: reduction vs selected baseline (water, energy, emissions, avoided products)

### Headline impact metrics

> **In short:** The big numbers people remember. Direct values come from the engine, equivalences always show their factor and source and carry the ILLUSTRATIVE label.

| Metric                 | Rule                                                                                                                            | Method                |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| Water saved            | engine baseline comparison (litres and %)                                                                                       | ALLOCATED + ESTIMATED |
| CO2e avoided           | engine baseline comparison (process + delivery)                                                                                 | ALLOCATED + ESTIMATED |
| Energy saved           | engine baseline comparison (kWh and %)                                                                                          | ALLOCATED + ESTIMATED |
| Garments not produced  | replacements postponed (A002)                                                                                                   | ESTIMATED             |
| Textile waste diverted | allocated textile waste kept out of mixed waste (recycling + reuse + energy recovery) vs 100% mixed-waste baseline (A003, A004) | ALLOCATED + ESTIMATED |
| Recycled kg            | allocated recycling kg                                                                                                          | ALLOCATED             |
| Trees equivalent       | CO2e avoided / CO2 absorbed per tree per year (factor with source)                                                              | ILLUSTRATIVE          |
| Bathtubs equivalent    | water saved / litres per bathtub (factor with source)                                                                           | ILLUSTRATIVE          |
| Car km equivalent      | CO2e avoided / kg CO2e per car km (factor with source)                                                                          | ILLUSTRATIVE          |

- Equivalence factors live in one config file with their source and are listed on the Methodology page
- **Sector emphasis** (which headline numbers lead, based on the customer's industry)
  - Food & Beverage: water saved, hygiene-ready garment availability (share of garments not in a dormant tier), dormant garment share
  - Manufacturing: garments not produced, protective-wear repairs (Hi-Vis, Coveralls), cost of unused allocation
  - Healthcare: on-time cycle rate, traceability (share of allocated garments seen in scans)
- KAM priorities can override the sector default

### Later

- Energy per washed kg trend, washed kg trend, garments per wearer, average cycle hours, avoided product CO2e by product

---

## Garment health signals

> **In short:** Seven signals that turn garment data into next-year actions, not just dormancy. All thresholds are labelled assumptions and editable.

### Dormant / hoarded garments (hygiene risk)

- Source: service_cycles, gaps between consecutive pickups (sorted by timestamp)
- Synthetic distribution: median about 50 days, 90th percentile about 90, 95th about 108, max about 185

| Context                                     | Watch      | Risk       | Critical   |
| ------------------------------------------- | ---------- | ---------- | ---------- |
| Food & Beverage, Healthcare, Hospital sites | > 60 days  | > 90 days  | > 120 days |
| Manufacturing, Production Plant             | > 90 days  | > 120 days | > 150 days |
| Office, Distribution, Service Center        | > 120 days | > 150 days | n/a        |

- Reported per site as counts and shares, never per person
- Action: notify the site manager

### Wear and tear hotspots

- Source: repairs (zipper, button, seam stitching, darning/patching, other accessories)
- Hi-Vis Jacket (about 1.14%) and Protective Coverall (about 1.0%) have the highest repair rates
- Site repair spikes vs its own history or peer sites
- Repair mix: lots of darning/patching suggests an abrasive environment, lots of zipper repairs suggests a design weakness
- Hi-vis and protective wear repairs framed as safety discussion points, not compliance advice
- Actions: heavier-duty product, feedback to Lindström's design loop

### Missing / unreturned garments

- allocated_pieces minus active_assets_scanned. Action: inventory check, return campaign

### Over-allocation

- Low utilization (synthetic range about 71% to 96%). Action: rebalance between sites or reduce allocation

### Shortage risk

- High utilization plus rising washed kg or service requests. Action: increase allocation (top priority for food and healthcare)

### Late cycles

- performance_flag and cycle_hours by site and laundry. Also a positive trust story when on-time is high

### Service request hotspots

- Requests per 100 wearers by site. Action: root-cause discussion

---

## Observations and suggestions

> **In short:** Rules detect, the AI phrases and ranks, KAM curates. If the API fails, raw rule text still works.

- Rules emit `{ id, type (risk / value / gap / opportunity), severity, scope, factIds, audience, suggestedAction }`
- The AI rewrites them into meeting language and steering-committee questions, and proposes the storyline
- Ranking: severity x industry priority x KAM priority
- `opportunity` (upsell) items are KAM-only
- Demo minimum: at least 3 observations, including one value highlight, one risk, one data gap
- Why this split: reproducible for judges, readable for customers, safe if the API fails mid-demo

---

## Personalization

> **In short:** Priorities come from the industry by default and the KAM can override them in chat or with chips. They reorder everything.

- Chips: water, cost, emissions, circularity, service, hygiene
- Free text in the sidebar, the AI maps it to a priority vector, KAM confirms
- Effects: suggestion ranking, dashboard card order, story chapter order and emphasis, Impact World camera focus

---

## Impact World (3D view)

> **In short:** A clickable low-poly 3D world where each zone visualises one value story. Built last among the core views.

- React Three Fiber and drei, built from primitives, flat shading, soft shadows, same muted palette as the Story
- Click a zone: panel with value, provenance chips, formula, baseline
- Baseline toggle re-animates all zones
- Zones
  - **Water tanks**: Lindström vs selected baseline, levels ease to new values
  - **"Never made" jacket pile and factory**: postponed replacements grow the pile, factory smoke reduces
  - **Forest**: trees drop from the sky for CO2e avoided, labelled ILLUSTRATIVE with the CO2-per-tree factor and source shown
  - **Recycling yard**: bins sized by recycling, reuse, energy recovery, incineration
  - **Delivery route**: a truck loop sized by delivery emissions
- Performance: trees as one InstancedMesh, capped at about 300, fixed legend scale

---

## Story view (visual-novel player)

> **In short:** The review becomes a short game-like story: low-poly scenes, two characters talking, a dialogue box at the bottom, Enter to continue. Numbers appear as animated data cards bound to live data.

### Look and feel

- Inspired by narrative games: layered low-poly silhouette backgrounds, warm muted palette, flat-shaded characters standing on the left and right
- Dialogue box at the bottom, cream paper style, name tag on the top-left edge of the box, typewriter text reveal
- Orange "…" menu button at the bottom-right of the box
- Speaking character is highlighted, the other is dimmed

### Cast (fictional)

- **Lindström guide** (left): the narrator, presents what Lindström did
- **Customer character** (right): asks the questions a customer would ask ("So what did that actually save us?"), which makes the data feel like a conversation
- Names and looks are placeholders, generated per customer industry later if time allows

### Controls

- Enter, Space or click: finish the current line, then go to the next
- Left arrow or Backspace: previous line
- "…" menu: chapter list, show math for the current line, ask AI about this scene (opens the sidebar with the scene's facts), auto-play, export
- Chapter progress pips at the top ("Chapter 3 of 7: Water and carbon")
- Respects reduced-motion settings

### Data moments

- When a line uses a fact token, a data card animates into the upper part of the scene: count-up number, unit, provenance chip, small comparison bar
- Big moments get a full-scene visual: water tanks filling, jacket pile growing, reused from Impact World or simple SVG

### Gamified choices

- At the end of a chapter: 2 or 3 choice buttons such as "Show me the risks", "Go deeper on water", "Continue"
- Lets the customer explore after the meeting
- Final chapter "Next year's plan": each proposed action can be marked "agree" or "discuss" by the customer, saved in the browser for the KAM

### Default chapters (reordered by priorities and KAM curation)

- Cover: customer, period, baseline
- Your year in numbers
- What we kept out of the bin (repairs, circularity)
- Water and carbon vs [baseline] (including delivery footprint)
- What it means in euros
- Where we see risk (garment signals)
- Next year's plan (curated actions and steering questions)
- How we calculated this (methodology, assumptions, limitations)

### Data binding

- The AI never writes digits. It writes lines with tokens: `We repaired {{fact:repairs_total}} garments, postponing {{fact:replacements_postponed}} purchases.`
- The player resolves tokens live from the engine, so numbers update instantly when data changes
- Each chapter stores the fact IDs it depends on. Only when meaning changes (sign flip, more than 10% change, severity tier change) is that chapter marked stale and regenerated
- Validator rejects AI text with raw numbers outside tokens, with one retry
- Deterministic template story as a fallback if the AI fails

### Story JSON (shape)

- `Story { id, customerId, period, baseline, priorities, createdAt, factsHash, chapters[] }`
- `Chapter { id, title, background, dependsOn: factId[], scenes[], choices? }`
- `Scene { id, speaker, line (tokenized), dataCards: factId[], visual? }`
- Validated with Zod on the server and when loaded

---

## Exports (PDF and PPTX)

> **In short:** Both exports are generated from the same story JSON. PDF is mandatory for the submission, PPTX is what Lindström prefers to edit.

- **PDF**: `/story/[id]/print` route with a print stylesheet, one chapter per page (scene, key lines, data cards with provenance), saved via the browser print dialog
- **PPTX**: pptxgenjs in the browser, one slide per chapter with data cards, dialogue lines in the speaker notes so the KAM can present from them, fully editable
- Both keep the provenance labels and a final methodology page

---

## AI assistant (sidebar)

> **In short:** The assistant answers questions using tools that call the engine. It only states numbers returned by tools and always says how a number was produced. It runs on OpenRouter free models through the Vercel AI SDK.

### Provider and SDK

- **Vercel AI SDK** with the OpenRouter provider
  - Streaming chat sidebar with the SDK's chat hook
  - Tools defined with Zod schemas, the SDK runs the tool-call loop
  - Story JSON generated as a structured object validated against the Story Zod schema
  - Version pinned in package.json and recorded in an ADR, with a link to the matching docs in CLAUDE.md, so agents do not mix syntax from other major versions
- **OpenRouter free models only**, no paid fallback
  - Model ID in an env var (`OPENROUTER_MODEL`) so a different free model can be switched in seconds if one is slow or down
  - Pick models that support tool calling
  - Free models have rate limits and can be unavailable. Rule-based observations and the template story keep the demo working without the AI.

### Security

- `OPENROUTER_API_KEY` only in `.env.local` and Vercel environment variables, never prefixed with `NEXT_PUBLIC_`, never committed, never pasted into chats
- All AI calls go through server routes (`/api/chat`, `/api/story`). The browser never talks to OpenRouter directly.
- Simple rate limiting on both routes (per IP, in memory is enough for the hackathon)
- Spending limit set on the OpenRouter key

### Requests and tools

- Each chat request sends: messages, view context (customer, period, baseline, view, site, scene) and the user's data overlay, so the server computes the same numbers the user sees
- Tools
  - `getCustomerSummary(customerId, period, baseline)`
  - `getSiteRanking(customerId, metric)`
  - `getBaselineComparison(customerId, baseline, sensitivity)`
  - `getGarmentSignals(customerId, siteId?)`
  - `explainFact(factId)` returns formula, inputs and assumptions
- Rules in the system prompt: only numbers from tools, mention method and source, no legal or compliance advice, no upsell content in customer view
- `/api/story` uses the same setup for storyline suggestions, observation phrasing and story writing

---

## Storage (no database)

> **In short:** Base data is static JSON shipped with the app. User changes are stored in the browser as a small overlay that sits on top of the base data. Reset means clearing the overlay.

- **Base data**: `data/generated/*.json`, committed, read-only, deployed with the app
- **Overlay in the browser** (Zustand with persist, localStorage)
  - `edits`: value changes keyed by table, row key and field, each labelled MANUAL_EDIT
  - `scenarios`: injected dummy scenarios
  - `curation`: kept, dropped, pinned and edited suggestions, KAM notes, priorities
  - `stories`: generated story JSON
  - `customerResponses`: agree / discuss marks on next-year actions
  - `ui`: role toggle, selected customer, baseline, sensitivity
- Effective data = base data plus overlay, recomputed by the engine
- Why an overlay instead of a full copy
  - Base data updates never get overwritten by stale browser copies
  - Reset is one action
  - Every edit is visible and labelled, which helps credibility
- Export and import the overlay as a JSON file
  - Back up the demo state before pitching, or move it to another browser
- Known limit: stories are not shareable across devices without a database. PDF, PPTX and overlay export cover the hackathon. A database is later scope.

---

## Project knowledge: ADRs, conventions, runbooks

> **In short:** Three kinds of shared memory in `docs/` that agents read before coding and add to while building. ADRs are append-only.

### What goes where

- **ADR** (`docs/adr/`): a decision that affects more than one slice or is hard to reverse
- **Conventions** (`docs/conventions.md`): how code is written (naming, folders, provenance, testing, where numbers may be computed)
- **Runbooks** (`docs/runbooks/`): step-by-step procedures (rebuild data, deploy, reset or back up demo state, switch the free model, rotate the API key)

### ADR rules

- One file per decision, numbered: `docs/adr/0001-short-title.md`
- `docs/adr/README.md` is the index: number, title, status, one-line summary. Agents read the index first and open only relevant ADRs.
  - Why: one growing file would be read in full every time and waste tokens
- **Append-only**: an accepted ADR is never edited. A changed decision gets a new ADR that says "Supersedes 0003", and the index marks 0003 as superseded.
- Template: Title, Status (accepted / superseded), Date, Context, Decision, Consequences, Supersedes

### Seed ADRs (written in Slice 0 from decisions already made)

- 0001 Next.js App Router on Vercel, npm, no database
- 0002 Base data as static JSON plus browser overlay for edits
- 0003 Raw CSVs in `data/raw/`, not in `docs/`
- 0004 Provenance labels on every displayed value
- 0005 All numbers computed in the engine, AI uses fact tokens and never writes digits
- 0006 Vercel AI SDK with OpenRouter free models, version pinned, key server-only
- 0007 `docs/product-spec.md` is the vision, `openspec/specs/` is the built truth

### Seed runbooks (Slice 0)

- Rebuild data from CSVs
- Deploy to Vercel and set environment variables
- Switch the free model
- Back up, restore and reset demo state (overlay export and import)

### How agents use them

- CLAUDE.md rule: before coding, read `docs/conventions.md` and `docs/adr/README.md`
- Every OpenSpec task list ends with: "Add an ADR, convention or runbook if this change needs one, and update the ADR index"
- A new convention discovered during a slice is added to `docs/conventions.md` in the same change

---

## OpenSpec workflow

> **In short:** OpenSpec lives inside the app repo as a folder of markdown. Each slice is one OpenSpec change: explore, propose, apply, archive.

- `openspec/specs/`: what the app currently does, grows only when a slice is archived
- `openspec/changes/<slice>/`: proposal, design, tasks and spec changes for the slice in progress
- Per slice (command names depend on the OpenSpec version)
  - Explore: think the slice through, reading `docs/product-spec.md` and the ADR index
  - Propose: create the change folder
  - Apply: Claude Code implements the tasks in `src/`
  - Archive: spec changes merge into `openspec/specs/`
- Why two spec places: the agent never confuses planned with built

---

## Project setup and folder structure (Slice 0)

> **In short:** Scaffolding is done by hand. OpenSpec starts with the app shell, the first thing with real behaviour. The empty shell is deployed to Vercel in Slice 0.

### Where things go

- `docs/product-spec.md`: this file, the vision
- `docs/adr/`, `docs/conventions.md`, `docs/runbooks/`: project knowledge
- `data/raw/*.csv`: source data
  - Why not in `docs/`: Claude Code reads `docs/` as context, and a 2 MB CSV there would waste tokens on every read
- `data/generated/*.json`: output of the build script

### Folder structure

```
/
├── CLAUDE.md
├── docs/
│   ├── product-spec.md
│   ├── conventions.md
│   ├── adr/            # 0001-*.md ... plus README.md index
│   └── runbooks/
├── data/
│   ├── raw/            # CSVs from the Excel pack
│   └── generated/      # JSON from npm run data:build
├── scripts/
│   └── build-data.ts
├── openspec/
├── src/
│   ├── app/            # routes: dashboard, impact, story, methodology, api
│   ├── components/     # ui (shadcn), dashboard, impact, story, chat
│   ├── lib/
│   │   ├── data/       # DataSource adapter, Zod schemas, overlay merge
│   │   ├── engine/     # facts, KPIs, baselines, garment signals, equivalences
│   │   ├── observations/
│   │   ├── story/      # schema, token resolver, validator, exports
│   │   └── ai/         # OpenRouter client, tools, prompts, rate limit
│   └── store/          # Zustand store with persist
└── tests/
```

### Manual steps (no OpenSpec)

- `npx create-next-app@latest` in an empty folder: TypeScript, App Router, ESLint, Tailwind, `src/` directory, npm
  - Why first: create-next-app complains if the folder already has files
- `npx shadcn@latest init`
- `git init` and a first commit
- Copy in `docs/product-spec.md` and `data/raw/`
- `openspec init`, choose Claude Code as the tool
- Create CLAUDE.md with the core rules
  - `docs/product-spec.md` is the vision, `openspec/specs/` is what is built
  - Read `docs/conventions.md` and `docs/adr/README.md` before coding
  - No numbers computed outside `src/lib/engine`
  - Every displayed value carries provenance
  - Engine changes need Vitest tests
  - ADRs are append-only
  - Never read `data/raw/` into context unless a task needs it
  - Pinned Vercel AI SDK version and its docs link

### Slice 0 OpenSpec change: app shell

- Seed ADRs 0001 to 0007, the ADR index, `docs/conventions.md` and the seed runbooks
- Base dependencies: zod, zustand, papaparse, tsx and vitest (dev). Add others (recharts, three, framer-motion, AI SDK, pptxgenjs) in the slice that needs them
- npm scripts: `data:build`, `test`, `dev`, `build`
- `.env.example` with `OPENROUTER_API_KEY` and `OPENROUTER_MODEL`, real values only in `.env.local` and Vercel
- App shell with shadcn components: header (customer picker, baseline, toggle placeholders), view switcher, empty collapsible sidebar, empty view pages
- Zustand store with `role` and persist working
- Link the repo to Vercel and deploy the empty shell
  - Why now: build and env problems show up on minute 30, not at midnight before the pitch

### Done when

- `npm run dev` shows the shell with working view switching and role toggle
- The toggle survives a page reload
- The Vercel URL shows the same shell
- ADR index, conventions and runbooks exist and CLAUDE.md points to them

---

## Tech stack

> **In short:** Next.js on Vercel, TypeScript everywhere, shadcn/ui, Vercel AI SDK on OpenRouter, no database.

- Next.js (App Router), TypeScript, npm, Tailwind, shadcn/ui
- Zod (validation), Zustand with persist (state and overlay), papaparse (CSV in the build script)
- Recharts (charts), React Three Fiber and drei (3D), Framer Motion (story animations)
- Vercel AI SDK with the OpenRouter provider, free models (AI)
- pptxgenjs (PPTX), print CSS (PDF)
- Vitest (engine tests), tsx (scripts)

---

## Judging criteria mapping

> **In short:** Every major feature maps to a scoring criterion.

| Criterion                    | Weight | Covered by                                                                   |
| ---------------------------- | ------ | ---------------------------------------------------------------------------- |
| Customer and business value  | 25%    | Story, AI suggestions, garment actions, money KPIs                           |
| Feasibility and completeness | 20%    | End-to-end slices, aggregation, drill-down, PDF and PPTX                     |
| Sustainability credibility   | 20%    | Provenance, baseline selector, sensitivity, show math, delivery honesty note |
| Data handling and logic      | 15%    | Adapter, validation, fact model, data-quality findings, tests                |
| Dynamic usability            | 10%    | Priorities, sidebar assistant, role toggle, story choices, Impact World      |
| Scalability                  | 10%    | DataSource adapter, data-readiness page, overlay design                      |

---

## Submission checklist

> **In short:** What the brief requires us to hand in.

- Working interactive dashboard for a fictional multi-site customer
- Customer-ready PDF or PowerPoint review (we deliver both)
- Personalization shown for at least two priorities
- At least three observations or recommendations
- Short pitch and demo
- Methodology note (baselines, sources, footprint and handprint logic, assumptions, uncertainty, limitations)
- Data-readiness note (prototype fields mapped to future Lindström sources, gaps like customer hierarchy, site mapping, route km)
- Repository with run instructions
- Synthetic and estimated values clearly separated from public references

---

## Open questions for Lindström

> **In short:** Ask Angad these before building on the related assumptions.

- What does `washing_pct` measure, and why is it mostly above 100%?
- Expected wash frequency per garment type in food and healthcare (replaces our dormancy thresholds)
- A typical weekly rental fee per piece we can use as an illustrative assumption
- Is a CO2-per-tree illustration acceptable if labelled illustrative with a source? Same for bathtub and car km equivalents.
- Can we get average route kilometres per customer, even as a synthetic example?
- Which KPIs typically appear in contracts or procurement reviews?
