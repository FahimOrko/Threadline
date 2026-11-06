import { Panel } from "@/components/panel";

// Slots: `provenance` takes a ProvenanceChip, children take a ShowMath.
export function StatCard({
  label,
  value,
  unit,
  provenance,
  children,
}: {
  label: string;
  value: string;
  unit?: string;
  provenance?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <Panel className="space-y-2">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="flex items-baseline gap-1">
        <span className="num text-2xl font-medium">{value}</span>
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </p>
      {provenance}
      {children}
    </Panel>
  );
}
