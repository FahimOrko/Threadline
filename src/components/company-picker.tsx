import { ChoiceButton } from "@/components/choice-button";
import { Panel } from "@/components/panel";

/** The customer view's "Which company are you from?" on pages other than the game (same question and buttons). Every option is a link that sets the customer and keeps the other params. */
export function CompanyPicker({ question, options }: { question: string; options: { id: string; label: string; href: string }[] }) {
  return (
    <Panel data-slot="company-picker" className="mx-auto max-w-2xl space-y-3">
      <h2 className="text-lg font-medium">{question}</h2>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {options.map((o) => (
          <ChoiceButton key={o.id} href={o.href} label={o.label} />
        ))}
      </div>
    </Panel>
  );
}
