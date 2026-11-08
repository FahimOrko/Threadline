// Class strings of one segmented group, shared by the client `Segmented` and the server-rendered priority picker (a string exported from a "use client" file is a client reference, so it lives here).
export const SEGMENT_GROUP = "flex flex-wrap rounded-lg border bg-background p-0.5";
export const segmentClass = (on: boolean) =>
  `h-7 inline-flex items-center rounded-md px-2.5 text-sm whitespace-nowrap transition-colors outline-none first-letter:uppercase focus-visible:ring-2 focus-visible:ring-ring ${on ? "bg-primary font-medium text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`;
