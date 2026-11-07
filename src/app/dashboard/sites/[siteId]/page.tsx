import { explainer } from "@/lib/explain";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SiteCrumb } from "@/components/app-header";
import { ChartFrame, seriesMath, seriesTable } from "@/components/chart-frame";
import { ThreadLine } from "@/components/charts-recharts";
import { BarList, PairedBars } from "@/components/charts-simple";
import { factShowMath } from "@/components/fact-stat-card";
import { FigurePanel, InlineStat, pick } from "@/components/figure-panel";
import { Panel } from "@/components/panel";
import { ChipLegend } from "@/components/provenance-chip";
import { BackToSites } from "@/components/site-links";
import { StatCardSkeleton } from "@/components/states";
import { PERIOD } from "@/lib/dashboard";
import { productName } from "@/lib/dashboard-data";
import { resolveCustomer } from "@/lib/customer";
import { generatedSource } from "@/lib/data/generated";
import { monthlySeries, repairRateByProduct, siteComparison, siteFacts } from "@/lib/engine";
import { formatCardValue, formatPeriod } from "@/lib/format";
import { resolveBaseline, resolveSensitivity } from "@/lib/selection";

// params and searchParams are runtime data, so they are read inside Suspense and the skeleton prerenders.
export default function Page({ params, searchParams }: PageProps<"/dashboard/sites/[siteId]">) {
  return (
    <Suspense
      fallback={
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      }
    >
      <SiteContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

const Heading = ({ children }: { children: React.ReactNode }) => <h2 className="text-base font-medium">{children}</h2>;

async function SiteContent({
  params,
  searchParams,
}: Pick<PageProps<"/dashboard/sites/[siteId]">, "params" | "searchParams">) {
  const [data, { siteId }, query] = await Promise.all([generatedSource.load(), params, searchParams]);
  const { customer, rejected } = resolveCustomer(query.customer, data.customers);
  // A site of another customer is as unknown as a missing one.
  const site = data.sites.find((s) => s.site_id === siteId && s.customer_id === customer.customer_id);
  if (!site) notFound();
  const laundry = data.laundries.find((l) => l.laundry_id === site.primary_laundry_id);
  const scope = { customerId: customer.customer_id, period: PERIOD, siteId: site.site_id };
  const facts = siteFacts(data, scope);
  const all = [...facts.operational, ...facts.value, ...facts.percentages];
  const explain = explainer(all, {});
  const fig = pick(all, explain);
  const comparison = siteComparison(data, scope);
  const rates = repairRateByProduct(data, scope);
  const repairs = monthlySeries(data, scope, "repairs");
  const back = { customer: customer.customer_id, baseline: resolveBaseline(query.baseline, data.baselines).baseline.baseline_id, sensitivity: resolveSensitivity(query.sensitivity).sensitivity };
  const [repairsFact, avoided] = ["repairs", "avoided_purchase_cost"].map((id) => all.find((f) => f.id === id));
  const summary = [...fig("active_wearers", { label: "Active wearers" }), ...fig("garments_in_circulation", { label: "Garments in circulation" }), ...fig("garment_utilization", { label: "Utilization, December" }), ...fig("on_time_cycle_rate", { label: "On-time cycles" })];
  return (
    <div className="space-y-6">
      <SiteCrumb name={site.site_name} />
      <BackToSites params={back} />
      {rejected !== null && (
        <Panel role="status">
          <p className="text-sm">
            &quot;{rejected}&quot; is not a known customer, so {customer.customer_name} is shown instead.
          </p>
        </Panel>
      )}
      <Panel className="@container space-y-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">{site.site_name}</h1>
          <p className="text-sm text-muted-foreground">
            {site.site_type} · {laundry?.laundry_name ?? site.primary_laundry_id} · {customer.customer_name} · {formatPeriod(PERIOD)}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t pt-3 @[34rem]:grid-cols-4">
          {summary.map((s) => (
            <InlineStat key={s.fact.id} {...s} />
          ))}
        </div>
      </Panel>
      <div className="@container space-y-6">
        {comparison.length > 0 && (
          <section className="space-y-3">
            <Heading>Garments and use</Heading>
            <ChartFrame
              title="How does this site sit against the customer?"
              explain={explain("chart:site-vs-customer")}
              caption={`This site next to all ${customer.customer_name} sites.`}
              summary={`${comparison.map((c) => `${c.title}: ${formatCardValue(c.site.value ?? 0, c.site.unit)} at this site, ${formatCardValue(c.customer.value ?? 0, c.customer.unit)} for all sites`).join("; ")}.`}
              table={{ caption: "This site against the customer", head: ["Measure", "This site", "All sites"], rows: comparison.map((c) => [c.title, formatCardValue(c.site.value ?? 0, c.site.unit), formatCardValue(c.customer.value ?? 0, c.customer.unit)]) }}
              math={factShowMath(comparison[0].site)}
            >
              <PairedBars rows={comparison.map((c) => ({ key: c.id, title: c.title, a: { label: "All sites", value: c.customer.value ?? 0 }, b: { label: "This site", value: c.site.value ?? 0 }, unit: c.site.unit }))} />
            </ChartFrame>
          </section>
        )}
        <section className="space-y-3">
          <Heading>Costs and service</Heading>
          <div className="grid gap-3 @[44rem]:auto-rows-fr @[44rem]:grid-cols-2">
            {avoided && <FigurePanel title="Costs" hero={{ fact: avoided, label: "Purchases avoided, full year", explain: explain(avoided.id) }} stats={[...fig("garment_value_kept_in_use", { label: "Garment value in use" }), ...fig("cost_of_unused_allocation", { label: "Cost of unused garments, per week" })]} />}
            {fig("service_requests").length > 0 && <FigurePanel title="Service" hero={fig("service_requests", { label: "Service requests" })[0]} stats={fig("service_requests_per_100_wearers", { label: "Per 100 wearers" })} />}
          </div>
        </section>
        <section className="space-y-3">
          <Heading>Repairs</Heading>
          <div className="grid gap-3 @[44rem]:auto-rows-fr @[44rem]:grid-cols-2">
            {repairsFact && <FigurePanel title="Repairs" hero={{ fact: repairsFact, label: "Repairs, full year", explain: explain(repairsFact.id) }} stats={fig("replacements_postponed", { label: "Replacements postponed" })} />}
            {rates.length > 0 && (
              <ChartFrame
                title="Which products need the most repair?"
                explain={explain("chart:repair-by-product")}
                caption="Full-year repairs per 100 garments in December, by product."
                summary={`Repairs per 100 garments for ${rates.length} products at this site.`}
                table={{ caption: "Repairs per 100 garments by product", head: ["Product", "Repairs per 100 garments"], rows: rates.map((f) => [productName(f.label), formatCardValue(f.value ?? 0, f.unit)]) }}
                math={factShowMath(rates[0])}
              >
                <BarList unit="per 100 garments" rows={[...rates].sort((a, b) => (b.value ?? 0) - (a.value ?? 0)).map((f) => ({ key: f.id, label: productName(f.label), value: f.value }))} />
              </ChartFrame>
            )}
          </div>
          <ChartFrame title="Is this site's repair load rising or falling?" explain={explain("chart:repair-trend")} caption="Repairs per month, all products." summary="Monthly repairs at this site over the year; the same numbers are in the table." table={seriesTable("Repairs by month, this site", [repairs])} math={seriesMath(repairs.fact)}>
            <ThreadLine points={repairs.points} unit={repairs.unit} />
          </ChartFrame>
        </section>
      </div>
      <ChipLegend methods={["MEASURED", "CALCULATED", "ESTIMATED"]} sources={["SYNTHETIC", "ASSUMPTION"]} />
      <p className="max-w-[65ch] text-xs text-muted-foreground">
        Not shown for a single site: delivery sites (always one), recycling and reuse share (waste is allocated to the customer per laundry, not per site) and the footprint (the data has no split by site). Those figures are customer-level on the dashboard.
      </p>
    </div>
  );
}
