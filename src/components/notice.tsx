import { Panel } from "@/components/panel";

/** An inline status notice. */
export function Notice({ children }: { children: React.ReactNode }) {
  return (
    <Panel role="status">
      <p className="text-sm">{children}</p>
    </Panel>
  );
}
