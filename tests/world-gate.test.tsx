// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { WorldGate } from "@/components/world-gate";
import { isEnded, markEnded } from "@/lib/story/progress";

const gate = (p: Partial<Parameters<typeof WorldGate>[0]> = {}) => (
  <WorldGate view="customer" customer="C1" ended={false} hint="Finish the review to open your Impact World" gameHref="/story/game?view=customer" {...p}>
    <p>hub</p>
  </WorldGate>
);
beforeEach(() => sessionStorage.clear());
afterEach(cleanup);

describe("WorldGate", () => {
  it("locks the customer view before the ending and links back to the game", () => {
    render(gate());
    expect(screen.queryByText("hub")).toBeNull();
    expect(screen.getByText("Finish the review to open your Impact World")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Go to the review" }).getAttribute("href")).toBe("/story/game?view=customer");
  });

  it("opens once the ending is recorded", () => {
    markEnded("customer", "C1");
    render(gate());
    expect(screen.getByText("hub")).toBeTruthy();
  });

  it("is never locked in the KAM view", () => {
    render(gate({ view: "kam" }));
    expect(screen.getByText("hub")).toBeTruthy();
  });

  it("opens on ended=1 and records the ending", () => {
    render(gate({ ended: true }));
    expect(screen.getByText("hub")).toBeTruthy();
    expect(isEnded("customer", "C1")).toBe(true);
  });

  it("opens on ended=1 when storage throws", () => {
    const real = Storage.prototype.getItem;
    Storage.prototype.getItem = () => { throw new Error("blocked"); };
    try {
      render(gate({ ended: true }));
      expect(screen.getByText("hub")).toBeTruthy();
    } finally {
      Storage.prototype.getItem = real;
    }
  });

  it("renders a neutral placeholder on the server, with neither the lock nor the content", () => {
    const html = renderToString(gate());
    expect(html).toContain('aria-label="Loading"');
    expect(html).not.toContain("hub");
    expect(html).not.toContain("Finish the review");
  });
});
