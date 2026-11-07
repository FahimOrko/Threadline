"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CaretRight } from "@phosphor-icons/react";
import { Badge } from "@/components/badge";
import { cn } from "@/lib/utils";

/**
 * The dialogue box of a game scene: a speaker name tag in words and the line. With `href` the whole box is one link to the next beat (click, Enter, or Space) and shows "Next".
 * Without it the box holds `children`, for example choice buttons. Give it a `key` that changes per beat so the 150 ms fade plays; the fade is off under reduced motion.
 */
export function DialogueBox({ speaker, tag, text, href, children, className }: { speaker: "kam" | "ops"; tag: string; text: string; href?: string; children?: React.ReactNode; className?: string }) {
  const router = useRouter();
  const cls = cn("block min-h-36 w-full rounded-lg border bg-card p-4 text-card-foreground animate-in fade-in duration-150 motion-reduce:animate-none", className);
  const head = (
    <>
      <Badge variant={speaker === "kam" ? "accent" : "default"}>{tag}</Badge>
      <p className="mt-3 max-w-[65ch] text-base">{text}</p>
    </>
  );
  if (href) {
    return (
      <Link
        href={href}
        data-slot="dialogue-box"
        data-speaker={speaker}
        aria-label={`${tag}: ${text} Next`}
        className={cn(cls, "outline-none hover:bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring/50")}
        onKeyDown={(e) => {
          // A link answers Enter by itself; Space is added so the box reads as a button.
          if (e.key === " ") {
            e.preventDefault();
            router.push(href);
          }
        }}
      >
        {head}
        <span className="mt-3 flex items-center justify-end gap-1 text-sm text-primary" aria-hidden>
          Next <CaretRight size={14} />
        </span>
      </Link>
    );
  }
  return (
    <div data-slot="dialogue-box" data-speaker={speaker} className={cls}>
      {head}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
