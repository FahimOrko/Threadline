export function SectionHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="space-y-0.5">
        <h2 className="text-base font-medium">{title}</h2>
        {description && <p className="max-w-[65ch] text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
