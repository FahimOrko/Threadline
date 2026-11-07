import Link from "next/link";
import { Panel } from "@/components/panel";

// The default not-found UI follows the OS colour scheme, not the app theme, so this one uses theme tokens.
export default function NotFound() {
  return (
    <Panel role="status" className="space-y-2">
      <h1 className="text-lg font-medium">Site not found</h1>
      <p className="text-sm text-muted-foreground">This site does not exist for the selected customer.</p>
      <Link href="/dashboard" className="text-sm underline underline-offset-2">
        Back to dashboard
      </Link>
    </Panel>
  );
}
