import { FactStatCard } from "@/components/fact-stat-card";
import { SectionHeader } from "@/components/section-header";
import { generatedSource } from "@/lib/data/generated";
import { replacementsPostponed } from "@/lib/engine";
import { formatPeriod } from "@/lib/format";

// Slice 2 fixes the scope; the engine already takes any customer and period.
const CUSTOMER_ID = "CUST001"; // NorthStar Foods Group
const PERIOD = { from: "2025-01", to: "2025-12" };

export default async function Page() {
  const data = await generatedSource.load();
  const fact = replacementsPostponed(data, { customerId: CUSTOMER_ID, period: PERIOD });
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <section className="space-y-4">
        <SectionHeader title={fact.scope.customerName} description={formatPeriod(fact.period)} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <FactStatCard fact={fact} />
        </div>
      </section>
    </div>
  );
}
