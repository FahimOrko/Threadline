import { Tray, WarningCircle } from "@phosphor-icons/react/ssr";
import { Panel } from "@/components/panel";

// Same box structure as StatCard so layout does not jump when data arrives.
export function StatCardSkeleton() {
  return (
    <Panel role="status" aria-label="Loading" className="space-y-2">
      <div className="h-4 w-24 rounded-md bg-muted motion-safe:animate-pulse" />
      <div className="h-8 w-32 rounded-md bg-muted motion-safe:animate-pulse" />
      <div className="h-5 w-40 rounded-full bg-muted motion-safe:animate-pulse" />
    </Panel>
  );
}

export function EmptyState({ title, hint }: { title: string; hint: string }) {
  return (
    <Panel className="flex flex-col items-center gap-1 py-8 text-center">
      <Tray aria-hidden size={24} className="text-muted-foreground" />
      <p className="text-sm font-medium">{title}</p>
      <p className="max-w-[45ch] text-sm text-muted-foreground">{hint}</p>
    </Panel>
  );
}

export function ErrorState({ title, detail }: { title: string; detail: string }) {
  return (
    <Panel role="alert" className="flex items-start gap-2 border-destructive/50">
      <WarningCircle aria-hidden size={20} className="mt-0.5 shrink-0 text-destructive" />
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{detail}</p>
      </div>
    </Panel>
  );
}
