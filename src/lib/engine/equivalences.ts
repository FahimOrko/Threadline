// Illustrative equivalences (ADR 0032): the footprint Facts re-expressed as trees. Pure, same inputs as the footprint, no second emissions calculation.
import { TEAM_ASSUMPTIONS } from "./assumptions-config";
import type { Fact } from "./fact";
import { teamAssumptionInputs } from "./value";

/** The most tree icons the stage ever draws. */
export const MAX_TREE_ICONS = 300;

/** Icon counts for drawing, all whole numbers. `comparison` = `service` + `saved` when Lindström needs fewer trees; otherwise `saved` is 0 and `extra` is the shortfall. */
export type TreeStage = { perIcon: number; comparisonIcons: number; serviceIcons: number; savedIcons: number; extraIcons: number };

/** The smallest ladder step with `most` trees fitting in the icon cap. The ladder is 1, 5, 10, 25 (x2.5 on 10), 50, 100, 250, ... */
export function iconScale(most: number): number {
  for (const n of [1, 5]) if (Math.ceil(most / n) <= MAX_TREE_ICONS) return n;
  for (let d = 10; d <= 1e15; d *= 10) for (const n of [d, d * 2.5, d * 5]) if (Math.ceil(most / n) <= MAX_TREE_ICONS) return n;
  throw new Error("Tree count beyond the icon ladder");
}

const NOTE =
  "An illustration, not a measurement: a CO2 factor applied to CO2e as an approximation. Icon counts are the tree counts divided by the icon scale, rounded up for drawing, and at most 300 icons are drawn.";

/** The five tree Facts and the stage counts. Null Facts, and a null stage, when either footprint is unset or the factor is. */
export function treeFacts(footprint: Fact[]): { facts: Fact[]; stage: TreeStage | null } {
  const comparison = footprint.find((f) => f.id === "comparison_footprint");
  const service = footprint.find((f) => f.id === "service_footprint");
  if (!comparison || !service) return { facts: [], stage: null };
  const t011 = TEAM_ASSUMPTIONS.treeSeedlingSequestration;
  const factor = t011.value;

  const make = (id: string, label: string, value: number | null, unit: string, formula: string, from: Fact[], extra: Fact["inputs"] = []): Fact => ({
    id,
    label,
    value,
    unit,
    methods: ["ILLUSTRATIVE", "CALCULATED"],
    source: "PUBLIC_REFERENCE",
    assumptionIds: [t011.id],
    confidence: "Illustrative public reference (T011)",
    formula,
    inputs: [
      ...from.map((f) => ({ label: f.label, value: f.value ?? "needs input", unit: f.unit })),
      ...teamAssumptionInputs("tree factor", t011),
      ...extra,
      { label: "Illustration", note: true as const, value: NOTE },
    ],
    scope: comparison.scope,
    period: comparison.period,
    baseline: comparison.baseline,
    range: { low: null, base: value, high: null },
  });

  const trees = (kg: number | null) => (kg === null || factor === null ? null : kg / 1000 / factor);
  const c = trees(comparison.value);
  const s = trees(service.value);
  const saved = c === null || s === null ? null : c - s;
  const larger = c === null || s === null ? null : Math.max(c, s);
  const perIcon = larger === null ? null : iconScale(larger);

  const facts = [
    make("tree_factor", "Carbon one tree absorbs", factor, t011.unit, "tCO2e absorbed by one urban tree seedling grown for 10 years (US EPA)", []),
    make("trees_comparison", "Trees needed for the comparison's emissions", c, "trees", "trees = comparison footprint (tCO2e) / tree factor", [comparison]),
    make("trees_service", "Trees needed for Lindström's emissions", s, "trees", "trees = service footprint (process + delivery, tCO2e) / tree factor", [service]),
    make("trees_saved", "Trees saved", saved, "trees", "trees saved = trees for the comparison - trees for Lindström", [comparison, service]),
    make("tree_icon_scale", "Trees per icon", perIcon, "trees per icon", `icon scale = smallest step of 1, 5, 10, 25, 50, 100, 250 ... that keeps the larger tree count within ${MAX_TREE_ICONS} icons`, [], [{ label: "Icon cap", value: MAX_TREE_ICONS, unit: "icons" }]),
  ];
  if (c === null || s === null || perIcon === null) return { facts, stage: null };
  const comparisonIcons = Math.ceil(c / perIcon);
  const serviceIcons = Math.ceil(s / perIcon);
  return {
    facts,
    stage: {
      perIcon,
      comparisonIcons,
      serviceIcons,
      savedIcons: Math.max(0, comparisonIcons - serviceIcons),
      extraIcons: Math.max(0, serviceIcons - comparisonIcons),
    },
  };
}
