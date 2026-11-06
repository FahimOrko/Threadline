// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { ProvenanceChip } from "@/components/provenance-chip";
import { ShowMathPopover } from "@/components/show-math";
import { chipTone } from "@/lib/provenance";

afterEach(cleanup);

describe("chipTone", () => {
  it("is certain for calculated synthetic values", () => {
    expect(chipTone(["CALCULATED"], "SYNTHETIC")).toBe("certain");
  });
  it("is uncertain for estimated values", () => {
    expect(chipTone(["ESTIMATED"], "SYNTHETIC")).toBe("uncertain");
  });
  it("takes the least certain method", () => {
    expect(chipTone(["ALLOCATED", "ESTIMATED"], "SYNTHETIC")).toBe("uncertain");
  });
  it("treats an assumption source as uncertain", () => {
    expect(chipTone(["CALCULATED"], "ASSUMPTION")).toBe("uncertain");
  });
});

describe("ProvenanceChip", () => {
  it("shows method and source labels", () => {
    const { container } = render(<ProvenanceChip methods={["CALCULATED"]} source="SYNTHETIC" />);
    expect(container.textContent).toContain("Calculated");
    expect(container.textContent).toContain("Synthetic");
    expect(container.querySelector("[data-tone]")?.getAttribute("data-tone")).toBe("certain");
    expect(container.querySelectorAll("svg").length).toBe(2);
  });
  it("shows both methods with the amber tone for allocated + estimated", () => {
    const { container } = render(<ProvenanceChip methods={["ALLOCATED", "ESTIMATED"]} source="SYNTHETIC_TEAM" />);
    expect(container.textContent).toContain("Allocated");
    expect(container.textContent).toContain("Estimated");
    expect(container.querySelector("[data-tone]")?.getAttribute("data-tone")).toBe("uncertain");
  });
});

describe("ProvenanceChip layout", () => {
  it("can wrap between parts but never inside a label", () => {
    const { container } = render(
      <ProvenanceChip methods={["ALLOCATED", "ESTIMATED", "ILLUSTRATIVE", "MANUAL_EDIT"]} source="PUBLIC_REFERENCE" />,
    );
    const root = container.querySelector("[data-tone]")!;
    expect(root.className).toContain("max-w-full");
    expect(root.className).toContain("flex-wrap");
    const labels = [...root.querySelectorAll("span.whitespace-nowrap")];
    expect(labels.map((l) => l.textContent)).toEqual([
      "Allocated", "Estimated", "Illustrative", "Manual edit", "Public reference",
    ]);
  });
});

describe("ShowMathPopover", () => {
  const props = {
    formula: "a x b",
    inputs: [{ label: "a", value: "1" }],
    assumptionIds: ["A-1"],
    baseline: "Local laundry",
    range: { low: "1", base: "2", high: "3" },
  };
  it("opens with Enter, reports aria-expanded, and closes with Esc", async () => {
    const user = userEvent.setup();
    render(<ShowMathPopover {...props} />);
    const btn = screen.getByRole("button", { name: /show math/i });
    expect(btn.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByText("A-1")).toBeNull();
    btn.focus();
    await user.keyboard("{Enter}");
    expect(await screen.findByText("A-1")).toBeTruthy();
    expect(btn.getAttribute("aria-expanded")).toBe("true");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByText("A-1")).toBeNull());
    expect(btn.getAttribute("aria-expanded")).toBe("false");
  });
  it("closes on an outside click", async () => {
    const user = userEvent.setup();
    render(<ShowMathPopover {...props} />);
    await user.click(screen.getByRole("button", { name: /show math/i }));
    expect(await screen.findByText("A-1")).toBeTruthy();
    await user.click(document.body);
    await waitFor(() => expect(screen.queryByText("A-1")).toBeNull());
  });
});

describe("ProvenanceChip compact", () => {
  it("shows only the method glyph, with the full text as the accessible name", () => {
    const { container } = render(<ProvenanceChip compact methods={["CALCULATED"]} source="SYNTHETIC" />);
    const btn = screen.getByRole("button", { name: "Calculated, Synthetic" });
    expect(btn.textContent).toBe("");
    expect(container.querySelectorAll("svg").length).toBe(1);
    expect(btn.getAttribute("data-tone")).toBe("certain");
  });
  it("shows both glyphs and the amber tone for allocated + estimated", () => {
    const { container } = render(<ProvenanceChip compact methods={["ALLOCATED", "ESTIMATED"]} source="SYNTHETIC" />);
    expect(container.querySelectorAll("svg").length).toBe(2);
    const btn = screen.getByRole("button", { name: "Allocated, Estimated, Synthetic" });
    expect(btn.getAttribute("data-tone")).toBe("uncertain");
  });
  it("has the same tone as the full chip for the same value", () => {
    const { container } = render(
      <>
        <ProvenanceChip methods={["ESTIMATED"]} source="ASSUMPTION" />
        <ProvenanceChip compact methods={["ESTIMATED"]} source="ASSUMPTION" />
      </>,
    );
    const tones = [...container.querySelectorAll("[data-tone]")].map((e) => e.getAttribute("data-tone"));
    expect(tones).toEqual(["uncertain", "uncertain"]);
  });
  it("is reachable by keyboard and shows the tooltip on focus", async () => {
    render(<ProvenanceChip compact methods={["CALCULATED"]} source="SYNTHETIC" />);
    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Calculated, Synthetic" }));
    expect(await screen.findByText("Calculated, Synthetic", {}, { timeout: 4000 })).toBeTruthy(); // the popup text; the label is an attribute
  });
  it("shows the tooltip on hover", async () => {
    render(<ProvenanceChip compact methods={["MEASURED"]} source="SYNTHETIC" />);
    await userEvent.hover(screen.getByRole("button", { name: "Measured, Synthetic" }));
    expect(await screen.findByText("Measured, Synthetic", {}, { timeout: 4000 })).toBeTruthy(); // hover opens after the tooltip delay
  });
});
