"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { Badge } from "@/components/badge";
import { cn } from "@/lib/utils";

/**
 * The dialogue box of a game scene: a speaker name tag in words and the line. With `href` the whole box is one link to the next beat (click, Enter, or Space) and shows "Next".
 * Without it the box holds `children`, for example choice buttons. `previousHref` adds a "Previous" link in the footer of every beat; null shows it disabled (first beat), undefined leaves it out.
 * Give it a `key` that changes per beat so the 150 ms fade plays; the fade is off under reduced motion.
 */
export function DialogueBox({ speaker, tag, text, href, previousHref, children, className }: { speaker: "kam" | "ops"; tag: string; text: string; href?: string; previousHref?: string | null; children?: React.ReactNode; className?: string }) {
  const router = useRouter();
  const cls = cn("relative block min-h-36 w-full rounded-lg border bg-card p-4 text-card-foreground animate-in fade-in duration-150 motion-reduce:animate-none", className);
  const head = (
    <>
      <Badge variant={speaker === "kam" ? "accent" : "default"}>{tag}</Badge>
      <p className="mt-3 max-w-[65ch] text-base">{text}</p>
    </>
  );
  // Anchors cannot nest, so Previous is a sibling of the box link: the box link is stretched over the box and Previous sits above it.
  const previous =
    previousHref === undefined ? null : previousHref === null ? (
      <span aria-disabled="true" data-slot="dialogue-previous" className="flex items-center gap-1 text-sm text-muted-foreground opacity-50">
        <CaretLeft size={14} aria-hidden /> Previous
      </span>
    ) : (
      <Link href={previousHref} data-slot="dialogue-previous" className="relative z-10 flex items-center gap-1 rounded-sm text-sm text-primary outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
        <CaretLeft size={14} aria-hidden /> Previous
      </Link>
    );
  if (href) {
    return (
      <div data-slot="dialogue-box" data-speaker={speaker} className={cn(cls, "hover:bg-muted/40")}>
        {head}
        <div className="mt-3 flex items-center justify-between">
          {previous ?? <span />}
          <Link
            href={href}
            aria-label={`${tag}: ${text} Next`}
            className="flex items-center gap-1 rounded-sm text-sm text-primary outline-none after:absolute after:inset-0 after:content-[''] focus-visible:ring-3 focus-visible:ring-ring/50"
            onKeyDown={(e) => {
              // A link answers Enter by itself; Space is added so the box reads as a button.
              if (e.key === " ") {
                e.preventDefault();
                router.push(href);
              }
            }}
          >
            Next <CaretRight size={14} aria-hidden />
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div data-slot="dialogue-box" data-speaker={speaker} className={cls}>
      {head}
      {children && <div className="mt-4">{children}</div>}
      {previous && <div className="mt-3 flex">{previous}</div>}
    </div>
  );
}
