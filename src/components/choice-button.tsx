import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** One answer in a game scene: a plain link (the choice lives in the address, ADR 0021), label on one line, an optional hint under it. `primary` is the single call to action of a beat; `newTab` is for the PDF route. */
export function ChoiceButton({ href, label, hint, primary, newTab, className }: { href: string; label: string; hint?: string; primary?: boolean; newTab?: boolean; className?: string }) {
  const cls = cn(buttonVariants({ variant: primary ? "default" : "outline", size: "lg" }), "h-auto min-h-9 flex-col items-start gap-0 py-1.5 text-left active:scale-[0.98]", className);
  const body = (
    <>
      <span>{label}</span>
      {hint && <span className="text-xs font-normal whitespace-normal text-muted-foreground">{hint}</span>}
    </>
  );
  return newTab ? (
    <a href={href} target="_blank" rel="noopener" data-slot="choice-button" className={cls}>
      {body}
    </a>
  ) : (
    <Link href={href} data-slot="choice-button" className={cls}>
      {body}
    </Link>
  );
}
