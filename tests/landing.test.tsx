// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// motion's scroll observers do not exist in jsdom; a plain element keeps the markup under test.
vi.mock("motion/react", () => ({
  useReducedMotion: () => true,
  motion: new Proxy({}, { get: () => ({ children }: { children: React.ReactNode }) => <div>{children}</div> }),
}));

import { LandingPage } from "@/components/landing/landing-page";
import { config } from "@/proxy";
import { BANNED_ON_SCREEN } from "@/lib/explain";
import { BENTO, FAQ, FOOTER, HERO } from "@/lib/landing-content";

afterEach(cleanup);

describe("landing page", () => {
  it("has two CTAs into the right views and a logo that links to / with no params", () => {
    render(<LandingPage />);
    expect(screen.getByRole("link", { name: HERO.kam.label }).getAttribute("href")).toBe("/dashboard?view=kam");
    expect(screen.getByRole("link", { name: HERO.customer.label }).getAttribute("href")).toBe("/story/game?view=customer");
    expect(screen.getByRole("link", { name: "Threadline home" }).getAttribute("href")).toBe("/");
  });
  it("shows five bento cards; the guide card says Coming later and has no link or input", () => {
    render(<LandingPage />);
    const cards = screen.getAllByRole("article");
    expect(cards).toHaveLength(5);
    const guide = cards.find((c) => within(c).queryByText("AI guide"))!;
    expect(within(guide).getByText("Coming later")).toBeTruthy();
    expect(guide.querySelector("a, input, textarea, button")).toBeNull();
  });
  it("lists eight FAQ questions and the footer note", () => {
    render(<LandingPage />);
    expect(FAQ).toHaveLength(8);
    for (const q of FAQ) expect(screen.getByRole("button", { name: q.question })).toBeTruthy();
    expect(screen.getByText(FOOTER)).toBeTruthy();
  });
  it("renders without the app shell", () => {
    render(<LandingPage />);
    expect(screen.queryByLabelText("Main", { selector: "aside" })).toBeNull();
    expect(screen.queryByLabelText("AI assistant")).toBeNull();
  });
});

describe("landing copy", () => {
  const lines = [HERO.headline, HERO.subline, HERO.kam.label, HERO.customer.label, FOOTER, ...BENTO.flatMap((b) => [b.title, b.line]), ...FAQ.flatMap((q) => [q.question, q.answer])];
  it("has no digit and no banned word", () => {
    for (const t of lines) {
      expect(t, t).not.toMatch(/\d/);
      expect(t, t).not.toMatch(BANNED_ON_SCREEN);
    }
  });
  it("never claims audit-ready reporting or a saved tree", () => {
    for (const t of lines) {
      expect(t, t).not.toMatch(/trees? (?:saved|were saved)/i);
      if (/audit/i.test(t)) expect(t).toBe(FOOTER);
    }
  });
});

describe("proxy", () => {
  it("does not match the landing page", () => {
    expect(config.matcher).toBe("/dashboard/:path*");
    expect(new RegExp(`^${config.matcher.replace("/:path*", "(?:/.*)?")}$`).test("/")).toBe(false);
  });
});
