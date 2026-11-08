// The explanation registry (ADR 0028): what a figure or chart means, in plain words, keyed by Fact id or by a `chart:` / `panel:` id.
// Fixed template text, no digits: a number is a `{{fact:id}}` token, the selected comparison is `{comparison}`. Detail (formulas, ids, rules) stays in Show math.
// A sentence is plain text or `{ text, ifMissing }`: a sentence whose token can be unset (ADR 0016) carries the sentence to use instead, so a page never reads
// "cost Needs input". A plain sentence whose token has no value is left out.
import type { Fact } from "@/lib/engine";
import { resolveLine } from "@/lib/story";

export type Sentence = string | { text: string; ifMissing: string };
export type Template = readonly Sentence[];
export type Words = Record<string, string>;

const TOKEN = /\{\{fact:([a-z0-9_]+)\}\}/g;
const tokensOf = (s: string) => [...s.matchAll(TOKEN)].map((m) => m[1]);

/** Fills the template's tokens and words. Sentences are joined by a space. */
export function renderTemplate(t: Template, facts: readonly Fact[], words: Words): string {
  const hasValue = (id: string) => facts.find((f) => f.id === id)?.value != null;
  const fill = (s: string) => resolveLine(Object.entries(words).reduce((acc, [k, v]) => acc.replaceAll(`{${k}}`, v), s), facts, { baseline: "", sensitivity: "" });
  return t
    .flatMap((s) => {
      const [text, other] = typeof s === "string" ? [s, null] : [s.text, s.ifMissing];
      if (tokensOf(text).every(hasValue)) return [fill(text)];
      return other === null ? [] : [fill(other)];
    })
    .join(" ");
}

/** Every Fact id a template names. */
export const templateTokens = (t: Template): string[] => t.flatMap((s) => tokensOf(typeof s === "string" ? s : s.text));

export const EXPLAIN: Record<string, Template> = {
  // Footprint
  water_saved: ["The water the service did not use compared with {comparison}: {{fact:water_saved}} this year.", "It is the easiest environmental benefit for the customer to quote in their own reporting."],
  water_saved_pct: ["The same saving as a share of what {comparison} would have used: {{fact:water_saved_pct}} less.", "Handy when the customer wants a percentage rather than litres."],
  energy_saved: ["The energy the service did not use compared with {comparison}: {{fact:energy_saved}}.", "Lower energy use also lowers the customer's indirect emissions."],
  energy_saved_pct: ["The energy saving as a share of what {comparison} would have used: {{fact:energy_saved_pct}} less."],
  co2e_saved: ["Emissions avoided compared with {comparison}: {{fact:co2e_saved}}.", "It is net because delivery is counted, so the figure still holds if the customer asks about the trucks."],
  co2e_saved_pct: ["The net CO2e saving as a share of what {comparison} would have emitted: {{fact:co2e_saved_pct}} less."],
  "chart:co2e-comparison": ["What {comparison} would emit next to what the service emitted, washing and delivery together.", "The gap is the net saving: it shows where the customer's saving comes from, even after delivery."],
  // The sentence over the net CO2e chart and its home-washing note (not "i" text: `text:` keys are shown on the page).
  "text:co2e-comparison": ["The comparison, {comparison}, would have emitted {{fact:comparison_footprint}}.", "The Lindström service emitted {{fact:service_footprint}}, delivery included.", "The difference, {{fact:co2e_saved}}, is the net saving."],
  "text:co2e-no-delivery": ["{Comparison} has no delivery emissions, so all of the service's delivery counts against the saving."],
  "chart:water-energy-co2e": ["Water, energy and CO2e for {comparison} and for the service, side by side.", "It lets the customer see all three savings at once."],
  service_footprint: ["All emissions from washing and delivering this customer's garments: {{fact:service_footprint}}.", "It is the full cost to the climate, not only the saving."],
  service_footprint_per_tonne: ["Emissions for each tonne of laundry washed.", "It lets the customer compare with another service of a different size."],
  service_footprint_per_wearer: ["Emissions for each person who wore the garments.", "It makes the footprint easy to relate to headcount."],
  delivery_footprint: ["Emissions from the trucks that carry garments to and from the laundry: {{fact:delivery_footprint}}.", "Customers often ask about transport, and this answers it."],
  delivery_share: ["The part of the service's emissions that comes from delivery rather than washing: {{fact:delivery_share}}.", "A large share means further cuts lie in transport, not in washing."],
  recycling_reuse_share: ["The share of worn-out textiles that is recycled or reused instead of burned or dumped: {{fact:recycling_reuse_share}}.", "It supports the customer's waste goals."],
  // Costs
  avoided_purchase_cost: ["An estimate of what the customer did not have to spend on new garments because repairs kept old ones in use: {{fact:avoided_purchase_cost}}.", "It is a good point for a cost conversation."],
  replacements_postponed: ["How many garments did not need replacing yet because we repaired them: {{fact:replacements_postponed}}.", "We count each repair as one replacement put off. That is an estimate, so treat it as a fair indication, not an audited figure."],
  garment_value_kept_in_use: ["What the garments now in use would cost to buy new: {{fact:garment_value_kept_in_use}}.", "It is illustrative because it uses the example purchase prices in the data, not Lindström's real prices. It shows scale, not money saved."],
  cost_of_unused_allocation: [
    { text: "What garments that were set aside but not used cost each week: {{fact:cost_of_unused_allocation}}.", ifMissing: "What garments that were set aside but not used cost each week can be shown once Lindström provides a rental fee." },
    "We show no figure rather than a guess, so the customer is never misled.",
  ],
  "chart:unused-cost-by-site": [{ text: "Where garments that were set aside but not used cost the most each week.", ifMissing: "Where garments that were set aside but not used cost the most each week. The per-site cost appears once Lindström provides a rental fee." }],
  "chart:avoided-by-site": ["Where repairs avoided the most new purchases this year. It is an estimate."],
  "chart:avoided-trend": ["Avoided purchases month by month. It is an estimate."],
  // Garments
  garment_utilization: ["The share of garments set aside for wearers that were in use in December: {{fact:garment_utilization}}.", "Low use means the customer pays for garments nobody wears."],
  repairs: ["How many garments were repaired this year: {{fact:repairs}}.", "Repair keeps garments in service and avoids new purchases."],
  repairs_per_100_garments: ["Repairs relative to the number of garments, so sites and products of different size can be compared fairly."],
  service_requests: ["Requests the customer made to Lindström this year, such as a missing size or a change.", "A rising number can point to a gap in the service."],
  service_requests_per_100_wearers: ["Requests relative to the number of wearers, so sites of different size can be compared."],
  on_time_cycle_rate: ["The share of wash cycles finished when promised: {{fact:on_time_cycle_rate}}.", "It tells the customer whether they could count on clean garments on time."],
  "chart:utilization-by-site": ["December use at each site, lowest first, against the line below which garments count as under-used.", "It shows where to rebalance."],
  "chart:repair-by-product": ["Which products are repaired most, relative to how many exist.", "It points to products that may need to be sturdier."],
  "chart:repair-trend": ["Repairs month by month.", "It shows whether the repair load is rising or falling."],
  // Signals and Overview
  dormant_critical_sites: ["The number of sites where garments went a very long time between pickups: {{fact:dormant_critical_sites}}.", "It points to garments that may be stored rather than worn. This is about sites, never individual wearers."],
  over_allocated_sites: ["The number of sites where fewer garments were in use than were set aside: {{fact:over_allocated_sites}}.", "The customer could move or return garments and cut cost."],
  repair_spike_sites: ["The number of sites where repairs in a month jumped well above normal: {{fact:repair_spike_sites}}.", "Something changed there and it deserves a question."],
  "panel:needs-attention": ["The three things most worth raising in a meeting. Each links to the sites involved."],
  "chart:measure-trend": ["How water, CO2e, avoided cost and utilization moved month by month.", "It shows whether results are steady or changing."],
  "chart:dormant-by-site": ["Gaps between pickups at each site, grouped by how long garments waited.", "It counts gaps, never people."],
  "chart:repair-spike": ["A site's repairs by month. The dashed line marks the level above which a month counts as a spike."],
  // Sites
  "chart:heatmap-utilization": ["Each cell is a site in a month. Highlighted cells are months when fewer garments were in use than were set aside.", "It shows where and when garments were under-used."],
  "chart:heatmap-repairs": ["Each cell is a site in a month. Highlighted cells are months when repairs jumped well above the site's usual level.", "It shows where and when repairs spiked."],
  // Impact World (ADR 0031). `zone:` keys are the "i" text, `text:` keys are shown on the page. Every figure is an illustration, never audit-ready reporting.
  "zone:trees": [
    "A young tree takes in a known amount of carbon over ten years. Here the emissions are turned into the number of young trees that would take in the same amount.",
    { text: "{Comparison} would need {{fact:trees_comparison}}. The Lindström service, delivery included, needs {{fact:trees_service}}. The difference is {{fact:trees_saved}} saved.", ifMissing: "The tree figures can be shown once the carbon figures are available." },
    "It is an illustration to make a carbon figure easier to picture, not a measurement and not audit-ready reporting.",
  ],
  "text:world-hub": ["Pick a part of the world to see what the Lindström service changed compared with {comparison}.", "The pictures illustrate the figures. They are not audit-ready reporting."],
  "text:trees-saving": ["{Comparison} would need {{fact:trees_comparison}} to take in its emissions. The Lindström service needs {{fact:trees_service}}, so {{fact:trees_saved}} are saved."],
  "text:trees-more": ["The Lindström service needs {{fact:trees_service}} to take in its emissions, which is more than the {{fact:trees_comparison}} {comparison} would need. With this comparison there is no saving in trees."],
  "text:trees-needs-input": ["The tree figures cannot be shown yet because a carbon figure is missing."],
  // Story only
  "chart:requests-trend": ["Requests the customer made to Lindström, month by month.", "It shows whether the customer needed more help as the year went on."],
  "finding:crosscheck": ["A check on the data found rows that did not agree with each other.", "They are counted and handled in the build and reported here, so the figures can be trusted."],
  "chart:site-vs-customer": ["How this site compares with all the customer's sites on the main figures.", "It shows whether the site is typical."],
};

/** Words that must not appear on a dashboard screen as labels, intros, captions or explanations (they live in Show math). */
export const BANNED_ON_SCREEN = /\bFacts?\b|\b[TA]\d{3}\b|baseline|assumptions? config|\btiers?\b|trailing average|\bcritical\b|\bdormant\b|cut-off/i;

/** The keys the review list names: every one must have an explanation. */
export const EXPLAINED_KEYS = Object.keys(EXPLAIN).filter((k) => !k.startsWith("text:"));

/** The facts whose value can be unset today (ADR 0016); a sentence naming one carries an `ifMissing` variant. */
export const CAN_BE_UNSET = ["cost_of_unused_allocation"] as const;

/** Plain phrase for what a team-supplied unknown is, by T id. */
const NEEDS: Record<string, string> = { T001: "a rental fee from Lindström", T002: "the size of the estimate range from the team" };

/** The hint for a figure with no value, in plain words. The assumption id stays in Show math. */
export function needsInputHint(fact: Pick<Fact, "assumptionIds">): string {
  const id = fact.assumptionIds.find((a) => a.startsWith("T") && NEEDS[a]);
  return `Needs ${id ? NEEDS[id] : "an input from the team"}.`;
}

/** The heatmap legend, by measure: what a highlighted cell means. `{cutoff}`, `{ratio}`, `{window}` and `{floor}` come from engine values; `{period}` is the year. */
export const HEATMAP_LEGEND = {
  garment_utilization: { set: "Highlighted: a month in {period} when fewer than {cutoff} of the garments set aside were in use.", unset: "No month is highlighted yet: the line for under-use is not set." },
  repairs: { set: "Highlighted: a month in {period} when repairs were at least {ratio} times the site's average of the {window} months before it, and {floor} or more above that average. The first {window} months have no average to compare with." },
} as const;

/** Fills `{word}` placeholders (the legend, like intros fill `{customer}` and `{period}`). A word left over is a bug the tests catch. */
export const fillWords = (s: string, words: Record<string, string>) => Object.entries(words).reduce((acc, [k, v]) => acc.replaceAll(`{${k}}`, v), s);

/** A page's lookup: the "i" text for a key, tokens resolved from `facts` and the page's words; "" for a key without one. */
export const explainer = (facts: readonly Fact[], words: Words) => (key: string): string => (EXPLAIN[key] ? renderTemplate(EXPLAIN[key], facts, words) : "");
