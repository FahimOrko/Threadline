
/** The Story page's one header block, styled like the scenario strip (accent-tinted border and background): customer and what the review covers on the left, the actions on the right, the priority picker underneath. */
export function StoryHeader({ title, summary, actions, children }: { title: string; summary: string; actions: React.ReactNode; children: React.ReactNode }) {
  return (
    <header data-slot="story-header" className="space-y-4 rounded-lg border border-primary/40 bg-primary/5 p-4">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0 space-y-1">
          <h2 className="text-lg font-medium">{title}</h2>
          <p className="max-w-[65ch] text-sm text-muted-foreground">{summary}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      </div>
      <div className="border-t border-primary/20 pt-3">{children}</div>
    </header>
  );
}
