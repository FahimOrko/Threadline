import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { resolveView } from "@/lib/selection";
import { REPORT_HINT, reportLinkState, startOverState } from "@/lib/story/game";

const cls = buttonVariants({ variant: "outline", size: "sm" });

/** Start over and Read the full report, beside the title. Both are always in place and are disabled, not hidden, when they would do nothing, so the layout never jumps. */
export async function GameHeaderActions({ searchParams }: { searchParams: PageProps<"/story/game">["searchParams"] }) {
  const params = await searchParams;
  const start = startOverState(params, resolveView(params.view));
  const report = reportLinkState(params);
  return (
    <>
      {start.disabled ? (
        <button type="button" disabled className={cls}>
          Start over
        </button>
      ) : (
        <Link href={start.href} className={cls}>
          Start over
        </Link>
      )}
      {report.disabled ? (
        <>
          <button type="button" disabled aria-describedby="report-hint" className={cls}>
            Read the full report
          </button>
          <span id="report-hint" className="text-xs text-muted-foreground">
            {REPORT_HINT}
          </span>
        </>
      ) : (
        <Link href={report.href} className={cls}>
          Read the full report
        </Link>
      )}
    </>
  );
}
