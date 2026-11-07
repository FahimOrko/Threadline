import { FactStatCard } from "@/components/fact-stat-card";
import { SectionCard } from "@/components/section-card";
import { overviewHeadlines, sectionFacts } from "@/lib/dashboard";
import { SectionPage } from "./_section-page";

export default function Page({ searchParams }: PageProps<"/dashboard">) {
  return (
    <SectionPage slug="overview" searchParams={searchParams}>
      {({ data, scope, baseline, sensitivity }) => (
        // The grid follows the width of the main area, not the viewport: it shrinks when both sidebars are open.
        <div className="@container space-y-6">
          <div className="grid auto-rows-fr grid-cols-2 gap-3 @[40rem]:grid-cols-3">
            {overviewHeadlines(data, scope, baseline, sensitivity).map(({ fact, meaning }) => (
              <SectionCard key={fact.id} fact={fact} meaning={meaning} />
            ))}
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Scope</h3>
            <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(11rem,1fr))]">
              {sectionFacts(data, scope).overview.map((f) => (
                <FactStatCard key={f.id} fact={f} />
              ))}
            </div>
          </div>
        </div>
      )}
    </SectionPage>
  );
}
