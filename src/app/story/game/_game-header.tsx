import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { resolveView } from "@/lib/selection";
import { StartOverLink } from "./_game-progress";
import { REPORT_HINT, reportLinkState, startOverState } from "@/lib/story/game";

const cls = buttonVariants({ variant: "outline", size: "sm" });

/** Start over and Read the full report, beside the title. Both are always in place and are disabled, not hidden, when they would do nothing, so the layout never jumps. */
export async function GameHeaderActions({ searchParams }: { searchParams: PageProps<"/story/game">["searchParams"] }) {
  const params = await searchParams;
  const view = resolveView(params.view);
  const start = startOverState(params, view);
  const report = reportLinkState(params);
  return (
    <>
      {start.disabled ? (
        <button type="button" disabled className={cls}>
          Start over
        </button>
      ) : (
        <StartOverLink href={start.href} view={view} className={cls} />
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
