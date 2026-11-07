import { FactStatCard } from "@/components/fact-stat-card";
import { sectionFacts } from "@/lib/dashboard";
import { SectionPage } from "./_section-page";

export default function Page({ searchParams }: PageProps<"/dashboard">) {
  return (
    <SectionPage slug="overview" searchParams={searchParams}>
      {({ data, scope }) => (
        <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(13rem,1fr))]">
          {sectionFacts(data, scope).overview.map((f) => (
            <FactStatCard key={f.id} fact={f} />
          ))}
        </div>
      )}
    </SectionPage>
  );
}
