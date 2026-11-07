import { Suspense } from "react";
import { StatCardSkeleton } from "@/components/states";
import { GameHeaderActions } from "./_game-header";
import { GameView } from "./_game-view";

// searchParams is runtime data, so it is read inside Suspense and the heading and skeleton prerender.
export default function Page({ searchParams }: PageProps<"/story/game">) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold">Story game</h1>
        <Suspense
          fallback={
            <button type="button" disabled className="h-7 rounded-md border px-2.5 text-[0.8rem] opacity-50">
              Start over
            </button>
          }
        >
          <GameHeaderActions searchParams={searchParams} />
        </Suspense>
      </div>
      <Suspense fallback={<StatCardSkeleton />}>
        <GameView searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
