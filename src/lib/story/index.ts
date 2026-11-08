// The deterministic story (ADR 0019). A template over `{{fact:id}}` tokens: it selects, orders and phrases, and computes nothing.
// Numbers are resolved from engine Facts at render and rounded only there (ADR 0005). A sentence whose figure can be unset carries an `ifMissing` sentence (ADR 0016, 0028).
import type { Fact } from "@/lib/engine";
import { formatCardValue } from "@/lib/format";
import type { Priority } from "@/lib/selection";
import type { Sentence } from "@/lib/explain";

export const NEEDS_INPUT = "Needs input";

/** A chart the story reuses from the dashboard; the document maps the key to the same markup and engine data. */
export type StoryChart = "co2e-comparison" | "avoided-trend" | "waste-treatment" | "requests-trend";

export type StoryChapter = {
  id: string;
  title: string;
  /** The grouped panel's title, by meaning (the dashboard's pattern). */
  panel: string;
  /** Template sentences; `{baseline}` and `{sensitivity}` are plain words, numbers are `{{fact:id}}` tokens. */
  lines: readonly [string, ...Sentence[]];
  /** Fact ids in order: the first is the hero figure, the two or three after it are the supporting cards. The story game reads the same list. */
  cards: string[];
  /** At most one chart reused from the dashboard. */
  chart?: StoryChart;
  /** The reader's picks this chapter serves (empty = not a priority). */
  picked: Priority[];
  /** Show the risk observations under this chapter. */
  observations?: "risk";
};

type ChapterDef = Omit<StoryChapter, "picked"> & { serves: Priority[] };

// Default order after the cover. Methodology and Data readiness always follow these and are not part of the list.
export const CHAPTERS: ChapterDef[] = [
  {
    id: "numbers",
    panel: "Who we served",
    title: "Your year in numbers",
    serves: [],
    lines: ["{{fact:delivery_sites}} were served for {{fact:active_wearers}}, with {{fact:garments_in_circulation}} in circulation."],
    cards: ["active_wearers", "delivery_sites", "garments_in_circulation"],
  },
  {
    id: "circularity",
    panel: "Textile waste",
    title: "What we kept out of the bin",
    serves: ["circularity"],
    lines: ["The year brought {{fact:repairs}}, which postponed {{fact:replacements_postponed}}. {{fact:recycling_reuse_share}} of textile waste was recycled or reused."],
    cards: ["recycling_reuse_share", "repairs", "replacements_postponed"],
    chart: "waste-treatment",
  },
  {
    id: "water-carbon",
    panel: "Saved against the comparison laundry",
    title: "Water and carbon",
    serves: ["water", "emissions"],
    lines: [
      "Against {baseline}, using the {sensitivity}, the service saved {{fact:water_saved}} of water, {{fact:energy_saved}} of energy and {{fact:co2e_saved}}, a {{fact:co2e_saved_pct}} cut.",
      "Delivery emits {{fact:delivery_footprint}}, {{fact:delivery_share}} of the service's emissions. The net saving above already includes it.",
    ],
    cards: ["co2e_saved", "water_saved", "energy_saved", "delivery_footprint"],
    chart: "co2e-comparison",
  },
  {
    id: "euros",
    panel: "Purchases avoided",
    title: "What it means in euros",
    serves: ["cost"],
    lines: [
      "Repairs avoided {{fact:avoided_purchase_cost}} of garment purchases, and {{fact:garment_value_kept_in_use}} of garment value is kept in use.",
      { text: "Garments set aside but not used cost {{fact:cost_of_unused_allocation}}, which is where the customer can save more.", ifMissing: "The cost of unused garments can be shown once Lindström provides a rental fee." },
    ],
    cards: ["avoided_purchase_cost", "garment_value_kept_in_use", "cost_of_unused_allocation", "garment_utilization"],
    chart: "avoided-trend",
  },
  {
    id: "risk",
    panel: "Sites to look at",
    title: "Where we see risk",
    serves: ["hygiene"],
    lines: ["Garment signals show where hygiene and availability need attention: {{fact:dormant_critical_sites}} with garments unused too long, {{fact:over_allocated_sites}} with more garments than needed and {{fact:repair_spike_sites}} with a repair spike."],
    cards: ["dormant_critical_sites", "over_allocated_sites", "repair_spike_sites"],
    observations: "risk",
  },
  {
    id: "service",
    panel: "Wash cycles and requests",
    title: "Service and reliability",
    serves: ["service"],
    lines: ["{{fact:on_time_cycle_rate}} of sampled cycles ran on time, and wearers raised {{fact:service_requests}} ({{fact:service_requests_per_100_wearers}})."],
    cards: ["on_time_cycle_rate", "service_requests", "service_requests_per_100_wearers"],
    chart: "requests-trend",
  },
];

/** The short on-screen label of a chapter figure, the same wording as the dashboard. */
export const FIGURE_LABEL: Record<string, string> = {
  active_wearers: "Active wearers",
  delivery_sites: "Delivery sites",
  garments_in_circulation: "Garments in circulation",
  recycling_reuse_share: "Textile waste recycled or reused",
  repairs: "Repairs, full year",
  replacements_postponed: "Replacements postponed",
  co2e_saved: "Net CO2e saved, after delivery",
  water_saved: "Water saved",
  energy_saved: "Energy saved",
  delivery_footprint: "Delivery emissions",
  avoided_purchase_cost: "Avoided purchase cost, full year",
  garment_value_kept_in_use: "Garment value in use, December",
  cost_of_unused_allocation: "Cost of unused garments, per week",
  garment_utilization: "Utilization, December",
  dormant_critical_sites: "Sites with garments unused too long",
  over_allocated_sites: "Sites with more garments than needed",
  repair_spike_sites: "Sites with a repair spike",
  on_time_cycle_rate: "On-time cycles",
  service_requests: "Service requests",
  service_requests_per_100_wearers: "Requests per 100 wearers",
};

/**
 * Chapters after the cover. The chapters of the picks come first in pick order, the rest follow in default order.
 * A chapter that serves both picks (water and emissions) is placed once and carries both.
 */
export function buildStory(picks: readonly Priority[]): StoryChapter[] {
  const chapters = CHAPTERS.map(({ serves, ...c }): StoryChapter => ({ ...c, picked: picks.filter((p) => serves.includes(p)) }));
  const first = picks.flatMap((p) => chapters.filter((c) => c.picked.includes(p)));
  const placed = [...new Set(first)];
  return [...placed, ...chapters.filter((c) => !placed.includes(c))];
}

/** A Fact as story text. A null value is "Needs input", never 0 or a placeholder. Only a card prints it; a sentence uses its `ifMissing` instead. */
export function factText(fact: Fact): string {
  if (fact.value === null) return NEEDS_INPUT;
  const v = formatCardValue(fact.value, fact.unit);
  return fact.unit === "%" ? `${v}%` : `${v} ${fact.unit}`;
}

/** Replaces `{{fact:id}}` with the Fact's text and `{baseline}` and `{sensitivity}` with their words. An unknown token throws instead of printing a blank. */
export function resolveLine(line: string, facts: readonly Fact[], words: { baseline: string; sensitivity: string }): string {
  return line
    .replace(/\{\{fact:([a-z0-9_]+)\}\}/g, (_, id: string) => {
      const fact = facts.find((f) => f.id === id);
      if (!fact) throw new Error(`Unknown story token: ${id}`);
      return factText(fact);
    })
    .replace("{baseline}", words.baseline)
    .replace("{sensitivity}", words.sensitivity);
}
