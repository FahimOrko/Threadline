import { CompanyPicker } from "@/components/company-picker";
import { HowWeGotHere } from "@/components/how-we-got-here";
import { FigurePanel, pick } from "@/components/figure-panel";
import { PartBar, Ring } from "@/components/charts-simple";
import { Notice } from "@/components/notice";
import { TreesStage } from "@/components/trees-stage";
import { WorldGate } from "@/components/world-gate";
import { WorldHeader } from "@/components/world-header";
import { WorldHub } from "@/components/world-hub";
import { ZoneLayout } from "@/components/zone-layout";
import { generatedSource } from "@/lib/data/generated";
import { baselineShortName, footprintFacts, percentageFacts, treeFacts, type Fact } from "@/lib/engine";
import { EXPLAIN, explainer, renderTemplate } from "@/lib/explain";
import { resolveView } from "@/lib/selection";
import { CUSTOMER_VIEW_QUESTION, GAME_PATH, WORLD_HINT, gameHref, resolveState } from "@/lib/story/game";
import { WORLD_PATH, resolveZone, worldHref, ZONES } from "@/lib/world";
import { PERIOD } from "../story/_story-document";

/** The Impact World page (ADR 0031) behind the customer-view gate (ADR 0033). The KAM view is never gated. Reads runtime data, so the caller wraps it in Suspense. */
export async function WorldView({ searchParams }: { searchParams: PageProps<"/world">["searchParams"] }) {
  const params = await searchParams;
  const customer = Array.isArray(params.customer) ? params.customer[0] : params.customer;
  return (
    <WorldGate view={resolveView(params.view)} customer={customer ?? null} ended={params.ended === "1"} hint={WORLD_HINT} gameHref={gameHref(GAME_PATH, params, { zone: null, ended: null })}>
      <WorldBody searchParams={searchParams} />
    </WorldGate>
  );
}

/** The Impact World page body (ADR 0031): everything resolved from the address. */
async function WorldBody({ searchParams }: { searchParams: PageProps<"/world">["searchParams"] }) {
  const [data, params] = await Promise.all([generatedSource.load(), searchParams]);
  const view = resolveView(params.view);
  const baselines = data.baselines.map((b) => ({ baseline_id: b.baseline_id, name: baselineShortName(b) }));

  // The customer view has no switcher: with no company in the address the page asks, like the game does.
  if (view === "customer" && params.customer === undefined) {
    return (
      <CompanyPicker
        question={CUSTOMER_VIEW_QUESTION}
        options={data.customers.map((c) => ({ id: c.customer_id, label: c.customer_name, href: gameHref(WORLD_PATH, params, { customer: c.customer_id }) }))}
      />
    );
  }

  const st = resolveState(data, params);
  const { zone, rejected: badZone } = resolveZone(params.zone);
  const notices = [...st.notices.filter((n) => !n.startsWith("Not used as priorities")), ...(badZone !== null ? [`"${badZone}" is not a zone, so all zones are shown instead.`] : [])];

  const scope = { customerId: st.customer.customer_id, period: PERIOD };
  const footprint = footprintFacts(data, scope, st.baseline, st.sensitivity);
  const trees = treeFacts(footprint);
  const facts: Fact[] = [...footprint, ...percentageFacts(data, scope), ...trees.facts];
  const words = { comparison: st.short, Comparison: `${st.short[0].toUpperCase()}${st.short.slice(1)}` };
  const explain = explainer(facts, words);
  const text = (key: string) => renderTemplate(EXPLAIN[key], facts, words);
  const byId = (id: string) => facts.find((f) => f.id === id);
  const hub = worldHref(params, null);

  let body: React.ReactNode;
  if (zone?.id === "trees") {
    const [comparison, service, saved, scale] = ["trees_comparison", "trees_service", "trees_saved", "tree_icon_scale"].map(byId);
    const pct = byId("co2e_saved_pct");
    if (!comparison || !service || !saved || !scale || !trees.stage) {
      body = (
        <div className="space-y-6">
          <ZoneLayout name={zone.name} text={text("text:trees-needs-input")} info={explain("zone:trees")} backHref={hub} stage={<TreesStage stage={null} comparison={comparison ?? placeholder} service={service ?? placeholder} saved={saved ?? placeholder} scale={scale ?? placeholder} comparisonName={st.short} />} card={null} />
          <HowWeGotHere steps={treeSteps(facts, st.short, false)} />
        </div>
      );
    } else {
      const more = trees.stage.extraIcons > 0;
      const fig = pick(facts, explain);
      body = (
        <div className="space-y-6">
        <ZoneLayout
          name={zone.name}
          text={text(more ? "text:trees-more" : "text:trees-saving")}
          info={explain("zone:trees")}
          mathFact={more ? service : saved}
          backHref={hub}
          stage={<TreesStage stage={trees.stage} comparison={comparison} service={service} saved={saved} scale={scale} comparisonName={st.short} />}
          card={
            <FigurePanel
              title="Trees"
              hero={more ? { fact: service, label: "Young trees Lindström needs", animate: true } : { fact: saved, label: "Young trees equal to the avoided emissions", animate: true, explain: explain("zone:trees") }}
              aside={!more && pct?.value != null ? <Ring percent={pct.value} label="Share of the comparison's emissions avoided" /> : undefined}
              visual={!more && service.value !== null && saved.value !== null ? <PartBar label="Young trees for Lindström and for the avoided emissions" parts={[{ label: "For Lindström's emissions", value: service.value, unit: "young trees" }, { label: "For the avoided emissions", value: saved.value, unit: "young trees" }]} /> : undefined}
              stats={[...fig("trees_comparison", { label: `Needed for ${st.short}` }), ...(more ? [] : fig("trees_service", { label: "Needed with Lindström" })), ...(!more && pct ? [{ fact: pct, label: "Share avoided" }] : [])]}
            />
          }
        />
        <HowWeGotHere steps={treeSteps(facts, st.short, more)} />
        </div>
      );
    }
  } else {
    body = (
      <div className="space-y-4">
        <p className="mx-auto max-w-[70ch] text-center text-sm text-muted-foreground">{text("text:world-hub")}</p>
        <WorldHub zones={ZONES} facts={facts} customerName={st.customer.customer_name} hrefFor={(z) => worldHref(params, z.id)} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <WorldHeader customerName={st.customer.customer_name} period={`${PERIOD.from.slice(0, 4)}`} baselines={baselines} changeHref={view === "customer" ? gameHref(WORLD_PATH, params, { customer: null, zone: null }) : undefined} />
      {notices.map((n) => (
        <Notice key={n}>{n}</Notice>
      ))}
      {body}
    </div>
  );
}

/** The three steps behind the Trees headline (step 1 weight, 2 emissions, 3 trees). Facts only; a Fact the engine did not produce is a stand-in that reads "Needs input". */
function treeSteps(facts: Fact[], comparison: string, more: boolean) {
  const f = (id: string, unit = "kg") => facts.find((x) => x.id === id) ?? { ...placeholder, id, unit };
  return [
    { title: "Garments washed", text: "We start with the weight of the garments we washed for you over the year.", figures: [{ fact: f("washed_kg"), label: "Washed" }] },
    {
      title: "CO2e from washing",
      text: `Washing that weight gives off greenhouse gases, counted as CO2e. Here are both ways, delivery included: our service and ${comparison}.`,
      figures: [
        { fact: f("service_footprint", "kgCO2e"), label: "With Lindström" },
        { fact: f("comparison_footprint", "kgCO2e"), label: `With ${comparison}` },
      ],
    },
    {
      title: more ? "Extra young trees" : "Young trees",
      text: more
        ? "With this comparison Lindström gives off more, so the difference is extra emissions, shown as young trees. We divide it by what one young tree absorbs in ten years."
        : "We take the difference between the two and divide it by what one young tree absorbs in ten years. That gives the number of young trees.",
      figures: [
        { fact: f("tree_factor", "tCO2e"), label: "One young tree absorbs" },
        more ? { fact: f("trees_extra", "young trees"), label: "Extra young trees" } : { fact: f("trees_saved", "young trees"), label: "Young trees equal to the avoided emissions" },
      ],
    },
  ];
}

// A Fact stand-in for the stage when the engine produced none (no washed kg): it carries no value, so the stage reads "Needs input".
const placeholder: Fact = { id: "none", label: "", value: null, unit: "trees", methods: ["ILLUSTRATIVE"], source: "PUBLIC_REFERENCE", assumptionIds: [], confidence: "", formula: "", inputs: [], scope: { customerId: "", customerName: "" }, period: PERIOD, baseline: null, range: { low: null, base: null, high: null } };
