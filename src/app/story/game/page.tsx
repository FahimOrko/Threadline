import { Suspense } from "react";
import { StatCardSkeleton } from "@/components/states";
import { GameView } from "./_game-view";

// searchParams is runtime data, so it is read inside Suspense and the heading and skeleton prerender.
export default function Page({ searchParams }: PageProps<"/story/game">) {
  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <h1 className="text-2xl font-semibold">Story game</h1>
      <Suspense fallback={<StatCardSkeleton />}>
        <GameView searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
