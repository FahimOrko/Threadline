import { CompanyPicker } from "@/components/company-picker";
import { FigurePanel, pick } from "@/components/figure-panel";
import { PartBar, Ring } from "@/components/charts-simple";
import { Notice } from "@/components/notice";
import { TreesStage } from "@/components/trees-stage";
import { WorldHeader } from "@/components/world-header";
import { WorldHub } from "@/components/world-hub";
import { ZoneLayout } from "@/components/zone-layout";
import { generatedSource } from "@/lib/data/generated";
import { baselineShortName, footprintFacts, percentageFacts, treeFacts, type Fact } from "@/lib/engine";
import { EXPLAIN, explainer, renderTemplate } from "@/lib/explain";
import { resolveView } from "@/lib/selection";
import { CUSTOMER_VIEW_QUESTION, gameHref, resolveState } from "@/lib/story/game";
import { WORLD_PATH, resolveZone, worldHref, ZONES } from "@/lib/world";
import { PERIOD } from "../story/_story-document";

/** The Impact World page body (ADR 0031): everything resolved from the address. Reads runtime data, so the caller wraps it in Suspense. */
export async function WorldView({ searchParams }: { searchParams: PageProps<"/world">["searchParams"] }) {
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
      body = <ZoneLayout name={zone.name} text={text("text:trees-needs-input")} info={explain("zone:trees")} backHref={hub} stage={<TreesStage stage={null} comparison={comparison ?? placeholder} service={service ?? placeholder} saved={saved ?? placeholder} scale={scale ?? placeholder} comparisonName={st.short} />} card={null} />;
    } else {
      const more = trees.stage.extraIcons > 0;
      const fig = pick(facts, explain);
      body = (
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
              hero={more ? { fact: service, label: "Trees Lindström needs", animate: true } : { fact: saved, label: "Trees saved", animate: true, explain: explain("zone:trees") }}
              aside={!more && pct?.value != null ? <Ring percent={pct.value} label="Share of the comparison's trees saved" /> : undefined}
              visual={!more && service.value !== null && saved.value !== null ? <PartBar label="Trees needed with Lindström and trees not needed" parts={[{ label: "Needed with Lindström", value: service.value, unit: "trees" }, { label: "Not needed", value: saved.value, unit: "trees" }]} /> : undefined}
              stats={[...fig("trees_comparison", { label: `Needed for ${st.short}` }), ...(more ? [] : fig("trees_service", { label: "Needed with Lindström" })), ...(!more && pct ? [{ fact: pct, label: "Share saved" }] : [])]}
            />
          }
        />
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

// A Fact stand-in for the stage when the engine produced none (no washed kg): it carries no value, so the stage reads "Needs input".
const placeholder: Fact = { id: "none", label: "", value: null, unit: "trees", methods: ["ILLUSTRATIVE"], source: "PUBLIC_REFERENCE", assumptionIds: [], confidence: "", formula: "", inputs: [], scope: { customerId: "", customerName: "" }, period: PERIOD, baseline: null, range: { low: null, base: null, high: null } };
