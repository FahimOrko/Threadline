// The app sidebar's items (ADR 0025): pure data and selection, no numbers. Icons are named here and mapped in the component.
import { SECTIONS, type SectionSlug } from "@/lib/dashboard";
import { carryParams, type Priority, type View } from "@/lib/selection";
import { buildStory } from "@/lib/story";
import { GAME_PATH, STORY_PATH } from "@/lib/story/game";

export type NavIcon = SectionSlug | "story" | "impact";
export type NavItem = { key: string; href: string; /** Route prefix that marks the item active. */ match: string; label: string; icon: NavIcon; /** Shows sub-rows (the Story group, ADR 0029). */ expandable?: boolean };
export type NavGroup = { label: string; items: NavItem[] };

const DASHBOARD: NavGroup = {
  label: "Dashboard",
  items: SECTIONS.map((s) => ({ key: s.slug, href: s.href, match: s.href, label: s.label, icon: s.slug })),
};
const SHARED: NavGroup = {
  label: "Shared",
  items: [
    { key: "story", href: GAME_PATH, match: STORY_PATH, label: "Story", icon: "story", expandable: true },
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

/** The header breadcrumb for a route. `siteName` names the last crumb on a site page. Every crumb except the current page links. */
export function breadcrumbFor(pathname: string | undefined, siteName?: string): Crumb[] {
  if (pathname === undefined) return [];
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    const section = SECTIONS.find((s) => s.href !== "/dashboard" && (pathname === s.href || pathname.startsWith(`${s.href}/`))) ?? SECTIONS[0];
    const crumbs: Crumb[] = [{ label: "Dashboard", href: "/dashboard" }];
    if (pathname.startsWith("/dashboard/sites/")) return [...crumbs, { label: section.label, href: section.href }, { label: siteName ?? "Site" }];
    return [...crumbs, { label: section.label }];
  }
  const item = navGroupsFor("kam").flatMap((g) => g.items).find((i) => isActive(i, pathname));
  return [{ label: item?.label ?? "Threadline" }];
}

export type NavChild = { key: string; label: string; href: string; /** A chapter anchor on `/story`; the rest are routes that carry params. */ chapter?: boolean; /** Opens the game at its ending (Review from the report). */ ending?: boolean };

/** The report chapters in page order: the picked priorities lead (buildStory), then the two fixed closing chapters. Ids match the section headings (`chapter-<id>`). */
export const storyChapters = (priorities: readonly Priority[]): { id: string; label: string }[] => [
  ...buildStory(priorities).map((c) => ({ id: c.id, label: c.title })),
  { id: "methodology", label: "How we calculated this" },
  { id: "data-readiness", label: "Data readiness" },
];

/** The Story group's sub-rows (ADR 0029): Review always, the chapter anchors only on the report page. Pure data from the route and the picks, no state. */
export const storyChildren = (pathname: string | undefined, priorities: readonly Priority[]): NavChild[] => [
  { key: "review", label: "Review", href: GAME_PATH, ...(pathname === STORY_PATH ? { ending: true } : {}) },
  ...(pathname === STORY_PATH ? storyChapters(priorities).map((c) => ({ key: `chapter-${c.id}`, label: c.label, href: `#chapter-${c.id}`, chapter: true })) : []),
];
