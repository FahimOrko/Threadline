import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SiteCrumb } from "@/components/app-header";
import { FactStatCard } from "@/components/fact-stat-card";
import { Panel } from "@/components/panel";
import { SectionHeader } from "@/components/section-header";
import { StatCardSkeleton } from "@/components/states";
import { resolveCustomer } from "@/lib/customer";
import { generatedSource } from "@/lib/data/generated";
import { PERIOD } from "@/lib/dashboard";
import { siteComparison, siteFacts } from "@/lib/engine";
import { formatPeriod } from "@/lib/format";

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
  const comparison = siteComparison(data, scope);
  const sections = [
    { title: "Operations", description: "Wearers and garments are December 2025; repairs and requests are the full year.", facts: facts.operational },
    {
      title: "Money and utilization",
      description: "Avoided cost is the full year; value kept in use, unused allocation and utilization are December 2025.",
      facts: facts.value,
    },
    { title: "Percentages", description: "On-time rate is over this site's sampled cycles; repairs per 100 garments are full-year repair events over December pieces.", facts: facts.percentages },
  ];
  return (
    <div className="space-y-6">
      <SiteCrumb name={site.site_name} />
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{site.site_name}</h1>
        <p className="text-sm text-muted-foreground">
          {site.site_type} · {laundry?.laundry_name ?? site.primary_laundry_id} · {customer.customer_name} · {formatPeriod(PERIOD)}
        </p>
      </div>
      {rejected !== null && (
        <Panel role="status">
          <p className="text-sm">
            &quot;{rejected}&quot; is not a known customer, so {customer.customer_name} is shown instead.
          </p>
        </Panel>
      )}
      {comparison.length > 0 && (
        <section className="space-y-4">
          <SectionHeader title="This site vs the customer" description={`Each pair is this site next to all ${customer.customer_name} sites.`} />
          {comparison.map((c) => (
            <div key={c.id} className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">{c.title}</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <FactStatCard fact={c.site} />
                <FactStatCard fact={c.customer} />
              </div>
            </div>
          ))}
        </section>
      )}
      {sections.map((s) => (
        <section key={s.title} className="space-y-4">
          <SectionHeader title={s.title} description={s.description} />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {s.facts.map((f) => (
              <FactStatCard key={f.id} fact={f} />
            ))}
          </div>
        </section>
      ))}
      <p className="max-w-[65ch] text-sm text-muted-foreground">
        Not shown for a single site: delivery sites (always one), recycling and reuse share (waste is allocated to the customer per laundry, not per site) and the footprint (the data has no split by site). Those figures are customer-level on the dashboard.
      </p>
    </div>
  );
}
