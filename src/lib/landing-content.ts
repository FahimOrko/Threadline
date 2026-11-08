// Static copy for the landing page (ADR 0034). No figures: a number here would need provenance. The FAQ is plain data so a future AI guide can read it.

export const HERO = {
  headline: "Your year of laundry, told as a story.",
  subline: "See what working with Lindström saved and how we worked it out, from either side of the table.",
  kam: { label: "Step in as Lindström's account manager", href: "/dashboard?view=kam" },
  customer: { label: "See it as a customer", href: "/story/game?view=customer" },
} as const;

export type BentoId = "dashboard" | "story" | "world" | "export" | "guide";
export type BentoEntry = { id: BentoId; title: string; line: string; comingLater?: true };

export const BENTO: BentoEntry[] = [
  { id: "dashboard", title: "Dashboard", line: "Every site, month and measure in one place, each figure with its source." },
  { id: "story", title: "Story review", line: "A short guided conversation that turns the year into choices you can talk through." },
  { id: "world", title: "Impact World", line: "Your savings as a picture you can walk around in. It opens once the review is done." },
  { id: "export", title: "Export", line: "Take the story away as a Markdown or JSON file." },
  {
    id: "guide",
    title: "AI guide",
    line: "A guide that explains what a figure means, how we calculated it and where to find things in the app, for the account manager and the customer alike. It explains; it never states a figure itself.",
    comingLater: true,
  },
];

export const COMING_LATER = "Coming later";

export type FaqItem = { id: string; question: string; answer: string };

export const FAQ: FaqItem[] = [
  { id: "dashboard", question: "What is the Dashboard?", answer: "It is the account manager's working view: every site, month and measure for one customer, with a short note on where each figure comes from. Use it to find out what is behind a number before you talk about it." },
  { id: "story", question: "What is the Story?", answer: "A short guided conversation that walks through the year and asks what matters most to the customer. You make a few choices, see what each one changes, and finish with a report you can read or take away." },
  { id: "world", question: "What is Impact World?", answer: "A picture of the customer's impact on the world, split into zones. The first zone shows the emissions avoided as young trees, as an illustration to help you picture the size of it, not as a measured count." },
  { id: "world-locked", question: "Why does Impact World open after the review in the customer view?", answer: "The picture makes more sense once you have seen how the year added up, so the customer view keeps it closed until the review is finished. The account manager can open it at any time." },
  { id: "customer", question: "How do I switch customer?", answer: "In the account manager's view, use the customer menu at the top of the left sidebar. In the customer view you pick your company at the start of the review, and Start over lets you pick again." },
  { id: "view", question: "How do I switch between the account manager and the customer view?", answer: "Use the two links at the bottom of the left sidebar. The logo takes you back to this page, where you can choose again." },
  { id: "export", question: "How does export work?", answer: "At the end of the Story report there is a card with two buttons. One saves the story as a Markdown file you can read or paste into a document, the other as a JSON file for other tools. Both say they use synthetic data." },
  { id: "guide", question: "What will the AI guide do?", answer: "It will explain what a figure means, how it was calculated and where to find things in the app, for the account manager and the customer alike. It will never state a figure itself. It is coming later, so for now these answers are the guide." },
];

export const FAQ_INTRO = "These answers cover where things live and how to move around the app.";

export const FOOTER = "Synthetic data, not audit-ready";
