import { Suspense } from "react";
import { PrintButton } from "@/components/print-button";
import { StoryDocument } from "../_story-document";

// The document reads searchParams and the generation date per request, so only the shell prerenders.
export default function Page({ searchParams }: PageProps<"/story/print">) {
  return (
    <div className="print-scope mx-auto max-w-4xl space-y-8 bg-background p-6 text-foreground">
      <PrintButton />
      <Suspense fallback={<p className="text-sm">Preparing the story…</p>}>
        <StoryDocument searchParams={searchParams} mode="print" />
      </Suspense>
    </div>
  );
}
