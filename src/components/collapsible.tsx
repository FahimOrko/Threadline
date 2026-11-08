import { CaretRight } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";

/** A closed-by-default detail section (native `details`: keyboard and screen readers for free). Only detail tables go in one; text and summaries never do. */
export function Collapsible({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <details data-slot="collapsible" className={cn("group rounded-lg border bg-card text-card-foreground", className)}>
      <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 text-sm font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
        <CaretRight aria-hidden size={14} className="shrink-0 transition-transform group-open:rotate-90 motion-reduce:transition-none" />
        {title}
      </summary>
      <div className="space-y-2 border-t px-3 py-3">{children}</div>
    </details>
  );
}
