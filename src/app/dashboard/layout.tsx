import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { generatedSource } from "@/lib/data/generated";
import { baselineShortName } from "@/lib/engine";

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const { customers, baselines } = await generatedSource.load();
  return (
    <div className="flex flex-col gap-6 md:flex-row">
      <DashboardSidebar
        customers={customers.map((c) => ({ customer_id: c.customer_id, name: c.customer_name }))}
        baselines={baselines.map((b) => ({ baseline_id: b.baseline_id, name: baselineShortName(b) }))}
      />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
