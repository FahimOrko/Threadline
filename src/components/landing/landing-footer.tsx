import { ThreadlineLogo } from "@/components/logo";
import { FOOTER } from "@/lib/landing-content";

export function LandingFooter() {
  return (
    <footer className="mx-auto flex max-w-6xl flex-col items-center gap-2 border-t px-8 py-8 text-sm text-muted-foreground">
      <ThreadlineLogo className="text-foreground" />
      <p>{FOOTER}</p>
      <a href="#top" className="rounded-md underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring">Back to top</a>
    </footer>
  );
}
