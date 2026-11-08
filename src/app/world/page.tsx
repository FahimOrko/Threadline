import { Suspense } from "react";
import { StatCardSkeleton } from "@/components/states";
import { WorldView } from "./_world-view";

// searchParams is runtime data, so everything that names a customer is read inside Suspense and only the skeleton prerenders.
export default function Page({ searchParams }: PageProps<"/world">) {
  return (
    <div className="space-y-4">
      <Suspense fallback={<StatCardSkeleton />}>
        <WorldView searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
