"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useId } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { resolveCustomer } from "@/lib/customer";
import { SENSITIVITY_LEVELS } from "@/lib/engine";
import { SENSITIVITY_LABEL, resolveBaseline, resolveSensitivity } from "@/lib/selection";

export type ShellCustomer = { customer_id: string; name: string };
export type ShellBaseline = { baseline_id: string; name: string };

const SENSITIVITY_ITEMS = SENSITIVITY_LEVELS.map((l) => ({ value: l, label: SENSITIVITY_LABEL[l] }));

// The layout cannot read searchParams, so the header reads the URL here. It uses the same resolvers as the page.
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

// A selector only changes its own param; the others stay in the address (ADR 0017).
export function ParamSelect({ label, name, value, items, stacked }: { label: string; name: string; value: string; items: { value: string; label: string }[]; stacked?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const labelId = useId();
  return (
    <div className={cn("flex gap-2", stacked ? "flex-col" : "items-center")}>
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
        <SelectTrigger size="sm" aria-labelledby={labelId} className={stacked ? "w-full" : undefined}>
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

export function Selectors({ customers, baselines, stacked }: { customers: ShellCustomer[]; baselines: ShellBaseline[]; stacked?: boolean }) {
  const { customer, baseline, sensitivity } = useSelection(customers, baselines);
  return (
    <>
      <ParamSelect stacked={stacked} label="Customer" name="customer" value={customer.customer_id} items={customers.map((c) => ({ value: c.customer_id, label: c.name }))} />
      <ParamSelect stacked={stacked} label="Baseline" name="baseline" value={baseline.baseline_id} items={baselines.map((b) => ({ value: b.baseline_id, label: b.name }))} />
      <ParamSelect stacked={stacked} label="Sensitivity" name="sensitivity" value={sensitivity} items={SENSITIVITY_ITEMS} />
    </>
  );
}

