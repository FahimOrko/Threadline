"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useId, useState } from "react";
import { CaretDoubleLeft, CaretDoubleRight } from "@phosphor-icons/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { resolveCustomer } from "@/lib/customer";
import { SENSITIVITY_LEVELS } from "@/lib/engine";
import { STORY_PRINT_PATH } from "@/lib/story/print";
import { resolveBaseline, resolveSensitivity } from "@/lib/selection";
import { useRoleStore, type Role } from "@/store/role-store";

const views = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/impact", label: "Impact World" },
  { href: "/story", label: "Story" },
];

type ShellCustomer = { customer_id: string; name: string };
type ShellBaseline = { baseline_id: string; name: string };

const SENSITIVITY_ITEMS = SENSITIVITY_LEVELS.map((l) => ({ value: l, label: l }));

// The layout cannot read searchParams, so the header reads the URL here. It uses the same resolvers as the page.
function useSelection(customers: ShellCustomer[], baselines: ShellBaseline[]) {
  const params = useSearchParams();
  const raw = { customer: params.get("customer"), baseline: params.get("baseline"), sensitivity: params.get("sensitivity") };
  return {
    params,
    customer: resolveCustomer(raw.customer ?? undefined, customers).customer,
    baseline: resolveBaseline(raw.baseline ?? undefined, baselines).baseline,
    sensitivity: resolveSensitivity(raw.sensitivity ?? undefined).sensitivity,
    raw,
  };
}

// A selector only changes its own param; the others stay in the address (ADR 0017).
function ParamSelect({ label, name, value, items }: { label: string; name: string; value: string; items: { value: string; label: string }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const labelId = useId();
  return (
    <div className="flex items-center gap-2">
      <span id={labelId} className="text-sm text-muted-foreground">
        {label}
      </span>
      <Select
        value={value}
        items={items}
        onValueChange={(v) => {
          const next = new URLSearchParams(params.toString());
          next.set(name, String(v));
          router.push(`${pathname}?${next.toString()}`);
        }}
      >
        <SelectTrigger size="sm" aria-labelledby={labelId}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          {items.map((i) => (
            <SelectItem key={i.value} value={i.value}>
              {i.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function Selectors({ customers, baselines }: { customers: ShellCustomer[]; baselines: ShellBaseline[] }) {
  const { customer, baseline, sensitivity } = useSelection(customers, baselines);
  return (
    <>
      <ParamSelect label="Customer" name="customer" value={customer.customer_id} items={customers.map((c) => ({ value: c.customer_id, label: c.name }))} />
      <ParamSelect label="Baseline" name="baseline" value={baseline.baseline_id} items={baselines.map((b) => ({ value: b.baseline_id, label: b.name }))} />
      <ParamSelect label="Sensitivity" name="sensitivity" value={sensitivity} items={SENSITIVITY_ITEMS} />
    </>
  );
}

// `pathname` is undefined in the Suspense fallback: usePathname() suspends on a dynamic route, so the fallback shows no active view.
function ViewLinkList({ query, pathname }: { query: string; pathname?: string }) {
  return views.map(({ href, label }) => {
    const active = pathname !== undefined && (pathname === href || pathname.startsWith(`${href}/`));
    return (
      <Link
        key={href}
        href={`${href}${query}`}
        aria-current={active ? "page" : undefined}
        className={buttonVariants({ variant: active ? "default" : "ghost", size: "sm" })}
      >
        {label}
      </Link>
    );
  });
}

// Keeps the chosen customer, baseline, sensitivity and story priorities across views; without a param the links stay clean.
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
  return <ViewLinkList pathname={pathname} query={q.size ? `?${q.toString()}` : ""} />;
}

type ShellProps = { children: React.ReactNode; customers: ShellCustomer[]; baselines: ShellBaseline[] };

function Frame({ children, customers, baselines }: ShellProps) {
  const role = useRoleStore((s) => s.role);
  const setRole = useRoleStore((s) => s.setRole);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    useRoleStore.persist.rehydrate();
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex flex-wrap items-center gap-3 border-b px-4 py-2">
        <span className="font-semibold">Threadline</span>
        <Suspense
          fallback={
            <Button variant="outline" size="sm" disabled>
              Customer
            </Button>
          }
        >
          <Selectors customers={customers} baselines={baselines} />
        </Suspense>
        <div className="ml-auto flex items-center gap-2">
          <ToggleGroup
            aria-label="Role"
            variant="outline"
            spacing={0}
            value={[role]}
            onValueChange={(v) => v[0] && setRole(v[0] as Role)}
          >
            <ToggleGroupItem value="kam">KAM</ToggleGroupItem>
            <ToggleGroupItem value="customer">Customer</ToggleGroupItem>
          </ToggleGroup>
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:inline-flex"
            aria-label={sidebarOpen ? "Collapse AI sidebar" : "Expand AI sidebar"}
            aria-expanded={sidebarOpen}
            onClick={() => setSidebarOpen((o) => !o)}
          >
            {sidebarOpen ? <CaretDoubleRight /> : <CaretDoubleLeft />}
          </Button>
        </div>
      </header>
      <nav aria-label="Views" className="flex gap-1 border-b px-4 py-2">
        <Suspense fallback={<ViewLinkList query="" />}>
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
  return pathname === STORY_PRINT_PATH ? <>{props.children}</> : <Frame {...props} />;
}

export function AppShell(props: ShellProps) {
  return (
    <Suspense fallback={<Frame {...props} />}>
      <ShellOrBare {...props} />
    </Suspense>
  );
}
