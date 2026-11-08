// The story choices game (ADR 0021): scenes, beats and dialogue as plain data, and the URL helpers around them.
// It computes nothing. Every number a character says is a `{{fact:id}}` token resolved from engine Facts (ADR 0005), and
// every move sets one existing lever (`?customer=`, `?baseline=`, `?sensitivity=`, `?priorities=`).
import { resolveCustomer } from "@/lib/customer";
import type { AppData } from "@/lib/data/schemas";
import { baselineShortName, factDelta, operationalSiteRows, type Fact, type FactDelta, type Observation, type Sensitivity } from "@/lib/engine";
import { PRIORITIES, SENSITIVITY_DESCRIPTION, SENSITIVITY_LABEL, resolveBaseline, resolvePriorities, resolveSensitivity, type Priority, type View } from "@/lib/selection";
import { DEFAULT_BASELINE_ID } from "@/lib/data/schemas";
import { buildStory, resolveLine } from "./index";

export const GAME_PATH = "/story/game";
export const STORY_PATH = "/story";

/** The Impact World route (ADR 0031). */
export const IMPACT_WORLD_HREF = "/world";

type Param = string | string[] | undefined;
export type Params = Record<string, Param>;
const first = (p: Param) => (Array.isArray(p) ? p[0] : p);

export type Speaker = "kam" | "ops";
export type Line = { speaker: Speaker; text: string };
export type Lever = "customer" | "baseline" | "sensitivity" | "priorities";
export type Setting = "meeting-room" | "plant-floor" | "sustainability-office";
export const SETTING_LABEL: Record<Setting, string> = { "meeting-room": "Meeting room", "plant-floor": "Plant floor", "sustainability-office": "Sustainability office" };

/** What a conditional line asks of the data. Plain data, evaluated by `holds`; no condition lives in a component. */
export type Cond =
  | { obs: string } // a Slice 5 observation fired for the customer
  | { factNull: string } // a Fact needs input
  | { data: "largestSite" | "zeroDelivery" | "spreadUnset" } // a plain-word or yes/no value derived from existing data, never a number
  | { level: Sensitivity }; // the chosen estimate level

/** One spoken slot: the first rule whose condition holds speaks, otherwise the fallback. A fixed line is a slot with no rules. */
export type Slot = { speaker: Speaker; rules?: { when: Cond; text: string }[]; fallback: string };
const say = (speaker: Speaker, fallback: string): Slot => ({ speaker, fallback });

export type SceneId = "customer" | "baseline" | "sensitivity" | "priority";
export type Scene = {
  id: SceneId;
  lever: Lever;
  setting: Setting;
  /** Short name for the path strip and the recap. */
  name: string;
  intro: Line[];
  /** Before the question: what this lever is and why it matters for this customer. */
  explain: Slot[];
  /** The KAM's question; the choice buttons follow it. */
  question: string;
  /** The ops lead's reaction after a choice. */
  react: string;
  /** The KAM's answer, shown with the consequence card. */
  answer: string;
  /** After the answer: what moved, in which direction, and what it says about the customer's year. */
  meaning: Slot[];
  /** Limits the card to these Fact ids (a Fact kept at "Needs input" stays listed). Without it, every Fact that changed is listed. */
  cards?: string[];
};

// Templates: `{{fact:id}}` for numbers; `{comparison}`, `{estimate}`, `{company}`, `{chapter}`, `{lead}` and the site-name tokens for plain words. No other digits, apart from the allowlist in tests/story-game.test.ts.
// Dialogue never says "baseline", "sensitivity" or "Fact": it names the comparison in full and uses the estimate labels (tests/story-game.test.ts).
export const SCENES: Scene[] = [
  {
    id: "customer",
    lever: "customer",
    setting: "meeting-room",
    name: "Customer",
    intro: [
      { speaker: "kam", text: "Welcome to the value review. It matters because you should see what the Lindström service did for your year, in plain figures you can check. We compare it with another way of washing the same garments." },
      { speaker: "kam", text: "We will make four choices together, and I will show what each one changes. Every figure comes from the data pack. Afterwards you will see how it impacts the world." },
      { speaker: "ops", text: "Good. I would like to see our own year, and how we got to the answer." },
    ],
    explain: [
      {
        speaker: "kam",
        rules: [{ when: { data: "largestSite" }, text: "The first step sets whose garments, sites and washing we look at, and everything after follows from it. The largest of these sites is {largestSite}, by garments in circulation, so that is where the year weighs most." }],
        fallback: "The first step sets whose garments, sites and washing we look at, and everything after follows from it. I will look at the account as a whole.",
      },
      {
        speaker: "ops",
        rules: [{ when: { obs: "obs_repair_spike" }, text: "One thing I want explained: repairs at {spikeSites} rose well above the site's own trend in at least one month." }],
        fallback: "Nothing in our repair data stands out against each site's own trend, so I would like to see the year as a whole.",
      },
    ],
    question: "Whose year are we looking at?",
    react: "Yes, that is the account I know. Let's see how the year looked.",
    answer: "For {company}, {{fact:delivery_sites}} were served for {{fact:active_wearers}}, with {{fact:garments_in_circulation}} in circulation. The card shows what moved against the starting customer.",
    meaning: [
      {
        speaker: "kam",
        rules: [{ when: { obs: "obs_over_allocation" }, text: "What this says about the year: at {overSites}, more garments were allocated than were scanned last month, so some garments sat idle." }],
        fallback: "What this says about the year: no site had more garments allocated than scanned last month.",
      },
      {
        speaker: "kam",
        rules: [{ when: { factNull: "cost_of_unused_allocation" }, text: "The cost of unused allocation needs input from Lindström: the weekly rental fee per garment. Without it we cannot say what idle garments cost, so no figure is shown." }],
        fallback: "Idle garments cost {{fact:cost_of_unused_allocation}} over the year.",
      },
    ],
    cards: ["delivery_sites", "active_wearers", "garments_in_circulation", "co2e_saved", "cost_of_unused_allocation"],
  },
  {
    id: "baseline",
    lever: "baseline",
    setting: "plant-floor",
    name: "Comparison",
    intro: [
      { speaker: "kam", text: "This is where the washing happens. Savings only mean something against a comparison, and the comparison is a choice." },
      { speaker: "ops", text: "Then what are we comparing against? I expect the answer depends on it." },
    ],
    explain: [
      say("kam", "This choice picks the laundry we compare the service with: a local laundry, washing at home or an in-house laundry, each washing the same garments. The savings are the difference between that laundry and the service, in litres (L) of water, kilowatt hours (kWh) of energy and kilograms of CO2e."),
      {
        speaker: "ops",
        rules: [{ when: { obs: "obs_replacements_postponed" }, text: "Our repairs kept garments in use, so I want the comparison to be fair to how we run." }],
        fallback: "So the comparison decides how large the savings look.",
      },
    ],
    question: "Which laundry should we compare the service against?",
    react: "Compared with {comparison}, then. I expect the figures to move.",
    answer: "Compared with {comparison}, the service saved {{fact:water_saved}} of water, {{fact:energy_saved}} of energy and {{fact:co2e_saved}}. The factors for these comparison laundries are illustrative values in the data pack, not metered savings.",
    meaning: [
      {
        speaker: "kam",
        rules: [{ when: { data: "zeroDelivery" }, text: "Read this carefully: the service's delivery alone looks worse than this comparison, because washing that way has no delivery at all. Read delivery together with the net CO2e saved, which covers washing and delivery." }],
        fallback: "What this means: the figures show how the service compares with {comparison}. A saving means the service used less, and the card shows the direction and the size.",
      },
    ],
  },
  {
    id: "sensitivity",
    lever: "sensitivity",
    setting: "sustainability-office",
    name: "Estimate",
    intro: [
      { speaker: "kam", text: "The comparison laundries' factors were not measured at your plants, so the savings are an estimate. We can show a cautious, a standard and a generous version." },
      { speaker: "ops", text: "Who decides how wide that range is?" },
      { speaker: "kam", text: "The team declared it as assumption T002. It is the team's estimate range, not a measurement." },
    ],
    explain: [
      {
        speaker: "kam",
        rules: [{ when: { data: "spreadUnset" }, text: "The size of the range needs input from Lindström. Until it is set, only the Standard estimate can be shown, because the other two depend on it." }],
        fallback: "Cautious assumes the old laundry was more efficient than the data pack says, so savings come out smaller. Generous assumes it was less efficient, so savings come out larger. Standard uses the factors exactly as given.",
      },
    ],
    question: "How cautious should the savings be?",
    react: "The {estimate}, then. I will read the figures with that in mind.",
    answer: "With the {estimate}, the service saved {{fact:co2e_saved}}. This is the team's declared estimate range applied to the comparison laundry's factors. It is not a measurement or a forecast.",
    meaning: [
      {
        speaker: "kam",
        rules: [
          { when: { level: "low" }, text: "What this means: the Cautious estimate is the low end of the declared range, so these savings are the smallest of the three. If they still look worthwhile, the case holds on cautious assumptions." },
          { when: { level: "base" }, text: "What this means: the Standard estimate uses the data pack's factors as given. It is the middle of the declared range, not a measurement." },
          { when: { level: "high" }, text: "What this means: the Generous estimate is the high end of the declared range, so these savings are the largest of the three. Treat it as the upper end of the team's estimate, not as a measurement." },
        ],
        fallback: "What this means: the estimate range is the team's declared range, not a measurement.",
      },
    ],
  },
  {
    id: "priority",
    lever: "priorities",
    setting: "meeting-room",
    name: "Priority",
    intro: [
      { speaker: "ops", text: "One last thing. When I take this to my team, I do not want to hand them everything at once." },
      { speaker: "kam", text: "Then choose what the story should lead with. The figures stay the same, only the order changes." },
    ],
    explain: [
      {
        speaker: "kam",
        rules: [{ when: { obs: "obs_dormant_critical" }, text: "A priority decides which chapter of the written report comes first. One thing deserves raising early: garments at {dormantSites} sat unused for a long time." }],
        fallback: "A priority decides which chapter of the written report comes first. No garments reached the longest unused tier, so nothing here is urgent.",
      },
    ],
    question: "What should the story lead with?",
    react: "{chapter}, first. That is what I will open with.",
    answer: "The story now opens with {chapter}. {lead}",
    meaning: [
      {
        speaker: "kam",
        rules: [
          { when: { obs: "obs_repair_spike" }, text: "For your year, repairs rose above the usual trend at {spikeSites}, and that sits in the risk chapter of the report." },
          { when: { obs: "obs_over_allocation" }, text: "For your year, garments were allocated but not used at {overSites}, and that sits in the risk chapter of the report." },
        ],
        fallback: "The figures behind every chapter stay the same. The order only decides what your team reads first.",
      },
    ],
  },
];

/** The customer view's scene 1 (ADR 0029): two lines that name no customer, then the company picker. Nothing here may depend on a customer, because none is chosen yet. */
export const CUSTOMER_VIEW_INTRO: Line[] = [
  { speaker: "kam", text: "Welcome to the value review. It matters because you should see what the Lindström service did for your year, in plain figures you can check. We compare it with another way of washing the same garments." },
  { speaker: "kam", text: "We will make four choices together, and I will show what each one changes. Every figure comes from the data pack. Afterwards you will see how it impacts the world." },
  { speaker: "ops", text: "Good. I would like to go through our own year with you." },
];
export const CUSTOMER_VIEW_QUESTION = "Which company are you from?";
/** The customer view's answer to scene 1: the card shows the company's figures as they stand, so it never says "against the starting customer". */
export const CUSTOMER_VIEW_ANSWER = "For {company}, {{fact:delivery_sites}} were served for {{fact:active_wearers}}, with {{fact:garments_in_circulation}} in circulation. The card shows these figures as they stand.";

export const END_LINES = {
  recap: "That is the review. This is the path we took, in order.",
  actions: "You can download the data, read the full report or see your impact on the world. Each keeps every choice you made.",
};

export const SUGGESTED_BADGE = "Suggested for a first run";
/** The one plain line under each scene's suggested option. The rules that pick the option are in `suggest`. */
export const SUGGESTION_WHY: Record<SceneId, string> = {
  customer: "This account has the most going on in the data, so the story has the most to say.",
  baseline: "The headline savings figure uses this comparison.",
  sensitivity: "These are the factors exactly as given in the data pack.",
  priority: "This is where your year had the most going on. Pick what matters most to you.",
};

export const slotTexts = (slot: Slot): string[] => [...(slot.rules ?? []).map((r) => r.text), slot.fallback];

/** Every template a character can speak, conditional lines and fallbacks included, for the digit-scan and word tests. */
export const ALL_TEMPLATES: string[] = [
  ...SCENES.flatMap((s) => [...s.intro.map((l) => l.text), ...s.explain.flatMap(slotTexts), s.question, s.react, s.answer, ...s.meaning.flatMap(slotTexts)]),
  ...CUSTOMER_VIEW_INTRO.map((l) => l.text),
  CUSTOMER_VIEW_QUESTION,
  CUSTOMER_VIEW_ANSWER,
  ...Object.values(END_LINES),
  SUGGESTED_BADGE,
  ...Object.values(SUGGESTION_WHY),
  ...Object.values(SENSITIVITY_DESCRIPTION),
];

export type Beat =
  | { kind: "line"; line: Line }
  | { kind: "explain"; slot: Slot }
  | { kind: "ask" }
  | { kind: "react" }
  | { kind: "answer" }
  | { kind: "meaning"; slot: Slot }
  | { kind: "recap" }
  | { kind: "actions" };

/** The beats of a scene: intro lines, explain lines, the question, the reaction, the answer, then what it means. In the customer view scene 1 has two generic intro lines and no explain beats; the end scene is recap then actions. */
export function beatsFor(scene: Scene | "end", view: View): Beat[] {
  if (scene === "end") return [{ kind: "line", line: { speaker: "kam", text: END_LINES.recap } }, { kind: "recap" }, { kind: "actions" }];
  // Customer view, scene 1: no customer is chosen yet, so no explain beat (those read the default customer's data).
  const generic = view === "customer" && scene.id === "customer";
  const intro = (generic ? CUSTOMER_VIEW_INTRO : scene.intro).map((line): Beat => ({ kind: "line", line }));
  const explain = generic ? [] : scene.explain.map((slot): Beat => ({ kind: "explain", slot }));
  const meaning = scene.meaning.map((slot): Beat => ({ kind: "meaning", slot }));
  return [...intro, ...explain, { kind: "ask" }, { kind: "react" }, { kind: "answer" }, ...meaning];
}

/** `?scene=` is 1 to 4 or `end`. Anything else shows scene 1 and names the value. */
export function resolveScene(param: Param): { scene: number | "end"; rejected: string | null } {
  const v = first(param);
  if (v === undefined) return { scene: 1, rejected: null };
  if (v === "end") return { scene: "end", rejected: null };
  const n = /^\d+$/.test(v) ? Number(v) : 0;
  return n >= 1 && n <= SCENES.length ? { scene: n, rejected: null } : { scene: 1, rejected: v };
}

/** `?beat=` is a 0-based index into the scene's beats. Anything else shows beat 0 and names the value. */
export function resolveBeat(param: Param, count: number): { beat: number; rejected: string | null } {
  const v = first(param);
  if (v === undefined) return { beat: 0, rejected: null };
  const n = /^\d+$/.test(v) ? Number(v) : -1;
  return n >= 0 && n < count ? { beat: n, rejected: null } : { beat: 0, rejected: v };
}

/** The URL key a scene's lever lives under. */
const LEVER_KEY: Record<Lever, string> = { customer: "customer", baseline: "baseline", sensitivity: "sensitivity", priorities: "priorities" };

/** True when the address holds a choice for this scene's lever (an empty value is no choice). */
export const hasChoice = (scene: Scene, params: Params): boolean => (first(params[LEVER_KEY[scene.lever]]) ?? "") !== "";

/** A reaction or answer beat needs a choice; without one the question is shown instead. */
export function clampBeat(beats: readonly Beat[], beat: number, choiceMade: boolean): number {
  const kind = beats[beat].kind;
  return !choiceMade && (kind === "react" || kind === "answer" || kind === "meaning") ? beats.findIndex((b) => b.kind === "ask") : beat;
}

/** Copies every existing query param (repeated keys too, and ones the game does not know such as `view`), then applies `set`: a string sets the key, null removes it. */
export function gameHref(path: string, params: Params, set: Record<string, string | null>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (k in set || v === undefined) continue;
    for (const x of Array.isArray(v) ? v : [v]) q.append(k, x);
  }
  for (const [k, v] of Object.entries(set)) if (v !== null) q.set(k, v);
  const s = q.toString().replaceAll("%2C", ","); // the comma stays literal: ?priorities=water,cost
  return s ? `${path}?${s}` : path;
}

/** A step inside the game: scene and beat, plus the lever value a choice sets. */
export const stepHref = (params: Params, scene: number | "end", beat: number, choice: Record<string, string> = {}) =>
  gameHref(GAME_PATH, params, { scene: String(scene), beat: String(beat), ...choice });

/** A link out of the game (`/story`): leaves scene and beat behind and spells out the four resolved levers. */
export function exitHref(path: string, params: Params, state: { customer: string; baseline: string; sensitivity: string; priorities: readonly Priority[] }): string {
  return gameHref(path, params, { scene: null, beat: null, customer: state.customer, baseline: state.baseline, sensitivity: state.sensitivity, priorities: state.priorities.length ? state.priorities.join(",") : null });
}

/** The state before a scene's choice: the same address with that scene's lever back at its default. */
export const beforeParams = (scene: Scene, params: Params): Params => ({ ...params, [LEVER_KEY[scene.lever]]: undefined });

/** Resolves the four levers from an address with the same resolvers the Story uses. `notices` name every fallback. */
export function resolveState(data: AppData, p: Params) {
  const { customer, rejected: badCustomer } = resolveCustomer(p.customer, data.customers);
  const { baseline, rejected: badBaseline } = resolveBaseline(p.baseline, data.baselines);
  const { sensitivity, rejected: badSensitivity } = resolveSensitivity(p.sensitivity);
  const { priorities, rejected: badPriorities } = resolvePriorities(p.priorities);
  const short = baselineShortName(baseline);
  const notices = [
    ...(badCustomer !== null ? [`"${badCustomer}" is not a known customer, so ${customer.customer_name} is shown instead.`] : []),
    ...(badBaseline !== null ? [`"${badBaseline}" is not a known baseline, so ${short} is shown instead.`] : []),
    ...(badSensitivity !== null ? [`"${badSensitivity}" is not a known sensitivity level, so base is shown instead.`] : []),
    ...(badPriorities.length > 0 ? [`Not used as priorities: ${badPriorities.map((v) => `"${v}"`).join(", ")}.`] : []),
  ];
  return { customer, baseline, sensitivity, priorities, short, notices };
}

export type Option = { value: string; label: string; hint?: string; suggested?: boolean };

/** The choice buttons of a scene. Customer and baseline come from the loaded data; labels are looked up, never hard-coded ids. */
export function optionsFor(scene: Scene, data: AppData, priorityLabels: Record<Priority, string>): Option[] {
  switch (scene.id) {
    case "customer":
      return data.customers.map((c) => ({ value: c.customer_id, label: c.customer_name }));
    case "baseline":
      return data.baselines.map((b) => ({ value: b.baseline_id, label: baselineShortName(b) }));
    case "sensitivity":
      return (["low", "base", "high"] as const).map((l) => ({ value: l, label: SENSITIVITY_LABEL[l], hint: SENSITIVITY_DESCRIPTION[l] }));
    case "priority":
      return (Object.keys(priorityLabels) as Priority[]).map((p) => ({ value: p, label: priorityLabels[p] }));
  }
}

/** The chapter a priority puts first, and the first of its template lines. */
export const leadingChapter = (p: Priority) => buildStory([p])[0];

export type FactChange = { id: string; before: Fact; after: Fact; delta: FactDelta | null };

/** The Facts to show after a choice. Without `only`, every Fact whose value differs. With `only`, those ids that differ plus those still at "Needs input"; the delta is null when either side is. */
export function changedFacts(before: readonly Fact[], after: readonly Fact[], only?: readonly string[]): FactChange[] {
  const byId = (list: readonly Fact[]) => new Map(list.map((f) => [f.id, f]));
  const b = byId(before);
  const a = byId(after);
  const ids = only ?? [...a.keys()];
  return ids.flatMap((id) => {
    const fb = b.get(id);
    const fa = a.get(id);
    if (!fb || !fa) throw new Error(`Game card ${id} has no matching Fact`);
    const keep = fb.value !== fa.value || (only !== undefined && fa.value === null);
    return keep ? [{ id, before: fb, after: fa, delta: factDelta(fb, fa) }] : [];
  });
}

export type Words = {
  baseline: string;
  /** The estimate label (Cautious, Standard or Generous), shown wherever the story says "{sensitivity}". */
  sensitivity: string;
  company: string;
  chapter?: string;
  lead?: string;
  comparison?: string;
  estimate?: string;
  largestSite?: string;
  spikeSites?: string;
  overSites?: string;
  dormantSites?: string;
};

/** A line with its words and tokens filled in. Numbers only come from Facts, through the Story's own `resolveLine`. */
export function renderLine(text: string, facts: readonly Fact[], words: Words): string {
  const t = Object.entries({ company: words.company, chapter: words.chapter, lead: words.lead, comparison: words.comparison, estimate: words.estimate ?? words.sensitivity, largestSite: words.largestSite, spikeSites: words.spikeSites, overSites: words.overSites, dormantSites: words.dormantSites }).reduce(
    (acc, [k, v]) => acc.replaceAll(`{${k}}`, v ?? ""),
    text,
  );
  return resolveLine(t, facts, words);
}

// The way each comparison laundry is named in full in dialogue; a baseline outside the map falls back to its short name.
const COMPARISON: Record<string, string> = {
  B_LOCAL: "a local laundry washing the same garments",
  B_HOME: "washing the same garments at home",
  B_INHOUSE: "an in-house laundry washing the same garments",
};
export const comparisonPhrase = (b: { baseline_id: string }, short: string) => COMPARISON[b.baseline_id] ?? `${short} washing the same garments`;

/** What the conditions can see: the customer's observations and Facts, the chosen estimate, and three derived plain values. No numbers are made here. */
export type ScriptCtx = {
  observations: readonly Pick<Observation, "id">[];
  facts: readonly Fact[];
  level: Sensitivity;
  largestSite: string | null;
  zeroDelivery: boolean;
  spreadUnset: boolean;
};

export function holds(c: Cond, ctx: ScriptCtx): boolean {
  if ("obs" in c) return ctx.observations.some((o) => o.id === c.obs);
  if ("factNull" in c) return ctx.facts.find((f) => f.id === c.factNull)?.value === null;
  if ("level" in c) return ctx.level === c.level;
  return c.data === "largestSite" ? ctx.largestSite !== null : c.data === "zeroDelivery" ? ctx.zeroDelivery : ctx.spreadUnset;
}

/** The one place a slot becomes a line: the first rule that holds, else the fallback. Every slot has a fallback, so no beat is empty. */
export function pickLine(slot: Slot, ctx: ScriptCtx): Line {
  return { speaker: slot.speaker, text: slot.rules?.find((r) => holds(r.when, ctx))?.text ?? slot.fallback };
}

const siteNames = (data: AppData, o: Observation | undefined) => (o?.scope.siteIds ?? []).map((id) => data.sites.find((s) => s.site_id === id)?.site_name ?? id).join(", ");

/** Builds the conditions' view of one customer, and the site-name words the lines use. */
export function scriptContext(data: AppData, customerId: string, baseline: AppData["baselines"][number], level: Sensitivity, facts: readonly Fact[], observations: readonly Observation[], period: { from: string; to: string }) {
  // Largest site = most garments in circulation, from the engine's own per-site rows; ties go to the first site listed.
  const rows = operationalSiteRows(data, { customerId, period }).rows;
  const largest = rows.reduce<(typeof rows)[number] | null>((m, r) => (r.garments > (m?.garments ?? 0) ? r : m), null);
  const ctx: ScriptCtx = {
    observations,
    facts,
    level,
    largestSite: largest?.siteName ?? null,
    zeroDelivery: baseline.delivery_kgco2e_per_kg === 0,
    spreadUnset: facts.find((f) => f.id === "co2e_saved")?.range.low === null,
  };
  const names = (id: string) => siteNames(data, observations.find((o) => o.id === id));
  return { ctx, words: { largestSite: ctx.largestSite ?? "", spikeSites: names("obs_repair_spike"), overSites: names("obs_over_allocation"), dormantSites: names("obs_dormant_critical") } };
}

// Which chapter of the report each observation belongs to (it is shown there, or is about that chapter's numbers).
const OBS_CHAPTER: Record<string, string> = {
  obs_replacements_postponed: "circularity",
  obs_rental_fee_missing: "euros",
  obs_dormant_critical: "risk",
  obs_over_allocation: "risk",
  obs_repair_spike: "risk",
  obs_sites_not_classified: "risk",
};

/** Fired observations per chapter id, for the priority suggestion. An observation with no entry in the map counts nowhere. */
export function chapterObservationCounts(observations: readonly Pick<Observation, "id">[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const o of observations) if (OBS_CHAPTER[o.id]) counts[OBS_CHAPTER[o.id]] = (counts[OBS_CHAPTER[o.id]] ?? 0) + 1;
  return counts;
}

/**
 * The option to mark "Suggested for a first run", or null. Aims for the clearest, most representative run, never the biggest numbers.
 * customer: most fired observations (ties to the lowest id). baseline: the pack's default. estimate: Standard.
 * priority: the chapter with the most fired observations attached (ties and none fired go to default chapter order, among chapters a reader can pick).
 */
export function suggest(scene: Scene, view: View, ctx: { customerIds: readonly string[]; customerObservationCounts: Record<string, number>; chapterCounts: Record<string, number> }): string | null {
  if (view === "customer" && scene.id === "customer") return null; // the customer is locked, so there is nothing to suggest
  switch (scene.id) {
    case "customer":
      return [...ctx.customerIds].sort((a, b) => (ctx.customerObservationCounts[b] ?? 0) - (ctx.customerObservationCounts[a] ?? 0) || a.localeCompare(b))[0] ?? null;
    case "baseline":
      return DEFAULT_BASELINE_ID;
    case "sensitivity":
      return "base";
    case "priority": {
      // Default chapter order, one pickable priority per chapter (water for the water and carbon chapter, which serves two).
      const order = buildStory([]).flatMap((c) => PRIORITIES.find((p) => leadingChapter(p).id === c.id) ?? []);
      return order.reduce<Priority | null>((best, p) => (best === null || (ctx.chapterCounts[leadingChapter(p).id] ?? 0) > (ctx.chapterCounts[leadingChapter(best).id] ?? 0) ? p : best), null);
    }
  }
}

/** The row label without the comparison: "Water saved vs local laundry" reads "Water saved". Facts that name no baseline keep their label. */
export const neutralLabel = (f: Pick<Fact, "label" | "baseline">): string => (f.baseline ? f.label.replace(/ vs [^,]+/, "") : f.label);

/** Start over: scene, beat, the customer and the other levers go; `view` and unknown params stay. In the customer view this returns to the company picker. */
export const startOverHref = (params: Params): string => gameHref(GAME_PATH, params, { scene: null, beat: null, customer: null, baseline: null, sensitivity: null, priorities: null });

/** True on the very first beat of scene 1: no scene or beat past the start. */
export function isFirstBeat(params: Params, view: View): boolean {
  const { scene } = resolveScene(params.scene);
  return scene === 1 && resolveBeat(params.beat, beatsFor(SCENES[0], view).length).beat === 0;
}

/** The Start over control: always shown, disabled only when pressing it would change nothing (the first beat with no lever chosen). */
export function startOverState(params: Params, view: View): { href: string; disabled: boolean } {
  const levers: Lever[] = ["customer", "baseline", "sensitivity", "priorities"];
  return { href: startOverHref(params), disabled: isFirstBeat(params, view) && !levers.some((l) => first(params[LEVER_KEY[l]]) !== undefined) };
}

/** The Previous control's target from the beat now shown: the beat before it, or the last beat of the scene before (the ending steps back into the last scene). Null on the first beat of scene 1. Only `scene` and `beat` change, so every choice stays in the address. */
export function previousHref(params: Params, view: View, scene: number | "end", beat: number): string | null {
  if (beat > 0) return stepHref(params, scene, beat - 1);
  const before = scene === "end" ? SCENES.length : scene - 1;
  return before < 1 ? null : stepHref(params, before, beatsFor(SCENES[before - 1], view).length - 1);
}

export const REPORT_HINT = "Finish the review to open your report";

/** The header's "Read the full report": disabled on every beat until the ending, then it opens `/story` with every param kept (scene and beat dropped). */
export function reportLinkState(params: Params): { href: string; disabled: boolean } {
  return { href: gameHref(STORY_PATH, params, { scene: null, beat: null }), disabled: resolveScene(params.scene).scene !== "end" };
}
