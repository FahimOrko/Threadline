// Text and rows for the two closing chapters. Static wording carries no digits except assumption ids; figures come from Facts or the assumptions config.
import { DORMANT_SITE_TYPE_TIERS, TEAM_ASSUMPTIONS, type Sensitivity } from "@/lib/engine";
import { formatValue } from "@/lib/format";
import { SENSITIVITY_LABEL } from "@/lib/selection";
import { NEEDS_INPUT } from "./index";

export const DATA_SOURCES = [
  "The Lindström hackathon data pack: synthetic customers, sites, products, repairs, service activity, service cycles, waste and circularity, laundry resources and baselines. Nothing here is real customer data.",
  "Team assumptions, listed below with a T id. They are modelling choices or unknowns, always shown as assumed.",
  "Public references are not in the pack. Equivalences such as trees, bathtubs or car kilometres are not shown.",
];

export const BASELINE_CAVEAT =
  "The CO2e saved figure compares the service with an illustrative local laundry baseline. Its process factor is a team placeholder, not a measured value, and it drives most of the saving. Open Show math on the CO2e saved cards to see the factor and its source.";

export const ROUNDING_NOTE = "Values are calculated at full precision and rounded only when displayed. Show math lists the unrounded inputs.";

export function sensitivityNote(level: Sensitivity): string {
  return `The ${SENSITIVITY_LABEL[level]} is shown. The Cautious and Generous estimates scale every baseline factor by the declared spread T002. This is a modelling choice, not a measured range: the data pack has no low or high factors. Laundry factors are not scaled, and only the water, energy and CO2e saved figures carry a range.`;
}

export const DATA_GAPS = [
  "Delivery route kilometres are not in the pack, so delivery emissions are not estimated from distance.",
  "washing_pct is mostly above one hundred percent and its definition is unclear, so it is not used in any claim.",
  "Out-of-order scans are sorted by timestamp and reported. Days idle at period end is unreliable, so dormant garments use gaps between cycles.",
  "Active wearers repeat across product rows, so the latest-month maximum per site is used to avoid a double count.",
  "The Public_References sheet named in the brief is not in the pack.",
];

export const OPEN_QUESTIONS = [
  "What does washing_pct measure, and why is it mostly above one hundred percent?",
  "What is a typical weekly rental fee per garment piece, as an illustrative assumption (T001)?",
  "Is a CO2-per-tree illustration acceptable if it is labelled illustrative and carries a source?",
  "Can we get average route kilometres per customer, even as a synthetic example?",
  "Should the illustrative local laundry baseline process factor be reviewed? It drives most of the CO2e saved.",
];

export type AssumptionRow = { id: string; name: string; value: string; set: boolean; note: string };

const words = (key: string) => key.replace(/([A-Z])/g, " $1").toLowerCase();

/** Every team assumption (T001 onwards), set with its value and unit or unset as "Needs input". */
export function assumptionRows(): AssumptionRow[] {
  const rows: AssumptionRow[] = Object.entries(TEAM_ASSUMPTIONS).map(([key, a]) => ({
    id: a.id,
    name: words(key),
    set: a.value !== null,
    value: a.value === null ? NEEDS_INPUT : `${formatValue(a.value)} ${a.unit}`,
    note: a.note,
  }));
  rows.push({ id: DORMANT_SITE_TYPE_TIERS.id, name: "dormant tier by site type", set: true, value: "Set (site type to tier row map)", note: DORMANT_SITE_TYPE_TIERS.note });
  return rows.sort((a, b) => a.id.localeCompare(b.id));
}
