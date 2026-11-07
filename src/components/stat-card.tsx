import { Panel } from "@/components/panel";
import { cn } from "@/lib/utils";

// Slots: `provenance` takes a ProvenanceChip, children take a ShowMathPopover.
// `needsInput` (a hint) replaces the value when the number depends on something not supplied yet; it is never shown as 0.
export function StatCard({
  label,
  value,
  unit,
  needsInput,
  provenance,
  note,
  className,
  children,
}: {
  label: string;
  value?: string;
  unit?: string;
  needsInput?: string;
  provenance?: React.ReactNode;
  /** One plain line under the value saying what it means. */
  note?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <Panel className={cn("space-y-2", className)}>
      <p className="text-sm text-muted-foreground">{label}</p>
      {needsInput === undefined ? (
        <p className="flex items-baseline gap-1">
          <span className="num text-2xl font-medium">{value}</span>
          {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
        </p>
      ) : (
        <div>
          <p className="flex min-h-8 items-center text-base font-medium text-muted-foreground">Needs input</p>
          <p className="text-xs text-muted-foreground">{needsInput}</p>
        </div>
      )}
      {note && <p className="text-xs text-muted-foreground">{note}</p>}
      {provenance}
      {children}
    </Panel>
  );
}
