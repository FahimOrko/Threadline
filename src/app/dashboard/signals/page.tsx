import { ObservationCard } from "@/components/observation-card";
import { EmptyState } from "@/components/states";
import { observations as observationsFor } from "@/lib/engine";
import { siteHref } from "@/lib/selection";
import { SectionPage } from "../_section-page";

export default function Page({ searchParams }: PageProps<"/dashboard/signals">) {
  return (
    <SectionPage slug="signals" searchParams={searchParams}>
      {({ data, scope, customer, baseline, sensitivity }) => {
        const { observations, facts } = observationsFor(data, scope);
        const linkParams = { customer: customer.customer_id, baseline: baseline.baseline_id, sensitivity };
        const siteName = (id: string) => data.sites.find((s) => s.site_id === id)?.site_name ?? id;
        return observations.length === 0 ? (
          <EmptyState title="No observations" hint="No rule fired for this customer." />
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {observations.map((o) => (
              <ObservationCard
                key={o.id}
                observation={o}
                facts={o.factIds.map((id) => facts.find((f) => f.id === id)!)}
                sites={o.scope.siteIds.map((id) => ({ siteId: id, siteName: siteName(id), href: siteHref(id, linkParams) }))}
              />
            ))}
          </div>
        );
      }}
    </SectionPage>
  );
}
