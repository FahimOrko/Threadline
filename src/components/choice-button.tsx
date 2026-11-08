import Link from "next/link";
import { Badge } from "@/components/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** One answer in a game scene (`suggested` adds a "Suggested for a first run" badge, in words, and the reason under it; it never pre-selects): a plain link (the choice lives in the address, ADR 0021), label on one line, an optional hint under it. `primary` is the single call to action of a beat; `newTab` is for the PDF route. */
export function ChoiceButton({ href, label, hint, suggested, selected, primary, newTab, className }: { href: string; label: string; hint?: string; suggested?: { badge: string; why: string }; selected?: boolean; primary?: boolean; newTab?: boolean; className?: string }) {
  const cls = cn(buttonVariants({ variant: primary ? "default" : "outline", size: "lg" }), "h-auto min-h-9 flex-col items-start gap-0 py-1.5 text-left active:scale-[0.98]", className);
  const body = (
    <>
      <span>{label}</span>
      {selected && <Badge variant="accent" className="mt-1">Chosen</Badge>}
      {suggested && <Badge variant="accent" className="mt-1">{suggested.badge}</Badge>}
      {suggested && <span className="text-xs font-normal whitespace-normal text-muted-foreground">{suggested.why}</span>}
      {hint && <span className="text-xs font-normal whitespace-normal text-muted-foreground">{hint}</span>}
    </>
  );
  return newTab ? (
    <a href={href} target="_blank" rel="noopener" data-slot="choice-button" className={cls}>
      {body}
    </a>
  ) : (
    <Link href={href} data-slot="choice-button" aria-current={selected ? "true" : undefined} className={cls}>
      {body}
    </Link>
  );
}
