"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CaretUpDown } from "@phosphor-icons/react";
import { Tooltip } from "@/components/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { resolveCustomer } from "@/lib/customer";
import { formatNumber } from "@/lib/format";
import { resolveBaseline, resolveSensitivity } from "@/lib/selection";

/** `industry` and `sites` come from the customer data and the delivery-sites Fact; they only fill the switcher's subtitle. */
export type ShellCustomer = { customer_id: string; name: string; industry?: string; sites?: number };
export type ShellBaseline = { baseline_id: string; name: string };

// The layout cannot read searchParams, so client components read the URL here. It uses the same resolvers as the page.
export function useSelection(customers: ShellCustomer[], baselines: ShellBaseline[]) {
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

// Two letters for the customer avatar.
export const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");

/** A param change keeps every other param in the address (ADR 0017). */
export function useSetParam() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  return (name: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    next.set(name, value);
    router.push(`${pathname}?${next.toString()}`);
  };
}

const subtitle = (c: ShellCustomer) => [c.industry, c.sites === undefined ? undefined : `${formatNumber(c.sites)} ${c.sites === 1 ? "site" : "sites"}`].filter(Boolean).join(" · ");

function Avatar({ name }: { name: string }) {
  return (
    <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-xs font-medium text-sidebar-primary-foreground">
      {initials(name)}
    </span>
  );
}

/**
 * The customer switcher row at the top of the sidebar (sidebar-07 style): avatar, name, industry and site count, chevron, and a menu of customers.
 * Collapsed it is the avatar alone with the name as a tooltip. `locked` (customer view) shows the customer with no menu.
 */
export function CustomerSwitcher({ customers, baselines, collapsed, locked }: { customers: ShellCustomer[]; baselines: ShellBaseline[]; collapsed?: boolean; locked?: boolean }) {
  const { customer } = useSelection(customers, baselines);
  const setParam = useSetParam();
  const current = customers.find((c) => c.customer_id === customer.customer_id) ?? customers[0];
  const body = (
    <>
      <Avatar name={current.name} />
      {!collapsed && (
        <span className="grid min-w-0 flex-1 text-left leading-tight">
          <span className="truncate text-sm font-medium">{current.name}</span>
          <span className="truncate text-xs text-muted-foreground">{subtitle(current)}</span>
        </span>
      )}
    </>
  );
  const row = "flex w-full items-center gap-2 rounded-md p-1 text-sidebar-foreground";
  if (locked) {
    return (
      <div className={cn(row, collapsed && "justify-center")} aria-label={`Customer: ${current.name}`} role="group">
        {body}
      </div>
    );
  }
  const trigger = (
    <DropdownMenuTrigger aria-label={`Customer: ${current.name}. Switch customer`} className={cn(row, "outline-none hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring data-popup-open:bg-sidebar-accent", collapsed && "justify-center")}>
      {body}
      {!collapsed && <CaretUpDown aria-hidden className="ml-auto size-4 shrink-0 text-muted-foreground" />}
    </DropdownMenuTrigger>
  );
  return (
    <DropdownMenu>
      {collapsed ? <Tooltip label={current.name}>{trigger}</Tooltip> : trigger}
      <DropdownMenuContent align="start" className="w-(--anchor-width) min-w-56">
        <DropdownMenuRadioGroup value={current.customer_id} onValueChange={(v) => setParam("customer", String(v))}>
          {customers.map((c) => (
            <DropdownMenuRadioItem key={c.customer_id} value={c.customer_id}>
              <Avatar name={c.name} />
              <span className="grid min-w-0 leading-tight">
                <span className="truncate">{c.name}</span>
                <span className="truncate text-xs text-muted-foreground">{subtitle(c)}</span>
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
