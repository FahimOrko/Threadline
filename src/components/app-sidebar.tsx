"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { Suspense, useEffect, useState } from "react";
import { BookOpen, Buildings, Bell, CaretRight, Coins, Eye, Globe, Leaf, Lock, SquaresFour, TShirt, UserCircle } from "@phosphor-icons/react";
import { Logo } from "@/components/logo";
import { CustomerSwitcher, type ShellBaseline, type ShellCustomer } from "@/components/param-selects";
import { ThemeToggle } from "@/components/theme-toggle";
import { Tooltip } from "@/components/tooltip";
import { buttonVariants } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { isActive, navGroupsFor, navHref, storyChapters, storyChildren, type NavChild, type NavGroup, type NavIcon, type NavItem } from "@/lib/nav";
import { carryParams, resolvePriorities, resolveView, type View } from "@/lib/selection";
import { GAME_PATH, STORY_PATH, WORLD_HINT } from "@/lib/story/game";
import { useReviewEnded } from "@/lib/story/use-review-ended";
import { cn } from "@/lib/utils";

const ICONS: Record<NavIcon, React.ElementType> = {
  overview: SquaresFour,
  garments: TShirt,
  costs: Coins,
  footprint: Leaf,
  signals: Bell,
  sites: Buildings,
  story: BookOpen,
  impact: Globe,
};

// The chapter whose heading last passed the line a third down the viewport; the first chapter before any has. Scroll listener in the capture phase, so it works whichever element scrolls.
function useActiveChapter(ids: string[], enabled: boolean) {
  const [active, setActive] = useState<string | null>(null);
  const key = ids.join(",");
  useEffect(() => {
    if (!enabled) return;
    const list = key.split(",");
    const update = () => {
      let current = list[0];
      for (const id of list) {
        const el = document.getElementById(`chapter-${id}`);
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.3) current = id;
      }
      setActive(current);
    };
    const frame = requestAnimationFrame(update);
    document.addEventListener("scroll", update, { capture: true, passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("scroll", update, { capture: true });
      window.removeEventListener("resize", update);
    };
  }, [key, enabled]);
  return enabled ? (active ?? ids[0]) : null;
}

/** A route sub-row's link with the carried params; Review from the report adds the ending, so it never reads as a restart. */
function reviewHref(c: NavChild, pathname: string | undefined, params: URLSearchParams) {
  const q = new URLSearchParams(carryParams(pathname ?? STORY_PATH, c.href, params));
  if (c.ending) { q.set("scene", "end"); q.set("beat", "0"); }
  return q.size ? `${c.href}?${q}` : c.href;
}

// The Story group (ADR 0029, sidebar-07 nested pattern): the parent row toggles Review and, on the report page, the chapter anchors. Open follows the route until the reader toggles it; not persisted.
function StoryChildren({ pathname, params, activeChapter }: { pathname?: string; params: URLSearchParams; activeChapter?: string | null }) {
  const priorities = resolvePriorities(params.get("priorities") ?? undefined).priorities;
  return (
    <SidebarMenuSub aria-label="Story">
      {storyChildren(pathname, priorities).map((c) => {
        const current = c.chapter ? activeChapter === c.key.replace("chapter-", "") : pathname === GAME_PATH;
        return (
          <SidebarMenuSubItem key={c.key}>
            <SidebarMenuSubButton render={<Link href={c.chapter ? c.href : reviewHref(c, pathname, params)} aria-current={current ? (c.chapter ? "location" : "page") : undefined} />} isActive={current}>
              <span>{c.label}</span>
            </SidebarMenuSubButton>
          </SidebarMenuSubItem>
        );
      })}
    </SidebarMenuSub>
  );
}

// The hover and active indicators glide between items (ADR 0025's motion list). Under reduced motion they are plain static fills: no layout animation.
function Items({ groups, pathname, params, activeChapter, href }: { groups: NavGroup[]; pathname?: string; params: URLSearchParams; activeChapter?: string | null; href: (item: NavItem) => string }) {
  const { state } = useSidebar();
  const view = resolveView(params.get("view") ?? undefined);
  // Unknown (null) reads as locked: the sidebar item is the safe default, and `ended=1` in the address opens it.
  const reviewEnded = useReviewEnded(view, params.get("customer")) === true || params.get("ended") === "1";
  const reduced = useReducedMotion();
  const [hover, setHover] = useState<string | null>(null);
  const [toggled, setToggled] = useState<boolean | null>(null);
  return groups.map((g, i) => (
    <div key={g.label}>
      {i > 0 && <SidebarSeparator />}
      <SidebarGroup>
        <SidebarGroupLabel>{g.label}</SidebarGroupLabel>
        <SidebarMenu aria-label={g.label}>
          {g.items.map((item) => {
            const Icon = ICONS[item.icon];
            const active = isActive(item, pathname);
            const group = item.expandable && state !== "collapsed";
            const open = toggled ?? active;
            const inner = (
              <>
                <Icon aria-hidden />
                <span>{item.label}</span>
                {group && <CaretRight aria-hidden className={cn("ml-auto size-3.5! transition-transform motion-reduce:transition-none", open && "rotate-90")} />}
              </>
            );
            const locked = item.gate === "review" && view === "customer" && !reviewEnded;
            const link = locked ? (
              <SidebarMenuButton render={<button type="button" aria-disabled="true" aria-describedby="world-locked-hint" className="cursor-not-allowed text-muted-foreground" />}>
                <Lock aria-hidden />
                <span>{item.label}</span>
                <span id="world-locked-hint" className="sr-only">
                  {WORLD_HINT}
                </span>
              </SidebarMenuButton>
            ) : group ? (
              <SidebarMenuButton render={<button type="button" aria-expanded={open} aria-controls="story-subrows" onClick={() => setToggled(!open)} />} isActive={active}>
                {inner}
              </SidebarMenuButton>
            ) : (
              <SidebarMenuButton render={<Link href={href(item)} aria-current={active ? "page" : undefined} aria-label={item.label} />} isActive={active}>
                {inner}
              </SidebarMenuButton>
            );
            return (
              <SidebarMenuItem key={item.key}>
                <div className="relative" onPointerEnter={() => setHover(item.key)} onPointerLeave={() => setHover(null)} onFocus={() => setHover(item.key)} onBlur={() => setHover(null)}>
                  {hover === item.key && !active && (
                    <motion.span aria-hidden data-indicator="hover" layoutId={reduced ? undefined : "nav-hover"} transition={{ duration: 0.18, ease: "easeOut" }} className="absolute inset-0 rounded-md bg-sidebar-accent/70" />
                  )}
                  {active && <motion.span aria-hidden data-indicator="active" layoutId={reduced ? undefined : "nav-active"} transition={{ duration: 0.22, ease: "easeOut" }} className="absolute inset-0 rounded-md bg-sidebar-accent" />}
                  {state === "collapsed" ? <Tooltip label={locked ? `${item.label}: ${WORLD_HINT}` : item.label}>{link}</Tooltip> : link}
                </div>
                {group && open && (
                  <div id="story-subrows">
                    <StoryChildren pathname={pathname} params={params} activeChapter={activeChapter} />
                  </div>
                )}
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroup>
    </div>
  ));
}

// `?view=` is the one source of truth (ADR 0023): KAM is no param, so the toggle is two links that set or clear it and a reload keeps the choice.
function ViewToggle({ pathname, params }: { pathname?: string; params: URLSearchParams }) {
  const { state } = useSidebar();
  const view = resolveView(params.get("view") ?? undefined);
  const href = (v: View) => {
    const q = new URLSearchParams(params.toString());
    if (v === "customer") q.set("view", "customer");
    else q.delete("view");
    return `${pathname ?? "/dashboard"}${q.size ? `?${q.toString()}` : ""}`;
  };
  if (state === "collapsed") {
    const next: View = view === "kam" ? "customer" : "kam";
    const label = next === "customer" ? "Switch to customer view" : "Switch to KAM view";
    return (
      <Tooltip label={label}>
        <Link href={href(next)} aria-label={label} className={buttonVariants({ variant: "ghost", size: "icon" })}>
          {next === "customer" ? <Eye /> : <UserCircle />}
        </Link>
      </Tooltip>
    );
  }
  return (
    <div role="group" aria-label="View mode" className="flex">
      {(["kam", "customer"] as const).map((v) => (
        <Link key={v} href={href(v)} aria-current={view === v ? "true" : undefined} className={cn(buttonVariants({ variant: view === v ? "default" : "outline", size: "sm" }), "flex-1")}>
          {v === "kam" ? "KAM" : "Customer"}
        </Link>
      ))}
    </div>
  );
}

function Wordmark() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  return <Logo compact={collapsed} className={cn("px-2", collapsed && "px-0")} />;
}

/** `params` may be a query string, so a server page (the /design gallery) can pass it across the client boundary. */
type Props = { customers: ShellCustomer[]; baselines: ShellBaseline[]; pathname?: string; params?: URLSearchParams | string };

/** The app navigation (ADR 0025): wordmark, customer switcher, the groups for the view, and the view and theme toggles in the footer. */
export function SidebarView({ customers, baselines, pathname, params: given = "", showCustomer = true, activeChapter, className }: Props & { showCustomer?: boolean; activeChapter?: string | null; className?: string }) {
  const { state } = useSidebar();
  const params = new URLSearchParams(given.toString());
  const view = resolveView(params.get("view") ?? undefined);
  return (
    <Sidebar aria-label="Main" className={className}>
      <SidebarHeader>
        <Wordmark />
        {showCustomer && (
          // The switcher reads the URL, so it suspends in a static prerender (/design); the placeholder keeps the row height (p-1 + size-8).
          <Suspense fallback={<div aria-hidden className="h-10" />}>
            <CustomerSwitcher customers={customers} baselines={baselines} collapsed={state === "collapsed"} />
          </Suspense>
        )}
      </SidebarHeader>
      <SidebarContent>
        <nav aria-label="Sections">
          <Items groups={navGroupsFor(view)} pathname={pathname} params={params} activeChapter={activeChapter} href={(item) => navHref(item, pathname ?? "/dashboard", params)} />
        </nav>
      </SidebarContent>
      <SidebarFooter>
        <ViewToggle pathname={pathname} params={params} />
        <div className={cn("flex items-center", state === "collapsed" ? "justify-center" : "justify-between")}>
          {state !== "collapsed" && <span className="px-1 text-sm text-muted-foreground">Theme</span>}
          <ThemeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

function Live(props: Props) {
  const pathname = usePathname();
  const params = new URLSearchParams(useSearchParams().toString());
  const view = resolveView(params.get("view") ?? undefined);
  const priorities = resolvePriorities(params.get("priorities") ?? undefined).priorities;
  const activeChapter = useActiveChapter(storyChapters(priorities).map((c) => c.id), pathname === STORY_PATH);
  // The customer switcher is hidden on the game and in the customer view, where the reader picks their company in the game (ADR 0029).
  return <SidebarView {...props} pathname={pathname} params={params} showCustomer={pathname !== GAME_PATH && view === "kam"} activeChapter={activeChapter} />;
}

// useSearchParams suspends during prerender, so the fallback is the same sidebar for the default KAM view with no active item.
export function AppSidebar(props: Props) {
  return (
    <Suspense fallback={<SidebarView {...props} showCustomer={false} />}>
      <Live {...props} />
    </Suspense>
  );
}
