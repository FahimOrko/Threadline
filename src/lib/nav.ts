// The app sidebar's items (ADR 0025): pure data and selection, no numbers. Icons are named here and mapped in the component.
import { SECTIONS, type SectionSlug } from "@/lib/dashboard";
import { carryParams, type View } from "@/lib/selection";
import { GAME_PATH, STORY_PATH } from "@/lib/story/game";

export type NavIcon = SectionSlug | "story" | "impact";
export type NavItem = { key: string; href: string; /** Route prefix that marks the item active. */ match: string; label: string; icon: NavIcon };
export type NavGroup = { label: string; items: NavItem[] };

const DASHBOARD: NavGroup = {
  label: "Dashboard",
  items: SECTIONS.map((s) => ({ key: s.slug, href: s.href, match: s.href, label: s.label, icon: s.slug })),
};
const SHARED: NavGroup = {
  label: "Shared",
  items: [
    { key: "story", href: GAME_PATH, match: STORY_PATH, label: "Story", icon: "story" },
    { key: "impact", href: "/impact", match: "/impact", label: "Impact World", icon: "impact" },
  ],
};

/** The dashboard is the KAM's workspace (ADR 0023), so the customer view has no Dashboard group. */
export const navGroupsFor = (view: View): NavGroup[] => (view === "kam" ? [DASHBOARD, SHARED] : [SHARED]);

/** Overview is active only on its own route; every other item stays active below its prefix (Sites on a site page, Story on its report and print routes). */
export function isActive(item: NavItem, pathname: string | undefined): boolean {
  if (pathname === undefined) return false;
  if (item.href === "/dashboard") return pathname === item.href;
  return pathname === item.match || pathname.startsWith(`${item.match}/`);
}

/** The item's address with the params its target keeps (ADR 0023). */
export const navHref = (item: NavItem, pathname: string, params: URLSearchParams) => `${item.href}${carryParams(pathname, item.href, params)}`;

export type Crumb = { label: string; href?: string };

/** The header breadcrumb for a route. `siteName` names the last crumb on a site page. Only the Sites crumb links, back to the table. */
export function breadcrumbFor(pathname: string | undefined, siteName?: string): Crumb[] {
  if (pathname === undefined) return [];
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    const section = SECTIONS.find((s) => s.href !== "/dashboard" && (pathname === s.href || pathname.startsWith(`${s.href}/`))) ?? SECTIONS[0];
    const crumbs: Crumb[] = [{ label: "Dashboard" }];
    if (pathname.startsWith("/dashboard/sites/")) return [...crumbs, { label: section.label, href: section.href }, { label: siteName ?? "Site" }];
    return [...crumbs, { label: section.label }];
  }
  const item = navGroupsFor("kam").flatMap((g) => g.items).find((i) => isActive(i, pathname));
  return [{ label: item?.label ?? "Threadline" }];
}
