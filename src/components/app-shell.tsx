"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { CaretDoubleLeft, CaretDoubleRight } from "@phosphor-icons/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Selectors, useSelection, type ShellBaseline, type ShellCustomer } from "@/components/param-selects";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { GAME_PATH, STORY_PATH } from "@/lib/story/game";
import { STORY_PRINT_PATH } from "@/lib/story/print";
import { carryParams, resolveView, type View } from "@/lib/selection";

// `match` is the route prefix that marks the view active; Story opens the game but also owns the report and print routes.
const views = [
  { href: "/dashboard", match: "/dashboard", label: "Dashboard" },
  { href: "/impact", match: "/impact", label: "Impact World" },
  { href: GAME_PATH, match: STORY_PATH, label: "Story" },
];

// `pathname` is undefined in the Suspense fallback: usePathname() suspends on a dynamic route, so the fallback shows no active view.
// The dashboard is the KAM's workspace, so its link is absent in customer view.
function ViewLinkList({ query, pathname, view = "kam" }: { query: (to: string) => string; pathname?: string; view?: View }) {
  return views
    .filter(({ match }) => view === "kam" || match !== "/dashboard")
    .map(({ href, match, label }) => {
      const active = pathname !== undefined && (pathname === match || pathname.startsWith(`${match}/`));
      return (
        <Link
          key={href}
          href={`${href}${query(href)}`}
          aria-current={active ? "page" : undefined}
          className={buttonVariants({ variant: active ? "default" : "ghost", size: "sm" })}
        >
          {label}
        </Link>
      );
    });
}

// Which params travel is decided by carryParams (ADR 0023): leaving the dashboard keeps `view` only. Customer, baseline and sensitivity are normalized like the page does.
function ViewLinks({ customers, baselines }: { customers: ShellCustomer[]; baselines: ShellBaseline[] }) {
  const { customer, baseline, sensitivity, raw, params } = useSelection(customers, baselines);
  const pathname = usePathname();
  const q = new URLSearchParams();
  if (raw.customer !== null) q.set("customer", customer.customer_id);
  if (raw.baseline !== null) q.set("baseline", baseline.baseline_id);
  if (raw.sensitivity !== null) q.set("sensitivity", sensitivity);
  // Story picks (ADR 0019) travel unvalidated; the Story page validates them.
  const priorities = params.get("priorities");
  if (priorities) q.set("priorities", priorities);
  const view = resolveView(params.get("view") ?? undefined);
  if (view === "customer") q.set("view", view);
  return <ViewLinkList pathname={pathname} view={view} query={(to) => carryParams(pathname, to, q)} />;
}

// `?view=` is the one source of truth (ADR 0023): KAM is no param, so the toggle is two links that set or clear it and a reload keeps the choice.
function ViewToggle() {
  const pathname = usePathname();
  const params = useSearchParams();
  const view = resolveView(params.get("view") ?? undefined);
  const href = (v: View) => {
    const q = new URLSearchParams(params.toString());
    if (v === "customer") q.set("view", "customer");
    else q.delete("view");
    return `${pathname}${q.size ? `?${q.toString()}` : ""}`;
  };
  return (
    <div role="group" aria-label="View mode" className="flex">
      {(["kam", "customer"] as const).map((v) => (
        <Link
          key={v}
          href={href(v)}
          aria-current={view === v ? "true" : undefined}
          className={buttonVariants({ variant: view === v ? "default" : "outline", size: "sm" })}
        >
          {v === "kam" ? "KAM" : "Customer"}
        </Link>
      ))}
    </div>
  );
}

type ShellProps = { children: React.ReactNode; customers: ShellCustomer[]; baselines: ShellBaseline[] };

// `pathname` is undefined in the Suspense fallback, which shows the pickers and the default sidebar.
function Frame({ children, customers, baselines, pathname }: ShellProps & { pathname?: string }) {
  // The game is the only place its choices are made, so its sidebar starts collapsed; once the user toggles, their choice wins on every route.
  const isGame = pathname === GAME_PATH;
  const [userOpen, setUserOpen] = useState<boolean | null>(null);
  const sidebarOpen = userOpen ?? !isGame;
  // On the dashboard the pickers live in its own sidebar (ADR 0023).
  const onDashboard = pathname !== undefined && (pathname === "/dashboard" || pathname.startsWith("/dashboard/"));

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex flex-wrap items-center gap-3 border-b px-4 py-2">
        <span className="font-semibold">Threadline</span>
        {!isGame && !onDashboard && (
          <Suspense
            fallback={
              <Button variant="outline" size="sm" disabled>
                Customer
              </Button>
            }
          >
            <Selectors customers={customers} baselines={baselines} />
          </Suspense>
        )}
        <div className="ml-auto flex items-center gap-2">
          <Suspense
            fallback={
              <Button variant="outline" size="sm" disabled>
                KAM
              </Button>
            }
          >
            <ViewToggle />
          </Suspense>
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:inline-flex"
            aria-label={sidebarOpen ? "Collapse AI sidebar" : "Expand AI sidebar"}
            aria-expanded={sidebarOpen}
            onClick={() => setUserOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <CaretDoubleRight /> : <CaretDoubleLeft />}
          </Button>
        </div>
      </header>
      <nav aria-label="Views" className="flex gap-1 border-b px-4 py-2">
        <Suspense fallback={<ViewLinkList query={() => ""} />}>
          <ViewLinks customers={customers} baselines={baselines} />
        </Suspense>
      </nav>
      <div className="flex flex-1">
        <main className="min-w-0 flex-1 p-6">{children}</main>
        {sidebarOpen && (
          <>
            <Separator orientation="vertical" className="hidden md:block" />
            <aside aria-label="AI assistant" className="hidden w-80 p-4 md:block">
              <h2 className="font-medium">AI assistant</h2>
              <p className="text-sm text-muted-foreground">Coming soon.</p>
            </aside>
          </>
        )}
      </div>
    </div>
  );
}

// usePathname suspends on routes with a dynamic param (site pages), so it is read inside Suspense; the fallback is the full shell.
// shortcut: print route detected by pathname, not a route group; switch to (app)/(print) groups if more bare routes appear.
function ShellOrBare(props: ShellProps) {
  const pathname = usePathname();
  return pathname === STORY_PRINT_PATH ? <>{props.children}</> : <Frame {...props} pathname={pathname} />;
}

export function AppShell(props: ShellProps) {
  return (
    <Suspense fallback={<Frame {...props} />}>
      <ShellOrBare {...props} />
    </Suspense>
  );
}
