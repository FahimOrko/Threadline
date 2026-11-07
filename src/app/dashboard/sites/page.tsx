import { SiteTable } from "@/components/site-table";
import { operationalSiteRows } from "@/lib/engine";
import { SectionPage } from "../_section-page";

export default function Page({ searchParams }: PageProps<"/dashboard/sites">) {
  return (
    <SectionPage slug="sites" searchParams={searchParams}>
      {({ data, scope }) => <SiteTable table={operationalSiteRows(data, scope)} />}
    </SectionPage>
  );
}
