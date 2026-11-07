"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createContext, Suspense, useContext, useEffect, useState } from "react";
import { CaretDoubleLeft, CaretDoubleRight, CaretRight } from "@phosphor-icons/react";
import type { ShellBaseline, ShellCustomer } from "@/components/param-selects";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { breadcrumbFor } from "@/lib/nav";
import { carryParams } from "@/lib/selection";

// A site page names its own last crumb; the header cannot read the page's data (ADR 0025).
const SiteName = createContext<{ name?: string; setName: (n?: string) => void }>({ setName: () => {} });
export function SiteNameProvider({ children }: { children: React.ReactNode }) {
  const [name, setName] = useState<string>();
  return <SiteName.Provider value={{ name, setName }}>{children}</SiteName.Provider>;
}
/** Rendered by the site page: puts the site's name in the breadcrumb while mounted. */
export function SiteCrumb({ name }: { name: string }) {
  const { setName } = useContext(SiteName);
  useEffect(() => {
    setName(name);
    return () => setName(undefined);
  }, [name, setName]);
  return null;
}

function Crumbs({ pathname }: { pathname?: string }) {
  const { name } = useContext(SiteName);
  const params = useSearchParams();
  const crumbs = breadcrumbFor(pathname, name);
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-1 text-sm">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <li key={c.label} className="flex items-center gap-1">
              {i > 0 && <CaretRight aria-hidden className="size-3 text-muted-foreground" />}
              {c.href ? (
                <Link href={`${c.href}${carryParams(pathname ?? "", c.href, params)}`} className="text-muted-foreground hover:text-foreground">
                  {c.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className={last ? "font-medium" : "text-muted-foreground"}>
                  {c.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

type Props = { customers?: ShellCustomer[]; baselines?: ShellBaseline[]; pathname?: string; aiOpen: boolean; onToggleAi: () => void };

/** One thin row (ADR 0025): sidebar trigger, breadcrumb, then the and the AI sidebar toggle (the baseline and estimate choices live in the scenario strip on dashboard pages). */
export function AppHeader({ pathname, aiOpen, onToggleAi }: Props) {
  return (
    <header className="flex h-10 shrink-0 items-center gap-2 border-b px-3">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-4" />
      <Suspense fallback={null}>
        <Crumbs pathname={pathname} />
      </Suspense>
      <div className="ml-auto flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:inline-flex"
          aria-label={aiOpen ? "Collapse AI sidebar" : "Expand AI sidebar"}
          aria-expanded={aiOpen}
          onClick={onToggleAi}
        >
          {aiOpen ? <CaretDoubleRight /> : <CaretDoubleLeft />}
        </Button>
      </div>
    </header>
  );
}
