import { Suspense } from "react";
import { StatCardSkeleton } from "@/components/states";
import { StoryDocument } from "./_story-document";

// searchParams is runtime data, so it is read inside Suspense and the heading and skeleton prerender.
export default function Page({ searchParams }: PageProps<"/story">) {
  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <h1 className="text-2xl font-semibold">Story</h1>
      <Suspense
        fallback={
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <StoryDocument searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
