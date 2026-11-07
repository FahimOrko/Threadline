// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Notice } from "@/components/notice";

afterEach(cleanup);

describe("Notice", () => {
  it("is not marked for print hiding by default", () => {
    render(<Notice>hello</Notice>);
    expect(screen.getByRole("status").getAttribute("data-print")).toBeNull();
  });
  it("marks a screen-only notice so a print route can hide it", () => {
    render(<Notice screenOnly>dropped</Notice>);
    const el = screen.getByRole("status");
    expect(el.getAttribute("data-print")).toBe("hide");
    expect(el.className).toContain("print:hidden");
  });
});
