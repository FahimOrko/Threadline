// Text and rows for the two closing chapters. Static wording carries no digits except assumption ids; figures come from Facts or the assumptions config.
import { DORMANT_SITE_TYPE_TIERS, TEAM_ASSUMPTIONS, type Sensitivity } from "@/lib/engine";
import { formatValue } from "@/lib/format";
import { SENSITIVITY_LABEL } from "@/lib/selection";
import { NEEDS_INPUT } from "./index";

export const DATA_SOURCES = [
  "The Lindström hackathon data pack: synthetic customers, sites, products, repairs, service activity, service cycles, waste and circularity, laundry resources and comparison laundries. Nothing here is real customer data.",
  "Team assumptions, listed in the table below. They are modelling choices or unknowns, always shown as assumed.",
  "Public references are not in the pack. Equivalences such as trees, bathtubs or car kilometres are not shown.",
];

export const BASELINE_CAVEAT =
  "The CO2e saved figure compares the service with an illustrative local laundry. Its process factor is a team placeholder, not a measured value, and it drives most of the saving. Open Show math on a CO2e saved figure to see the factor and its source.";

export const ROUNDING_NOTE = "Values are calculated at full precision and rounded only when displayed. Show math lists the unrounded inputs.";

export function sensitivityNote(level: Sensitivity): string {
  return `The ${SENSITIVITY_LABEL[level]} is shown. The Cautious and Generous estimates widen or narrow every comparison factor by the team's declared spread. This is a modelling choice, not a measured range: the data pack has no low or high factors. Laundry factors are not scaled, and only the water, energy and CO2e saved figures carry a range.`;
}

export const DATA_GAPS = [
  "Delivery route kilometres are not in the pack, so delivery emissions are not estimated from distance.",
  "washing_pct is mostly above one hundred percent and its definition is unclear, so it is not used in any claim.",
  "Out-of-order scans are sorted by timestamp and reported. Days idle at period end is unreliable, so unused garments are found from the gaps between cycles.",
  "Active wearers repeat across product rows, so the latest-month maximum per site is used to avoid a double count.",
  "The Public_References sheet named in the brief is not in the pack.",
];

export const OPEN_QUESTIONS = [
  "What does washing_pct measure, and why is it mostly above one hundred percent?",
  "What is a typical weekly rental fee per garment piece, as an illustrative assumption?",
  "Is a CO2-per-tree illustration acceptable if it is labelled illustrative and carries a source?",
  "Can we get average route kilometres per customer, even as a synthetic example?",
  "Should the process factor of the illustrative comparison laundry be reviewed? It drives most of the CO2e saved.",
];

export type AssumptionRow = { id: string; label: string; meaning: string; value: string; set: boolean };

// Plain wording for the table, by T id (ADR 0028). The engine's own note and unit stay in Show math; only the id is kept.
const PLAIN: Record<string, { label: string; meaning: string; unit: string }> = {
  T001: { label: "Weekly rental fee per piece", meaning: "What one garment costs to rent for a week. Asked of Lindström, not supplied yet.", unit: "EUR per piece per week" },
  T002: { label: "Size of the estimate range", meaning: "How far the Cautious and Generous estimates move from Standard. A team choice, not a measurement.", unit: "of each comparison factor" },
  T003: { label: "Pickup gap limit, hospital sites", meaning: "Days between pickups before a gap counts as long. Further limits follow for very long and too long.", unit: "days" },
  T004: { label: "Pickup gap limit, manufacturing sites", meaning: "Days between pickups before a gap counts as long. Further limits follow for very long and too long.", unit: "days" },
  T005: { label: "Pickup gap limit, office and service sites", meaning: "Days between pickups before a gap counts as long. Further limits follow for very long.", unit: "days" },
  T006: { label: "Pickup gap limits by site type", meaning: "Which limit applies to which type of site." , unit: "" },
  T007: { label: "Under-use line", meaning: "A site has more garments than it uses when its use falls below this share.", unit: "of garments set aside" },
  T008: { label: "Repair spike ratio", meaning: "A month is a repair spike when repairs reach this multiple of the site's usual level.", unit: "times the usual level" },
  T009: { label: "Months behind the usual repair level", meaning: "How many earlier months set a site's usual repair level.", unit: "months" },
  T010: { label: "Smallest repair spike", meaning: "A spike also needs at least this many repairs above the usual level, so a small site is not flagged for a few repairs.", unit: "repairs" },
};

/** Every team assumption (T001 onwards), set with its value and plain unit or unset as "Needs input". Only a table cell shows the T id. */
export function assumptionRows(): AssumptionRow[] {
  const rows: AssumptionRow[] = Object.values(TEAM_ASSUMPTIONS).map((a) => ({
    id: a.id,
    label: PLAIN[a.id].label,
    meaning: PLAIN[a.id].meaning,
    set: a.value !== null,
    value: a.value === null ? NEEDS_INPUT : `${formatValue(a.value)} ${PLAIN[a.id].unit}`,
  }));
  rows.push({ id: DORMANT_SITE_TYPE_TIERS.id, label: PLAIN.T006.label, meaning: PLAIN.T006.meaning, set: true, value: "Set for each site type" });
  return rows.sort((a, b) => a.id.localeCompare(b.id));
}
