import { ArrowLeft } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { sectionHref } from "@/lib/selection";

export type SiteLink = { siteId: string; siteName: string; href: string };

/**
 * The sites a count names, each a link to its site page (links carry the page's params). `max` shows the first few and then "+N more" to `moreHref`;
 * without `max` every site is listed. The list is the engine's, in its order.
 */
export function SiteLinks({ sites, max, moreHref, label = "Sites" }: { sites: SiteLink[]; max?: number; moreHref?: string; label?: string }) {
  if (sites.length === 0) return null;
  const shown = max === undefined ? sites : sites.slice(0, max);
  const rest = sites.length - shown.length;
  return (
    <ul aria-label={label} className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
      {shown.map((s) => (
        <li key={s.siteId}>
          <Link href={s.href} className="text-primary hover:underline">
            {s.siteName}
          </Link>
        </li>
      ))}
      {rest > 0 && (
        <li>
          <Link href={moreHref ?? "#"} className="text-muted-foreground hover:underline">
            +{rest} more
          </Link>
        </li>
      )}
    </ul>
  );
}

/** The site page's way back: the Sites list, keeping the customer, baseline and sensitivity the page is showing. */
export function BackToSites({ params }: { params: { customer: string; baseline: string; sensitivity: string } }) {
  return (
    <Link href={sectionHref("/dashboard/sites", params)} className={buttonVariants({ variant: "outline", size: "sm" })}>
      <ArrowLeft aria-hidden />
      Back to sites
    </Link>
  );
}
