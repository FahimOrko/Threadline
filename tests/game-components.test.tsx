// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

import { ChoiceButton } from "@/components/choice-button";
import { DialogueBox } from "@/components/dialogue-box";

afterEach(cleanup);

describe("DialogueBox footer", () => {
  it("shows Previous as a link beside the Next link, not nested in it", () => {
    render(<DialogueBox speaker="kam" tag="KAM" text="Hello" href="/next" previousHref="/back" />);
    const prev = screen.getByRole("link", { name: "Previous" });
    const next = screen.getByRole("link", { name: /Next$/ });
    expect(prev.getAttribute("href")).toBe("/back");
    expect(next.getAttribute("href")).toBe("/next");
    expect(next.contains(prev)).toBe(false);
  });
  it("shows Previous disabled, not a link, on the first beat", () => {
    render(<DialogueBox speaker="kam" tag="KAM" text="Hello" href="/next" previousHref={null} />);
    expect(screen.queryByRole("link", { name: "Previous" })).toBeNull();
    expect(screen.getByText("Previous").closest("[aria-disabled='true']")).toBeTruthy();
  });
  it("shows Previous on a question beat that holds choices", () => {
    render(
      <DialogueBox speaker="kam" tag="KAM" text="Q?" previousHref="/back">
        <ChoiceButton href="/a" label="A" />
      </DialogueBox>,
    );
    expect(screen.getByRole("link", { name: "Previous" }).getAttribute("href")).toBe("/back");
  });
  it("leaves Previous out when none is given", () => {
    render(<DialogueBox speaker="kam" tag="KAM" text="Hello" href="/next" />);
    expect(screen.queryByText("Previous")).toBeNull();
  });
});

describe("ChoiceButton selected", () => {
  it("marks the chosen answer in words and aria-current, and nothing otherwise", () => {
    render(
      <>
        <ChoiceButton href="/a" label="A" selected />
        <ChoiceButton href="/b" label="B" />
      </>,
    );
    expect(screen.getAllByText("Chosen")).toHaveLength(1);
    expect(screen.getByRole("link", { name: /^A/ }).getAttribute("aria-current")).toBe("true");
    expect(screen.getByRole("link", { name: /^B/ }).getAttribute("aria-current")).toBeNull();
  });
});
