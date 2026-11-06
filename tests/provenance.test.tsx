// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { ProvenanceChip } from "@/components/provenance-chip";
import { ShowMath } from "@/components/show-math";
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

describe("ShowMath", () => {
  const props = {
    formula: "a x b",
    inputs: [{ label: "a", value: "1" }],
    assumptionIds: ["A-1"],
    baseline: "Local laundry",
    range: { low: "1", base: "2", high: "3" },
  };
  it("toggles with Enter and reports aria-expanded", async () => {
    const user = userEvent.setup();
    render(<ShowMath {...props} />);
    const btn = screen.getByRole("button", { name: /show math/i });
    expect(btn.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByText("A-1")).toBeNull();
    btn.focus();
    await user.keyboard("{Enter}");
    expect(btn.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("A-1")).toBeTruthy();
    await user.keyboard("{Enter}");
    expect(btn.getAttribute("aria-expanded")).toBe("false");
  });
});
