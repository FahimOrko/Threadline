"use client";

import { usePathname } from "next/navigation";
import { Suspense, useState, useSyncExternalStore } from "react";
import { AppHeader, SiteNameProvider } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";
import type { ShellBaseline, ShellCustomer } from "@/components/param-selects";
import { Separator } from "@/components/ui/separator";
import { SIDEBAR_COOKIE, SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

type ShellProps = { children: React.ReactNode; customers: ShellCustomer[]; baselines: ShellBaseline[] };

// `pathname` is undefined in the Suspense fallback, which shows the default sidebar with no active item.
function Frame({ children, customers, baselines, pathname }: ShellProps & { pathname?: string }) {
  // The AI sidebar starts collapsed on every route and opens only on the user's toggle.
  const [userAiOpen, setUserAiOpen] = useState<boolean | null>(null);
  const aiOpen = userAiOpen ?? false;
  const onDashboard = pathname !== undefined && (pathname === "/dashboard" || pathname.startsWith("/dashboard/"));

  // `pref` is what the user chose for the app sidebar (the cookie). While the AI sidebar is open on the dashboard the sidebar shows collapsed, unless the
  // user touched it since the AI sidebar last changed (ADR 0025). Automatic collapse never writes the cookie.
  // shortcut: the cookie is read after mount, so a viewer who collapsed it sees one expanded frame; a server read would make every shell dynamic (cacheComponents).
  const saved = useSyncExternalStore(
    () => () => {},
    () => document.cookie.match(new RegExp(`${SIDEBAR_COOKIE}=(true|false)`))?.[1] !== "false",
    () => true,
  );
  const [chosen, setPref] = useState<boolean | null>(null);
  const pref = chosen ?? saved;
  const [touched, setTouched] = useState(false);
  const sidebarOpen = onDashboard && aiOpen && !touched ? false : pref;

  // The landing page at `/` has its own logo and no shell.
  if (pathname === "/") return <>{children}</>;

  return (
    <SiteNameProvider>
      <SidebarProvider
        open={sidebarOpen}
        onOpenChange={(open) => {
          setPref(open);
          setTouched(true);
        }}
      >
        <AppSidebar customers={customers} baselines={baselines} />
        <SidebarInset>
          <AppHeader
            customers={customers}
            baselines={baselines}
            pathname={pathname}
            aiOpen={aiOpen}
            onToggleAi={() => {
              setUserAiOpen(!aiOpen);
              setTouched(false);
            }}
          />
          <div className="flex flex-1">
            <main className="min-w-0 flex-1 p-6">{children}</main>
            {aiOpen && (
              <>
                <Separator orientation="vertical" className="hidden md:block" />
                <aside aria-label="AI assistant" className="hidden w-80 shrink-0 p-4 md:block">
                  <h2 className="font-medium">AI assistant</h2>
                  <p className="text-sm text-muted-foreground">Coming soon.</p>
                </aside>
              </>
            )}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </SiteNameProvider>
  );
}

// usePathname suspends on routes with a dynamic param (site pages), so it is read inside Suspense; the fallback is the full shell.
function ShellWithPath(props: ShellProps) {
  return <Frame {...props} pathname={usePathname()} />;
}

export function AppShell(props: ShellProps) {
  return (
    <Suspense fallback={<Frame {...props} />}>
      <ShellWithPath {...props} />
    </Suspense>
  );
}
