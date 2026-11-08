// Text and rows for the two closing chapters. Static wording carries no digits except assumption ids; figures come from Facts or the assumptions config.
import { DORMANT_SITE_TYPE_TIERS, TEAM_ASSUMPTIONS, type Sensitivity } from "@/lib/engine";
import { formatValue } from "@/lib/format";
import { SENSITIVITY_LABEL } from "@/lib/selection";
import { NEEDS_INPUT } from "./index";

export const DATA_SOURCES = [
  "The Lindström hackathon data pack: synthetic customers, sites, products, repairs, service activity, service cycles, waste and circularity, laundry resources and comparison laundries. None of it is real customer data.",
  "Team assumptions, listed in the table below. Each one is either a modelling choice or something we do not know yet, and we always show it as assumed.",
  "Public references are not in the pack. Comparisons such as young trees appear in Impact World as labelled illustrations, each with its public source in Show math. They help you picture a figure, and they are not audit-ready reporting.",
];

export const BASELINE_CAVEAT =
  "The CO2e saved figure compares our service with an illustrative local laundry. The washing figure we used for that laundry is a team placeholder, not something measured, and it drives most of the saving. Open Show math on a CO2e saved figure to see the figure and where it comes from.";

/** Shown above the data pack's own assumptions table, whose cells stay verbatim (the pack's wording is data). */
export const DATA_PACK_NOTE = "The wording in this table comes straight from the data pack. Where it mentions a starting or default comparison, it means the one you chose at the top of this report.";

export const ROUNDING_NOTE = "Values are calculated at full precision and rounded only when displayed. Show math lists the unrounded inputs.";

export function sensitivityNote(level: Sensitivity): string {
  return `You are looking at the ${SENSITIVITY_LABEL[level]}. The Cautious and Generous estimates move every comparison figure up or down by a spread our team chose. That spread is a modelling choice, not a measured range, because the data has no low or high figures. We do not scale the laundry's own figures, and only the water, energy and CO2e saved carry a range.`;
}

export const DATA_GAPS = [
  "Delivery route kilometres are not in the pack, so we do not estimate delivery emissions from distance.",
  "The washing percentage in the data is mostly above one hundred percent and what it measures is unclear, so we do not use it in any claim.",
  "Scans that arrived out of order are sorted by timestamp and counted. The days-idle figure at the end of the period is unreliable, so we find unused garments from the gaps between wash cycles instead.",
  "The same wearer appears on several product rows, so we use the highest figure per site in the latest month to avoid counting anyone twice.",
  "The public references sheet named in the brief is not in the pack.",
];

export const OPEN_QUESTIONS = [
  "What does the washing percentage measure, and why is it mostly above one hundred percent?",
  "What is a typical weekly rental fee for one garment, which we could use as an illustrative assumption?",
  "Is a CO2-per-tree illustration acceptable if we label it as illustrative and give its source?",
  "Could we get average route kilometres per customer, even as a synthetic example?",
  "Should the washing figure for the illustrative comparison laundry be reviewed? It drives most of the CO2e saved.",
];

export type AssumptionRow = { id: string; label: string; meaning: string; value: string; set: boolean };

// Plain wording for the table, by T id (ADR 0028). The engine's own note and unit stay in Show math; only the id is kept.
const PLAIN: Record<string, { label: string; meaning: string; unit: string }> = {
  T001: { label: "Weekly rental fee per piece", meaning: "What it costs to rent one garment for a week. We have asked Lindström for it and do not have it yet.", unit: "EUR per piece per week" },
  T002: { label: "Size of the estimate range", meaning: "How far the Cautious and Generous estimates move away from Standard. It is a choice our team made, not a measurement.", unit: "of each comparison factor" },
  T003: { label: "Pickup gap limit, hospital sites", meaning: "Days between pickups before a gap counts as long. Further limits follow for very long and too long.", unit: "days" },
  T004: { label: "Pickup gap limit, manufacturing sites", meaning: "Days between pickups before a gap counts as long. Further limits follow for very long and too long.", unit: "days" },
  T005: { label: "Pickup gap limit, office and service sites", meaning: "Days between pickups before a gap counts as long. Further limits follow for very long.", unit: "days" },
  T006: { label: "Pickup gap limits by site type", meaning: "Which limit applies to which type of site." , unit: "" },
  T007: { label: "Under-use line", meaning: "A site has more garments than it uses when its use falls below this share.", unit: "of garments set aside" },
  T008: { label: "Repair spike ratio", meaning: "A month is a repair spike when repairs reach this multiple of the site's usual level.", unit: "times the usual level" },
  T009: { label: "Months behind the usual repair level", meaning: "How many earlier months set a site's usual repair level.", unit: "months" },
  T010: { label: "Smallest repair spike", meaning: "A spike also needs at least this many repairs above the usual level, so a small site is not flagged for a few repairs.", unit: "repairs" },
  T011: { label: "Carbon one tree absorbs", meaning: "A published figure for how much carbon a young tree takes in over ten years. We use it only to turn emissions into young trees in Impact World.", unit: "tCO2e per tree" },
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
