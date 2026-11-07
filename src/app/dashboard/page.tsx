import { Suspense } from "react";
import { FactStatCard } from "@/components/fact-stat-card";
import { Panel } from "@/components/panel";
import { SectionHeader } from "@/components/section-header";
import { StatCardSkeleton } from "@/components/states";
import { SiteTable, SiteTableSkeleton } from "@/components/site-table";
import { resolveCustomer } from "@/lib/customer";
import { generatedSource } from "@/lib/data/generated";
import { operationalFacts, operationalSiteRows, percentageFacts, valueFacts } from "@/lib/engine";
import { formatPeriod } from "@/lib/format";

// Full year 2025, fixed in this version. Every engine call takes it as an argument, so a period picker only changes this.
const PERIOD = { from: "2025-01", to: "2025-12" };

// searchParams is runtime data, so it is read inside Suspense and the heading and skeleton prerender.
export default function Page({ searchParams }: PageProps<"/dashboard">) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <StatCardSkeleton key={i} />
              ))}
            </div>
            <SiteTableSkeleton />
          </div>
        }
      >
        <DashboardContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function DashboardContent({ searchParams }: { searchParams: PageProps<"/dashboard">["searchParams"] }) {
  const [data, params] = await Promise.all([generatedSource.load(), searchParams]);
  const { customer, rejected } = resolveCustomer(params.customer, data.customers);
  const scope = { customerId: customer.customer_id, period: PERIOD };
  const facts = operationalFacts(data, scope);
  return (
    <div className="space-y-6">
      {rejected !== null && (
        <Panel role="status">
          <p className="text-sm">
            &quot;{rejected}&quot; is not a known customer, so {customer.customer_name} is shown instead.
          </p>
        </Panel>
      )}
      <section className="space-y-4">
        <SectionHeader title={customer.customer_name} description={formatPeriod(PERIOD)} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {facts.map((f) => (
            <FactStatCard key={f.id} fact={f} />
          ))}
        </div>
      </section>
      <section className="space-y-4">
        <SectionHeader
          title="Money and utilization"
          description="Avoided cost is the full year; value kept in use, unused allocation and utilization are December 2025."
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {valueFacts(data, scope).map((f) => (
            <FactStatCard key={f.id} fact={f} />
          ))}
        </div>
      </section>
      <section className="space-y-4">
        <SectionHeader
          title="Percentages"
          description="On-time rate is over sampled cycles; repair rates are full-year repairs over December pieces; waste share is allocated by washed-kg share."
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {percentageFacts(data, scope).map((f) => (
            <FactStatCard key={f.id} fact={f} />
          ))}
        </div>
      </section>
      <section className="space-y-4">
        <SectionHeader title="Sites" description="Wearers and garments are December 2025; repairs and requests are the full year." />
        <SiteTable table={operationalSiteRows(data, scope)} />
      </section>
    </div>
  );
}
