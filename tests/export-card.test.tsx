// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ExportCard } from "@/components/export-card";
import { BANNED_ON_SCREEN } from "@/lib/explain";

afterEach(cleanup);

describe("ExportCard", () => {
  it("has both downloads and plain wording", () => {
    const { container } = render(<ExportCard md="# a" json="{}" fileBase="x" />);
    expect(screen.getByRole("button", { name: /Markdown/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /JSON/ })).toBeTruthy();
    const text = container.textContent ?? "";
    expect(text).not.toMatch(BANNED_ON_SCREEN);
    expect(text).not.toMatch(/\d/);
    expect(container.querySelector("#export")).not.toBeNull();
  });
  it("saves the given text under the file name with its extension", async () => {
    URL.createObjectURL = vi.fn(() => "blob:x");
    URL.revokeObjectURL = vi.fn();
    const names: string[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      names.push(this.download);
    });
    render(<ExportCard md="# a" json="{}" fileBase="acme-2025-01-to-2025-12-value-review" />);
    await userEvent.click(screen.getByRole("button", { name: /Markdown/ }));
    await userEvent.click(screen.getByRole("button", { name: /JSON/ }));
    expect(names).toEqual(["acme-2025-01-to-2025-12-value-review.md", "acme-2025-01-to-2025-12-value-review.json"]);
  });
});
