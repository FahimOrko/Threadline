import { ArrowDown, ArrowUp, Equals } from "@phosphor-icons/react/ssr";
import type { FactDelta } from "@/lib/engine";
import { formatCardValue } from "@/lib/format";
import { cn } from "@/lib/utils";

const WORD = { up: "Up", down: "Down", none: "No change" } as const;
const ICON = { up: ArrowUp, down: ArrowDown, none: Equals } as const;

/** A change in an engine Fact between two states. A word and a glyph carry the direction, never colour alone, and one neutral style fits every delta: a change is not good or bad. A "%" Fact changes in percentage points. Rounded only here. */
export function DeltaBadge({ delta, className }: { delta: FactDelta; className?: string }) {
  const Icon = ICON[delta.direction];
  const unit = delta.unit === "%" ? "pp" : delta.unit;
  return (
    <span data-slot="delta-badge" className={cn("inline-flex items-center gap-1 rounded-md border bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground", className)}>
      <Icon aria-hidden size={12} />
      {WORD[delta.direction]}
      {delta.direction !== "none" && (
        <span className="num text-foreground">
          {delta.direction === "up" ? "+" : "-"}
          {formatCardValue(Math.abs(delta.value), delta.unit)} {unit}
        </span>
      )}
    </span>
  );
}
