import { LandingBento } from "@/components/landing/landing-bento";
import { LandingFaq } from "@/components/landing/landing-faq";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHero } from "@/components/landing/landing-hero";

export function LandingPage() {
  return (
    <div id="top" data-landing className="min-w-[1200px] bg-background">
      <LandingHero />
      <main>
        <LandingBento />
        <LandingFaq />
      </main>
      <LandingFooter />
    </div>
  );
}
