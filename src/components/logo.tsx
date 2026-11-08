import Link from "next/link";
import { cn } from "@/lib/utils";

/** The Threadline mark: the teal curve with three hollow nodes. Decorative, stroke follows the primary token. */
export function ThreadlineMark({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="-24 20 488 250" fill="none" stroke="currentColor" strokeLinecap="round" className={cn("h-5 w-auto text-primary", className)}>
      <path d="M0 250 C 70 250 80 90 150 110 S 240 250 300 190 S 380 40 440 60" strokeWidth="16" />
      {[[150, 110], [300, 190], [440, 60]].map(([x, y]) => (
        <circle key={x} cx={x} cy={y} r="18" fill="var(--background)" strokeWidth="16" />
      ))}
    </svg>
  );
}

/** Mark only, or mark + wordmark. Not a link; wrap it, or use `Logo` for the link to `/`. */
export function ThreadlineLogo({ variant = "full", className }: { variant?: "mark" | "full"; className?: string }) {
  if (variant === "mark") return <ThreadlineMark className={className} />;
  return (
    <span className={cn("inline-flex items-center gap-2 font-semibold", className)}>
      <ThreadlineMark />
      Threadline
    </span>
  );
}

/** The logo as a link to `/` with no params, `?view=` included (ADR 0034). `compact` shows the mark only. */
export function Logo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <Link href="/" aria-label="Threadline home" className={cn("rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring", compact ? "flex justify-center" : "inline-flex", className)}>
      <ThreadlineLogo variant={compact ? "mark" : "full"} />
    </Link>
  );
}
