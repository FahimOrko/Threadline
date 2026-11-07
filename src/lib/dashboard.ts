// The dashboard's six sections (ADR 0023): route, subheading and the fixed intro template. Pure data and selection, no numbers computed here (ADR 0005).
// Every number in an intro is a `{{fact:id}}` token resolved by the story's resolveLine; `{customer}` and `{period}` are plain words the page fills.
import type { AppData } from "@/lib/data/schemas";
import { operationalFacts, percentageFacts, valueFacts, type Fact, type OperationalScope } from "@/lib/engine";
import { resolveLine } from "@/lib/story";

// Full year 2025, fixed in this version. Every engine call takes it as an argument, so a period picker only changes this.
export const PERIOD = { from: "2025-01", to: "2025-12" };

export type SectionSlug = "overview" | "garments" | "costs" | "footprint" | "signals" | "sites";

export type DashboardSection = { slug: SectionSlug; href: string; label: string; subheading: string; intro: string };

export const SECTIONS: DashboardSection[] = [
  {
    slug: "overview",
    href: "/dashboard",
    label: "Overview",
    subheading: "What this dashboard shows",
    intro:
      "This is {customer}'s {period} with Lindström. We looked after garments for {{fact:active_wearers}} at {{fact:delivery_sites}}, keeping {{fact:garments_in_circulation}} in use. The pages on the left go deeper: garments, costs, the environment, things worth acting on and each site. Each figure has a \"Show math\" link that says where it comes from.",
  },
  {
    slug: "garments",
    href: "/dashboard/garments",
    label: "Garments and utilization",
    subheading: "How the garments are used",
    intro:
      "Garments only create value when they are worn. Here {{fact:garments_in_circulation}} garments are shared among {{fact:active_wearers}}, and {{fact:garment_utilization}} of them are in use. Repairs, such as {{fact:repairs}} this year, keep garments in service longer.",
  },
  {
    slug: "costs",
    href: "/dashboard/costs",
    label: "Costs",
    subheading: "What the service saved in purchases",
    intro:
      "Buying garments is a cost the customer avoids when Lindström keeps them in circulation. {{fact:avoided_purchase_cost}} of purchases were avoided this year, and {{fact:garment_value_kept_in_use}} of garment value is still in use. Pieces allocated but not used cost {{fact:cost_of_unused_allocation}}, which is where the customer can save more.",
  },
  {
    slug: "footprint",
    href: "/dashboard/footprint",
    label: "Environmental footprint",
    subheading: "What the service saved the environment",
    intro:
      "Compared with {baseline}, using the {sensitivity}, the service saved {{fact:water_saved}} of water, {{fact:energy_saved}} of energy and {{fact:co2e_saved}}. Delivery is {{fact:delivery_share}} of the service's own emissions. Baseline values are illustrative, so the savings move with the estimate chosen.",
  },
  {
    slug: "signals",
    href: "/dashboard/signals",
    label: "Signals",
    subheading: "Where to look first",
    intro:
      "The data points to a few places that deserve a conversation. Pieces sitting unused for long, sites with too few garments for their wearers and sudden repair spikes show up here. Each one links to the site, so the KAM can check the story before raising it.",
  },
  {
    slug: "sites",
    href: "/dashboard/sites",
    label: "Sites",
    subheading: "Compare your sites",
    intro: "Each site is a place where garments are worn. Compare them here, then open one to see its own numbers. Wearers and garments are December {period}; repairs and requests are the full year.",
  },
];

export const section = (slug: SectionSlug) => SECTIONS.find((s) => s.slug === slug)!;

/** The intro with its words and Fact tokens filled in. A token without a Fact throws; a null Fact reads "Needs input". */
export function sectionIntro(slug: SectionSlug, facts: readonly Fact[], words: { customer: string; period: string; baseline: string; sensitivity: string }): string {
  const text = section(slug).intro.replaceAll("{customer}", words.customer).replaceAll("{period}", words.period);
  return resolveLine(text, facts, words);
}

const byId = (facts: Fact[], ids: (id: string) => boolean) => facts.filter((f) => ids(f.id));

/** Each existing non-footprint Fact on exactly one page. The footprint page shows the footprint groups and the recycling share from `footprint`. */
export function sectionFacts(data: AppData, scope: OperationalScope) {
  const operational = operationalFacts(data, scope);
  const value = valueFacts(data, scope);
  const percentage = percentageFacts(data, scope);
  const costs = [...byId(value, (id) => id !== "garment_utilization"), ...byId(operational, (id) => id === "replacements_postponed")];
  const garments = [
    ...byId(value, (id) => id === "garment_utilization"),
    ...byId(operational, (id) => ["repairs", "service_requests", "service_requests_per_100_wearers"].includes(id)),
    ...byId(percentage, (id) => id !== "recycling_reuse_share"),
  ];
  return {
    overview: byId(operational, (id) => ["delivery_sites", "active_wearers", "garments_in_circulation"].includes(id)),
    garments,
    costs,
    footprint: byId(percentage, (id) => id === "recycling_reuse_share"),
    // The Facts the intro tokens may name, from every page's group.
    tokens: [...operational, ...value],
  };
}
