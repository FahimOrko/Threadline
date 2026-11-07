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

/** Resolves `?sensitivity=`. Unknown values fall back to base; `rejected` names the bad value. */
export function resolveSensitivity(param: Param): { sensitivity: Sensitivity; rejected: string | null } {
  const value = first(param);
  if (value === undefined) return { sensitivity: DEFAULT_SENSITIVITY, rejected: null };
  const match = SENSITIVITY_LEVELS.find((l) => l === value);
  return match ? { sensitivity: match, rejected: null } : { sensitivity: DEFAULT_SENSITIVITY, rejected: value };
}

/** Site page link that keeps the customer, baseline and sensitivity the dashboard is showing (ADR 0014, 0017). */
export function siteHref(siteId: string, params: { customer: string; baseline: string; sensitivity: string }): string {
  const q = new URLSearchParams(params);
  return `/dashboard/sites/${encodeURIComponent(siteId)}?${q.toString()}`;
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
export function storyHref(params: { customer: string; baseline: string; sensitivity: string; priorities: readonly Priority[] }): string {
  const q = new URLSearchParams({ customer: params.customer, baseline: params.baseline, sensitivity: params.sensitivity });
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
