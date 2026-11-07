import { Panel } from "@/components/panel";

// Slots: `provenance` takes a ProvenanceChip, children take a ShowMathPopover.
// `needsInput` (a hint) replaces the value when the number depends on something not supplied yet; it is never shown as 0.
export function StatCard({
  label,
  value,
  unit,
  needsInput,
  provenance,
  children,
}: {
  label: string;
  value?: string;
  unit?: string;
  needsInput?: string;
  provenance?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <Panel className="space-y-2">
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
      {provenance}
      {children}
    </Panel>
  );
}
