import { FactStatCard } from "@/components/fact-stat-card";
import { sectionFacts } from "@/lib/dashboard";
import { footprintFacts, footprintGroup } from "@/lib/engine";
import { SectionPage } from "../_section-page";

export default function Page({ searchParams }: PageProps<"/dashboard/footprint">) {
  return (
    <SectionPage slug="footprint" searchParams={searchParams}>
      {({ data, scope, baseline, short, sensitivity }) => {
        const footprint = footprintFacts(data, scope, baseline, sensitivity);
        const groups = [
          { title: `Saved vs ${short}`, group: "saved" },
          { title: "Service footprint", group: "service" },
          { title: "Delivery footprint", group: "delivery" },
        ] as const;
        return (
          <div className="space-y-6">
            {groups.map(({ title, group }) => (
              <div key={group} className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
                <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(13rem,1fr))]">
                  {footprintGroup(footprint, group).map((f) => (
                    <FactStatCard key={f.id} fact={f} />
                  ))}
                </div>
              </div>
            ))}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Recycling</h3>
              <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(13rem,1fr))]">
                {sectionFacts(data, scope).footprint.map((f) => (
                  <FactStatCard key={f.id} fact={f} />
                ))}
              </div>
            </div>
            <p className="max-w-[65ch] text-sm text-muted-foreground">Route kilometres are not in the data pack, so delivery is not estimated from distance.</p>
          </div>
        );
      }}
    </SectionPage>
  );
}
