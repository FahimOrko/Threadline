"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FAQ, FAQ_INTRO, type FaqItem } from "@/lib/landing-content";

/** Navigation-guide questions from the static content module (shadcn Accordion on base-ui), centred in one column. */
export function LandingFaq({ items = FAQ }: { items?: FaqItem[] }) {
  return (
    <section aria-labelledby="landing-faq" className="mx-auto max-w-6xl px-8 pb-24 pt-8">
      <div className="mb-10 text-center">
        <h2 id="landing-faq" className="text-3xl font-semibold tracking-tight">Finding your way around</h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">{FAQ_INTRO}</p>
      </div>
      <Accordion className="mx-auto max-w-[720px]">
        {items.map((q) => (
          <AccordionItem key={q.id} value={q.id}>
            <AccordionTrigger className="items-center py-5 text-base">{q.question}</AccordionTrigger>
            <AccordionContent className="pb-2 leading-relaxed text-muted-foreground">{q.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
