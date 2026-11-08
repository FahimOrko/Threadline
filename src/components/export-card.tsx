"use client";

import { Button } from "@/components/ui/button";
import { Panel } from "@/components/panel";

/** Saves a string as a file. The text is already built on the server; the browser computes nothing. */
function save(text: string, name: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

/** The report's last card (`id="export"`): the data behind the report as Markdown and JSON, downloaded from the page. `fileBase` is the file name without its extension. */
export function ExportCard({ md, json, fileBase }: { md: string; json: string; fileBase: string }) {
  return (
    <Panel id="export" data-slot="export-card" className="scroll-mt-16 space-y-3">
      <h2 className="text-base font-medium">Take the data with you</h2>
      <p className="max-w-[65ch] text-sm text-muted-foreground">This is the data behind your report. Read it, or give it to your own AI tool. The Markdown file is easy to read; the JSON file is easy for a tool to use.</p>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => save(md, `${fileBase}.md`, "text/markdown;charset=utf-8")}>
          Download Markdown (.md)
        </Button>
        <Button size="sm" variant="outline" onClick={() => save(json, `${fileBase}.json`, "application/json;charset=utf-8")}>
          Download JSON (.json)
        </Button>
      </div>
    </Panel>
  );
}
