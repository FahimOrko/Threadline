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

/** Resolves `?sensitivity=`. Unknown values fall back to base; `rejected` names the bad value. */
export function resolveSensitivity(param: Param): { sensitivity: Sensitivity; rejected: string | null } {
  const value = first(param);
  if (value === undefined) return { sensitivity: DEFAULT_SENSITIVITY, rejected: null };
  const match = SENSITIVITY_LEVELS.find((l) => l === value);
  return match ? { sensitivity: match, rejected: null } : { sensitivity: DEFAULT_SENSITIVITY, rejected: value };
}
