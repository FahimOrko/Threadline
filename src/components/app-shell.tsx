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
import { useRoleStore, type Role } from "@/store/role-store";

const views = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/impact", label: "Impact World" },
  { href: "/story", label: "Story" },
];

type ShellCustomer = { customer_id: string; name: string };

// The layout cannot read searchParams, so the header reads the URL here. It uses the same resolveCustomer as the page.
function useSelectedCustomer(customers: ShellCustomer[]) {
  const params = useSearchParams();
  const raw = params.get("customer");
  const { customer } = resolveCustomer(raw ?? undefined, customers);
  return { customer, hasParam: raw !== null };
}

function CustomerPicker({ customers }: { customers: ShellCustomer[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const labelId = useId();
  const { customer } = useSelectedCustomer(customers);
  return (
    <div className="flex items-center gap-2">
      <span id={labelId} className="text-sm text-muted-foreground">
        Customer
      </span>
      <Select
        value={customer.customer_id}
        items={customers.map((c) => ({ value: c.customer_id, label: c.name }))}
        onValueChange={(id) => router.push(`${pathname}?customer=${encodeURIComponent(String(id))}`)}
      >
        <SelectTrigger size="sm" aria-labelledby={labelId}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          {customers.map((c) => (
            <SelectItem key={c.customer_id} value={c.customer_id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function ViewLinkList({ query }: { query: string }) {
  const pathname = usePathname();
  return views.map(({ href, label }) => {
    const active = pathname === href;
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

// Keeps the chosen customer across views; without the param the links stay clean.
function ViewLinks({ customers }: { customers: ShellCustomer[] }) {
  const { customer, hasParam } = useSelectedCustomer(customers);
  return <ViewLinkList query={hasParam ? `?customer=${encodeURIComponent(customer.customer_id)}` : ""} />;
}

export function AppShell({ children, customers }: { children: React.ReactNode; customers: ShellCustomer[] }) {
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
          <CustomerPicker customers={customers} />
        </Suspense>
        <Button variant="outline" size="sm" disabled>
          Baseline: not selected
        </Button>
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
          <ViewLinks customers={customers} />
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
