// Which baseline and sensitivity level a page shows (ADR 0017). Pure and isomorphic, like resolveCustomer: the server page and the header call the same functions.
import { DEFAULT_BASELINE_ID } from "@/lib/data/schemas";
import { DEFAULT_SENSITIVITY, SENSITIVITY_LEVELS, type Sensitivity } from "@/lib/engine";

type Param = string | string[] | undefined;
const first = (p: Param) => (Array.isArray(p) ? p[0] : p);

/** Resolves `?baseline=`. Unknown, empty or repeated values fall back to local laundry; `rejected` names the bad value. */
export function resolveBaseline<B extends { baseline_id: string }>(param: Param, baselines: B[]): { baseline: B; rejected: string | null } {
  const fallback = baselines.find((b) => b.baseline_id === DEFAULT_BASELINE_ID) ?? baselines[0];
  const value = first(param);
  if (value === undefined) return { baseline: fallback, rejected: null };
  const match = baselines.find((b) => b.baseline_id === value);
  return match ? { baseline: match, rejected: null } : { baseline: fallback, rejected: value };
}

/** The one display label per sensitivity level, reused by every surface (header, game, story text, print cover). URL values stay low/base/high. */
export const SENSITIVITY_LABEL: Record<Sensitivity, string> = { low: "Cautious estimate", base: "Standard estimate", high: "Generous estimate" };
/** One plain sentence per level. The declared T002 spread lives in Show math and methodology, not here. */
export const SENSITIVITY_DESCRIPTION: Record<Sensitivity, string> = {
  low: "The old laundry is assumed more efficient than the data pack says, so savings come out smaller.",
  base: "Factors as given in the data pack.",
  high: "The old laundry is assumed less efficient than the data pack says, so savings come out larger.",
};
/** The scenario strip's tooltips (ADR 0017): what each estimate means, and that the range is declared by the team, not measured. */
export const SENSITIVITY_TOOLTIP: Record<Sensitivity, string> = {
  low: `${SENSITIVITY_DESCRIPTION.low} The size of the range is declared by the team (T002), not measured.`,
  base: `${SENSITIVITY_DESCRIPTION.base} The range around it is declared by the team (T002), not measured.`,
  high: `${SENSITIVITY_DESCRIPTION.high} The size of the range is declared by the team (T002), not measured.`,
};
/** What each comparison means in one plain sentence, for the scenario strip's tooltips. Unknown ids fall back to a generic line. */
export const BASELINE_TOOLTIP: Record<string, string> = {
  B_LOCAL: "Savings are measured against garments washed by an outsourced local laundry. This is the default comparison.",
  B_HOME: "Savings are measured against garments washed at home by the wearer. Home washing has no delivery, so delivery alone looks worse than it.",
  B_INHOUSE: "Savings are measured against garments washed in the customer's own laundry.",
};
export const baselineTooltip = (id: string) => BASELINE_TOOLTIP[id] ?? "Savings are measured against this way of washing garments.";

/** Resolves `?sensitivity=`. Unknown values fall back to base; `rejected` names the bad value. */
export function resolveSensitivity(param: Param): { sensitivity: Sensitivity; rejected: string | null } {
  const value = first(param);
  if (value === undefined) return { sensitivity: DEFAULT_SENSITIVITY, rejected: null };
  const match = SENSITIVITY_LEVELS.find((l) => l === value);
  return match ? { sensitivity: match, rejected: null } : { sensitivity: DEFAULT_SENSITIVITY, rejected: value };
}

/** Site page link that keeps the customer, baseline and sensitivity the dashboard is showing (ADR 0014, 0017). */
export function siteHref(siteId: string, params: { customer: string; baseline: string; sensitivity: string; view?: View }): string {
  const { view, ...rest } = params;
  const q = new URLSearchParams(rest);
  if (view === "customer") q.set("view", view);
  return `/dashboard/sites/${encodeURIComponent(siteId)}?${q.toString()}`;
}

/** A dashboard page link (optionally to an anchor) that keeps the customer, baseline and sensitivity the page is showing. */
export function sectionHref(path: string, params: { customer: string; baseline: string; sensitivity: string }, hash?: string): string {
  return `${path}?${new URLSearchParams(params).toString()}${hash ? `#${hash}` : ""}`;
}

export const PRIORITIES = ["water", "cost", "emissions", "circularity", "service", "hygiene"] as const;
export type Priority = (typeof PRIORITIES)[number];
export const MAX_PRIORITIES = 2;

/** Resolves `?priorities=a,b` (ADR 0019). Keeps the first valid distinct picks up to two, in order; every other value is dropped and named in `rejected`. No value means no picks. */
export function resolvePriorities(param: Param): { priorities: Priority[]; rejected: string[] } {
  const values = (Array.isArray(param) ? param : [param]).flatMap((p) => (p ?? "").split(",")).filter((v) => v !== "");
  const priorities: Priority[] = [];
  const rejected: string[] = [];
  for (const v of values) {
    const match = PRIORITIES.find((p) => p === v);
    if (match && !priorities.includes(match) && priorities.length < MAX_PRIORITIES) priorities.push(match);
    else rejected.push(v);
  }
  return { priorities, rejected };
}

/** Story link that keeps customer, baseline, sensitivity and the priority picks (ADR 0014, 0017, 0019). */
export function storyHref(params: { customer: string; baseline: string; sensitivity: string; priorities: readonly Priority[]; view?: View }): string {
  const q = new URLSearchParams({ customer: params.customer, baseline: params.baseline, sensitivity: params.sensitivity });
  if (params.view === "customer") q.set("view", "customer"); // ADR 0023: every link keeps the view
  // The comma stays literal so the address reads ?priorities=water,cost.
  const picks = params.priorities.length > 0 ? `&priorities=${params.priorities.join(",")}` : "";
  return `/story?${q.toString()}${picks}`;
}

/** The picks after clicking `p`: a picked chip is removed, a new one is added and a third replaces the oldest (ADR 0019). */
export function togglePriority(picks: readonly Priority[], p: Priority): Priority[] {
  if (picks.includes(p)) return picks.filter((x) => x !== p);
  return [...picks, p].slice(-MAX_PRIORITIES);
}

export type View = "kam" | "customer";

/** Resolves `?view=`. Only the customer view locks the game's customer scene; everything else, including a missing or unknown value, is the KAM view (today's behaviour). No notice: `view` is not a game choice. */
export function resolveView(param: Param): View {
  return first(param) === "customer" ? "customer" : "kam";
}

const DASHBOARD = "/dashboard";
const inDashboard = (path: string) => path === DASHBOARD || path.startsWith(`${DASHBOARD}/`);

/**
 * The query (with its "?", or "") a view link carries (ADR 0023). Leaving the dashboard keeps `view` only, so Story and Impact World start fresh;
 * every other link keeps customer, baseline, sensitivity and priorities as before. KAM is the absence of `view`, so it adds nothing.
 */
export function carryParams(from: string, to: string, params: URLSearchParams): string {
  const keep = inDashboard(from) && !inDashboard(to) ? [] : ["customer", "baseline", "sensitivity", "priorities"];
  const q = new URLSearchParams();
  for (const k of keep) {
    const v = params.get(k);
    if (v !== null && (k === "priorities" ? v !== "" : true)) q.set(k, v);
  }
  if (resolveView(params.get("view") ?? undefined) === "customer") q.set("view", "customer");
  return q.size ? `?${q.toString()}` : "";
}

// Literal, not imported from story/game, which imports this file.
const GAME = "/story/game";

/** Where a customer-view request for a dashboard URL goes: the game, keeping only `view` and `customer`. Null means the request is allowed (KAM view or not the dashboard). */
export function customerViewRedirect(url: URL): string | null {
  if (!inDashboard(url.pathname) || resolveView(url.searchParams.get("view") ?? undefined) !== "customer") return null;
  const q = new URLSearchParams({ view: "customer" });
  const customer = url.searchParams.get("customer");
  if (customer !== null) q.set("customer", customer);
  return `${GAME}?${q.toString()}`;
}
