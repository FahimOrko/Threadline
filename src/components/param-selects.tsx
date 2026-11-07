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

// Two letters for the collapsed customer switcher.
export const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");

// A selector only changes its own param; the others stay in the address (ADR 0017).
// `compact` is the collapsed sidebar form: the label stays for assistive tech and the trigger shows initials.
export function ParamSelect({ label, name, value, items, stacked, compact }: { label: string; name: string; value: string; items: { value: string; label: string }[]; stacked?: boolean; compact?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const labelId = useId();
  return (
    <div className={cn("flex gap-2", stacked ? "flex-col" : "items-center")}>
      <span id={labelId} className={cn("text-sm text-muted-foreground", compact && "sr-only")}>
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
        <SelectTrigger size="sm" aria-labelledby={labelId} className={cn(stacked && "w-full", compact && "size-8 justify-center px-0 [&>svg]:hidden")}>
          {compact ? <span aria-hidden className="text-xs font-medium">{initials(items.find((i) => i.value === value)?.label ?? "")}</span> : <SelectValue />}
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

export function CustomerSelect({ customers, baselines, compact }: { customers: ShellCustomer[]; baselines: ShellBaseline[]; compact?: boolean }) {
  const { customer } = useSelection(customers, baselines);
  return <ParamSelect stacked compact={compact} label="Customer" name="customer" value={customer.customer_id} items={customers.map((c) => ({ value: c.customer_id, label: c.name }))} />;
}

/** The two pickers that change the numbers on a dashboard page (ADR 0017); they live in the header. */
export function EstimateSelects({ customers, baselines }: { customers: ShellCustomer[]; baselines: ShellBaseline[] }) {
  const { baseline, sensitivity } = useSelection(customers, baselines);
  return (
    <>
      <ParamSelect label="Baseline" name="baseline" value={baseline.baseline_id} items={baselines.map((b) => ({ value: b.baseline_id, label: b.name }))} />
      <ParamSelect label="Estimate" name="sensitivity" value={sensitivity} items={SENSITIVITY_ITEMS} />
    </>
  );
}
