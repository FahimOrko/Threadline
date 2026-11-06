import { cn } from "@/lib/utils";

export function Panel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="panel"
      className={cn("rounded-lg border bg-card p-4 text-card-foreground", className)}
      {...props}
    />
  );
}
