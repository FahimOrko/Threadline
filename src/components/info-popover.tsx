"use client";

import { Info } from "@phosphor-icons/react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

/**
 * The "i" next to a figure or chart (ADR 0028): what it means and why it matters, in plain words. Opens on click, Enter, Space or hover; Escape closes.
 * It takes finished text (the server resolves the registry's tokens) and never holds a number of its own. Show math is a separate control.
 */
export function InfoPopover({ text, label = "What does this mean?", className }: { text: string; label?: string; className?: string }) {
  if (!text) return null;
  return (
    <Popover>
      <PopoverTrigger
        openOnHover
        delay={200}
        aria-label={label}
        data-slot="info-popover"
        className={`inline-flex size-5 shrink-0 items-center justify-center rounded-full text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 ${className ?? ""}`}
      >
        <Info aria-hidden size={16} />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 text-sm">
        <p>{text}</p>
      </PopoverContent>
    </Popover>
  );
}
