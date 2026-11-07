// The deterministic story (ADR 0019). A template over `{{fact:id}}` tokens: it selects, orders and phrases, and computes nothing.
// Numbers are resolved from engine Facts at render and rounded only there (ADR 0005); a null Fact reads "Needs input" (ADR 0016).
import type { Fact } from "@/lib/engine";
import { formatCardValue } from "@/lib/format";
import type { Priority } from "@/lib/selection";

export const NEEDS_INPUT = "Needs input";

export type StoryChapter = {
  id: string;
  title: string;
  /** Template lines; `{baseline}` and `{sensitivity}` are plain words, numbers are `{{fact:id}}` tokens. */
  lines: string[];
  /** Fact ids shown as cards under the lines, in order. */
  cards: string[];
  /** The reader's picks this chapter serves (empty = not a priority). */
  picked: Priority[];
  /** Show the risk observations under this chapter. */
  observations?: "risk";
};

type ChapterDef = Omit<StoryChapter, "picked"> & { serves: Priority[]; emissionsLeadCards?: string[] };

const WATER_CARBON_CARDS = ["water_saved", "water_saved_pct", "energy_saved", "energy_saved_pct", "co2e_saved", "co2e_saved_pct", "delivery_footprint", "delivery_share"];

// Default order after the cover. Methodology and Data readiness always follow these and are not part of the list.
const CHAPTERS: ChapterDef[] = [
  {
    id: "numbers",
    title: "Your year in numbers",
    serves: [],
    lines: ["{{fact:delivery_sites}} were served for {{fact:active_wearers}}, with {{fact:garments_in_circulation}} in circulation."],
    cards: ["delivery_sites", "active_wearers", "garments_in_circulation"],
  },
  {
    id: "circularity",
    title: "What we kept out of the bin",
    serves: ["circularity"],
    lines: ["The year brought {{fact:repairs}}, which postponed {{fact:replacements_postponed}}. {{fact:recycling_reuse_share}} of textile waste was recycled or reused."],
    cards: ["repairs", "replacements_postponed", "recycling_reuse_share"],
  },
  {
    id: "water-carbon",
    title: "Water and carbon",
    serves: ["water", "emissions"],
    lines: [
      "Against {baseline} at {sensitivity} sensitivity, the service saved {{fact:water_saved}} of water, {{fact:energy_saved}} of energy and {{fact:co2e_saved}}, a {{fact:co2e_saved_pct}} cut.",
      "Delivery emits {{fact:delivery_footprint}}, {{fact:delivery_share}} of service emissions. The net saving above already includes it.",
    ],
    cards: WATER_CARBON_CARDS,
    emissionsLeadCards: ["co2e_saved", "co2e_saved_pct", "delivery_footprint", "delivery_share", "water_saved", "water_saved_pct", "energy_saved", "energy_saved_pct"],
  },
  {
    id: "euros",
    title: "What it means in euros",
    serves: ["cost"],
    lines: ["Repairs avoided {{fact:avoided_purchase_cost}} of garment purchases, and {{fact:garment_value_kept_in_use}} of garment value is kept in use. Cost of unused allocation: {{fact:cost_of_unused_allocation}}."],
    cards: ["avoided_purchase_cost", "garment_value_kept_in_use", "cost_of_unused_allocation", "garment_utilization"],
  },
  {
    id: "risk",
    title: "Where we see risk",
    serves: ["hygiene"],
    lines: ["Garment signals show where hygiene and availability need attention: {{fact:dormant_critical_sites}} with Critical dormant garments, {{fact:over_allocated_sites}} over-allocated and {{fact:repair_spike_sites}} with a repair spike."],
    cards: ["dormant_critical_sites", "over_allocated_sites", "repair_spike_sites"],
    observations: "risk",
  },
  {
    id: "service",
    title: "Service and reliability",
    serves: ["service"],
    lines: ["{{fact:on_time_cycle_rate}} of sampled cycles ran on time, and wearers raised {{fact:service_requests}} ({{fact:service_requests_per_100_wearers}})."],
    cards: ["on_time_cycle_rate", "service_requests", "service_requests_per_100_wearers"],
  },
];

/**
 * Chapters after the cover. The chapters of the picks come first in pick order, the rest follow in default order.
 * A chapter that serves both picks (water and emissions) is placed once and carries both; picking emissions without water leads with the CO2e cards.
 */
export function buildStory(picks: readonly Priority[]): StoryChapter[] {
  const chapters = CHAPTERS.map(({ serves, emissionsLeadCards, ...c }): StoryChapter => {
    const picked = picks.filter((p) => serves.includes(p));
    const lead = emissionsLeadCards && picked.includes("emissions") && !picked.includes("water");
    return { ...c, cards: lead ? emissionsLeadCards : c.cards, picked };
  });
  const first = picks.flatMap((p) => chapters.filter((c) => c.picked.includes(p)));
  const placed = [...new Set(first)];
  return [...placed, ...chapters.filter((c) => !placed.includes(c))];
}

/** A Fact as story text. A null value is "Needs input", never 0 or a placeholder. */
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
      if (!fact) throw new Error(`Story token {{fact:${id}}} has no matching Fact`);
      return factText(fact);
    })
    .replace("{baseline}", words.baseline)
    .replace("{sensitivity}", words.sensitivity);
}
