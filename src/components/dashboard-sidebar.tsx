"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Selectors, type ShellBaseline, type ShellCustomer } from "@/components/param-selects";
import { SECTIONS } from "@/lib/dashboard";
import { cn } from "@/lib/utils";

const KEEP = ["customer", "baseline", "sensitivity", "view"];

// Sites stays active on a site page; Overview only on its own route.
const isActive = (href: string, pathname: string) => (href === "/dashboard" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));

function SectionLinks({ pathname, search }: { pathname?: string; search?: URLSearchParams }) {
  const q = new URLSearchParams();
  for (const k of KEEP) {
    const v = search?.get(k);
    if (v != null) q.set(k, v);
  }
  const query = q.size ? `?${q.toString()}` : "";
  return (
    <ul className="space-y-0.5">
      {SECTIONS.map(({ slug, href, label }) => {
        const active = pathname !== undefined && isActive(href, pathname);
        return (
          <li key={slug}>
            <Link
              href={`${href}${query}`}
              aria-current={active ? "page" : undefined}
              className={cn(
                "block rounded-md px-2 py-1.5 text-sm hover:bg-muted",
                active ? "bg-muted font-medium text-foreground" : "text-muted-foreground",
              )}
            >
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function LiveLinks() {
  return <SectionLinks pathname={usePathname()} search={useSearchParams()} />;
}

/** The KAM's dashboard navigation: the three pickers on top, then one link per section (ADR 0023). */
export function DashboardSidebar({ customers, baselines }: { customers: ShellCustomer[]; baselines: ShellBaseline[] }) {
  return (
    <nav aria-label="Dashboard sections" className="w-full shrink-0 space-y-4 md:w-56">
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading</p>}>
        <div className="space-y-3">
          <Selectors stacked customers={customers} baselines={baselines} />
        </div>
      </Suspense>
      <Suspense fallback={<SectionLinks />}>
        <LiveLinks />
      </Suspense>
    </nav>
  );
}
