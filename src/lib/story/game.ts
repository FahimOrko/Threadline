// The story choices game (ADR 0021): scenes, beats and dialogue as plain data, and the URL helpers around them.
// It computes nothing. Every number a character says is a `{{fact:id}}` token resolved from engine Facts (ADR 0005), and
// every move sets one existing lever (`?customer=`, `?baseline=`, `?sensitivity=`, `?priorities=`).
import { resolveCustomer } from "@/lib/customer";
import type { AppData } from "@/lib/data/schemas";
import { baselineShortName, factDelta, type Fact, type FactDelta } from "@/lib/engine";
import { resolveBaseline, resolvePriorities, resolveSensitivity, type Priority, type View } from "@/lib/selection";
import { buildStory, resolveLine } from "./index";

export const GAME_PATH = "/story/game";
export const STORY_PATH = "/story";

// shortcut: the Impact World route does not exist yet. Set this to its path in the Impact World change; while null the ending renders nothing.
export const IMPACT_WORLD_HREF: string | null = null;

type Param = string | string[] | undefined;
export type Params = Record<string, Param>;
const first = (p: Param) => (Array.isArray(p) ? p[0] : p);

export type Speaker = "kam" | "ops";
export type Line = { speaker: Speaker; text: string };
export type Lever = "customer" | "baseline" | "sensitivity" | "priorities";
export type Setting = "meeting-room" | "plant-floor" | "sustainability-office";
export const SETTING_LABEL: Record<Setting, string> = { "meeting-room": "Meeting room", "plant-floor": "Plant floor", "sustainability-office": "Sustainability office" };

export type Scene = {
  id: "customer" | "baseline" | "sensitivity" | "priority";
  lever: Lever;
  setting: Setting;
  /** Short name for the path strip and the recap. */
  name: string;
  intro: Line[];
  /** The KAM's question; the choice buttons follow it. */
  question: string;
  /** The ops lead's reaction after a choice. */
  react: string;
  /** The KAM's answer, shown with the consequence card. */
  answer: string;
  /** Limits the card to these Fact ids (a Fact kept at "Needs input" stays listed). Without it, every Fact that changed is listed. */
  cards?: string[];
};

// Templates: `{{fact:id}}` for numbers; `{baseline}`, `{sensitivity}`, `{company}`, `{chapter}` and `{lead}` for plain words. No other digits, apart from the allowlist in tests/story-game.test.ts.
export const SCENES: Scene[] = [
  {
    id: "customer",
    lever: "customer",
    setting: "meeting-room",
    name: "Customer",
    intro: [
      { speaker: "kam", text: "Welcome to the value review. We will make four choices together, and I will show what each one changes. Every figure comes from the data pack." },
      { speaker: "ops", text: "Good. I would like to see our own year, and how we got to the answer." },
    ],
    question: "Whose year are we looking at?",
    react: "Yes, that is the account I know. Let's see how the year looked.",
    answer: "For {company}, {{fact:delivery_sites}} were served for {{fact:active_wearers}}, with {{fact:garments_in_circulation}} in circulation. The card shows what moved against the starting customer.",
    cards: ["delivery_sites", "active_wearers", "garments_in_circulation", "co2e_saved", "cost_of_unused_allocation"],
  },
  {
    id: "baseline",
    lever: "baseline",
    setting: "plant-floor",
    name: "Baseline",
    intro: [
      { speaker: "kam", text: "This is where the washing happens. Savings only mean something against a comparison, and the comparison is a choice." },
      { speaker: "ops", text: "Then what are we comparing against? I expect the answer depends on it." },
    ],
    question: "Which laundry should we compare the service against?",
    react: "Against {baseline}, then. I expect the figures to move.",
    answer: "Against {baseline}, the service saved {{fact:water_saved}} of water, {{fact:energy_saved}} of energy and {{fact:co2e_saved}}. These are comparisons against illustrative baseline factors, not metered savings.",
  },
  {
    id: "sensitivity",
    lever: "sensitivity",
    setting: "sustainability-office",
    name: "Sensitivity",
    intro: [
      { speaker: "kam", text: "The baseline factors were not measured for your plants, so the savings carry a spread around them." },
      { speaker: "ops", text: "Who decides how wide that spread is?" },
      { speaker: "kam", text: "The team declared it as T002. It is a modelling choice, not a measured range." },
    ],
    question: "How cautious should the savings be?",
    react: "At {sensitivity}, then. I will read the figures with that in mind.",
    answer: "At {sensitivity} sensitivity the service saved {{fact:co2e_saved}}. The spread is the declared T002 applied to the baseline factors. It is not a measured range or a forecast.",
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
    question: "What should the story lead with?",
    react: "{chapter}, first. That is what I will open with.",
    answer: "The story now opens with {chapter}. {lead}",
  },
];

/** The customer view (later change) locks scene 1 to the resolved customer: a confirmation, not a choice. */
export const CUSTOMER_VIEW_INTRO: Line[] = [
  { speaker: "ops", text: "I am the ops lead at {company}. This is our year with the service, and I would like to go through it with you." },
  { speaker: "kam", text: "Happy to. I will show what each choice changes, and every figure comes from the data pack." },
];
export const CUSTOMER_VIEW_CONFIRM = "Ready when you are.";
export const START_REVIEW_LABEL = "Start the review";

export const END_LINES = {
  recap: "That is the review. This is the path we took, in order.",
  actions: "You can open the PDF version or read the full story. Both keep every choice you made.",
};

/** Hints shown under the sensitivity buttons. T002 is named as the declared spread (ADR 0017). */
export const SENSITIVITY_HINTS: Record<string, string> = {
  low: "Baseline factors scaled down by the declared T002 spread",
  base: "Baseline factors as given in the data pack",
  high: "Baseline factors scaled up by the declared T002 spread",
};

/** Every template a character can speak, for the digit-scan test. */
export const ALL_TEMPLATES: string[] = [
  ...SCENES.flatMap((s) => [...s.intro.map((l) => l.text), s.question, s.react, s.answer]),
  ...CUSTOMER_VIEW_INTRO.map((l) => l.text),
  CUSTOMER_VIEW_CONFIRM,
  START_REVIEW_LABEL,
  ...Object.values(END_LINES),
  ...Object.values(SENSITIVITY_HINTS),
];

export type Beat = { kind: "line"; line: Line } | { kind: "ask" } | { kind: "react" } | { kind: "answer" } | { kind: "recap" } | { kind: "actions" };

/** The beats of a scene: intro lines, the question, the reaction, the answer. In the customer view scene 1 is intro lines and one confirmation; the end scene is recap then actions. */
export function beatsFor(scene: Scene | "end", view: View): Beat[] {
  if (scene === "end") return [{ kind: "line", line: { speaker: "kam", text: END_LINES.recap } }, { kind: "recap" }, { kind: "actions" }];
  const locked = view === "customer" && scene.id === "customer";
  const intro = (locked ? CUSTOMER_VIEW_INTRO : scene.intro).map((line): Beat => ({ kind: "line", line }));
  return locked ? [...intro, { kind: "ask" }] : [...intro, { kind: "ask" }, { kind: "react" }, { kind: "answer" }];
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
  return !choiceMade && (kind === "react" || kind === "answer") ? beats.findIndex((b) => b.kind === "ask") : beat;
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

/** A link out of the game (`/story`, `/story/print`): leaves scene and beat behind and spells out the four resolved levers. */
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

export type Option = { value: string; label: string; hint?: string };

/** The choice buttons of a scene. Customer and baseline come from the loaded data; labels are looked up, never hard-coded ids. */
export function optionsFor(scene: Scene, data: AppData, priorityLabels: Record<Priority, string>): Option[] {
  switch (scene.id) {
    case "customer":
      return data.customers.map((c) => ({ value: c.customer_id, label: c.customer_name }));
    case "baseline":
      return data.baselines.map((b) => ({ value: b.baseline_id, label: baselineShortName(b) }));
    case "sensitivity":
      return (["low", "base", "high"] as const).map((l) => ({ value: l, label: l[0].toUpperCase() + l.slice(1), hint: SENSITIVITY_HINTS[l] }));
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

/** A line with its words and tokens filled in. Numbers only come from Facts, through the Story's own `resolveLine`. */
export function renderLine(text: string, facts: readonly Fact[], words: { baseline: string; sensitivity: string; company: string; chapter?: string; lead?: string }): string {
  const t = text.replaceAll("{company}", words.company).replaceAll("{chapter}", words.chapter ?? "").replaceAll("{lead}", words.lead ?? "");
  return resolveLine(t, facts, words);
}
