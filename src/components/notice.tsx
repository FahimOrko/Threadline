import { Panel } from "@/components/panel";

/** An inline status notice. `screenOnly` marks it `data-print="hide"` and `print:hidden` so a print route can drop it; chapter text is never marked this way. */
export function Notice({ children, screenOnly }: { children: React.ReactNode; screenOnly?: boolean }) {
  return (
    <Panel role="status" className={screenOnly ? "print:hidden" : undefined} data-print={screenOnly ? "hide" : undefined}>
      <p className="text-sm">{children}</p>
    </Panel>
  );
}
