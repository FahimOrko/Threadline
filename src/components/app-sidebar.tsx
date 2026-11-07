"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { Suspense, useState } from "react";
import { BookOpen, Buildings, Bell, Coins, Eye, Globe, Leaf, SquaresFour, TShirt, UserCircle } from "@phosphor-icons/react";
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
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { isActive, navGroupsFor, navHref, type NavGroup, type NavIcon } from "@/lib/nav";
import { resolveView, type View } from "@/lib/selection";
import { GAME_PATH } from "@/lib/story/game";
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

// The hover and active indicators glide between items (ADR 0025's motion list). Under reduced motion they are plain static fills: no layout animation.
function Items({ groups, pathname, href }: { groups: NavGroup[]; pathname?: string; href: (item: NavGroup["items"][number]) => string }) {
  const { state } = useSidebar();
  const reduced = useReducedMotion();
  const [hover, setHover] = useState<string | null>(null);
  return groups.map((g, i) => (
    <div key={g.label}>
      {i > 0 && <SidebarSeparator />}
      <SidebarGroup>
        <SidebarGroupLabel>{g.label}</SidebarGroupLabel>
        <SidebarMenu aria-label={g.label}>
          {g.items.map((item) => {
            const Icon = ICONS[item.icon];
            const active = isActive(item, pathname);
            const link = (
              <SidebarMenuButton render={<Link href={href(item)} aria-current={active ? "page" : undefined} aria-label={item.label} />} isActive={active}>
                <Icon aria-hidden />
                <span>{item.label}</span>
              </SidebarMenuButton>
            );
            return (
              <SidebarMenuItem key={item.key} onPointerEnter={() => setHover(item.key)} onPointerLeave={() => setHover(null)} onFocus={() => setHover(item.key)} onBlur={() => setHover(null)}>
                {hover === item.key && !active && (
                  <motion.span aria-hidden data-indicator="hover" layoutId={reduced ? undefined : "nav-hover"} transition={{ duration: 0.18, ease: "easeOut" }} className="absolute inset-0 rounded-md bg-sidebar-accent/70" />
                )}
                {active && <motion.span aria-hidden data-indicator="active" layoutId={reduced ? undefined : "nav-active"} transition={{ duration: 0.22, ease: "easeOut" }} className="absolute inset-0 rounded-md bg-sidebar-accent" />}
                {state === "collapsed" ? <Tooltip label={item.label}>{link}</Tooltip> : link}
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
  return <span className={cn("px-2 font-semibold", state === "collapsed" && "text-center px-0")}>{state === "collapsed" ? "T" : "Threadline"}</span>;
}

type Props = { customers: ShellCustomer[]; baselines: ShellBaseline[]; pathname?: string; params?: URLSearchParams };

/** The app navigation (ADR 0025): wordmark, customer switcher, the groups for the view, and the view and theme toggles in the footer. */
export function SidebarView({ customers, baselines, pathname, params = new URLSearchParams(), showCustomer = true, className }: Props & { showCustomer?: boolean; className?: string }) {
  const { state } = useSidebar();
  const view = resolveView(params.get("view") ?? undefined);
  return (
    <Sidebar aria-label="Main" className={className}>
      <SidebarHeader>
        <Wordmark />
        {showCustomer && <CustomerSwitcher customers={customers} baselines={baselines} collapsed={state === "collapsed"} locked={view === "customer"} />}
      </SidebarHeader>
      <SidebarContent>
        <nav aria-label="Sections">
          <Items groups={navGroupsFor(view)} pathname={pathname} href={(item) => navHref(item, pathname ?? "/dashboard", params)} />
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
  return <SidebarView {...props} pathname={pathname} params={new URLSearchParams(useSearchParams().toString())} showCustomer={pathname !== GAME_PATH} />;
}

// useSearchParams suspends during prerender, so the fallback is the same sidebar for the default KAM view with no active item.
export function AppSidebar(props: Props) {
  return (
    <Suspense fallback={<SidebarView {...props} showCustomer={false} />}>
      <Live {...props} />
    </Suspense>
  );
}
