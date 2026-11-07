// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const push = vi.fn();
let search = "";
vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams(search),
}));

import { AppShell } from "@/components/app-shell";

const customers = [
  { customer_id: "CUST001", name: "NorthStar Foods Group" },
  { customer_id: "CUST002", name: "Other Co" },
];
const baselines = [
  { baseline_id: "B_LOCAL", name: "local laundry" },
  { baseline_id: "B_HOME", name: "home washing" },
  { baseline_id: "B_INHOUSE", name: "in-house laundry" },
];
const shell = () => render(<AppShell customers={customers} baselines={baselines}>x</AppShell>);

beforeEach(() => {
  push.mockClear();
  search = "";
});
afterEach(cleanup);

describe("AppShell customer picker", () => {
  it("shows NorthStar by default", () => {
    shell();
    expect(screen.getByRole("combobox", { name: "Customer" }).textContent).toContain("NorthStar Foods Group");
  });
  it("shows the same customer as the page for an unknown value", () => {
    search = "customer=NOPE";
    shell();
    expect(screen.getByRole("combobox", { name: "Customer" }).textContent).toContain("NorthStar Foods Group");
  });
  it("lists every customer and navigates with the chosen id", async () => {
    shell();
    await userEvent.click(screen.getByRole("combobox", { name: "Customer" }));
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["NorthStar Foods Group", "Other Co"]);
    await userEvent.click(screen.getByRole("option", { name: "Other Co" }));
    expect(push).toHaveBeenCalledWith("/dashboard?customer=CUST002");
  });
});

describe("AppShell view links", () => {
  it("keep the selected customer", () => {
    search = "customer=CUST002";
    shell();
    expect(screen.getByRole("link", { name: "Story" }).getAttribute("href")).toBe("/story?customer=CUST002");
  });
  it("stay clean without a customer param", () => {
    shell();
    expect(screen.getByRole("link", { name: "Story" }).getAttribute("href")).toBe("/story");
  });
});

describe("AppShell sidebar on narrow screens", () => {
  it("hides the sidebar, its separator and the toggle below md", () => {
    const { container } = shell();
    const aside = screen.getByLabelText("AI assistant", { selector: "aside" });
    expect(aside.className).toMatch(/\bhidden\b.*\bmd:block\b/);
    expect(aside.previousElementSibling?.className).toMatch(/\bhidden\b.*\bmd:block\b/);
    const toggle = container.querySelector('button[aria-label$="AI sidebar"]');
    expect(toggle?.className).toMatch(/\bhidden\b.*\bmd:inline-flex\b/);
  });
});

describe("AppShell baseline and sensitivity selectors", () => {
  it("shows local laundry and base by default", () => {
    shell();
    expect(screen.getByRole("combobox", { name: "Baseline" }).textContent).toContain("local laundry");
    expect(screen.getByRole("combobox", { name: "Sensitivity" }).textContent).toContain("base");
  });
  it("falls back for unknown values, like the page", () => {
    search = "baseline=NOPE&sensitivity=extreme";
    shell();
    expect(screen.getByRole("combobox", { name: "Baseline" }).textContent).toContain("local laundry");
    expect(screen.getByRole("combobox", { name: "Sensitivity" }).textContent).toContain("base");
  });
  it("changing the baseline keeps customer and sensitivity in the address", async () => {
    search = "customer=CUST002&sensitivity=high";
    shell();
    await userEvent.click(screen.getByRole("combobox", { name: "Baseline" }));
    await userEvent.click(await screen.findByRole("option", { name: "home washing" }));
    expect(push).toHaveBeenCalledWith("/dashboard?customer=CUST002&sensitivity=high&baseline=B_HOME");
  });
  it("changing the customer keeps baseline and sensitivity", async () => {
    search = "baseline=B_HOME&sensitivity=low";
    shell();
    await userEvent.click(screen.getByRole("combobox", { name: "Customer" }));
    await userEvent.click(await screen.findByRole("option", { name: "Other Co" }));
    expect(push).toHaveBeenCalledWith("/dashboard?baseline=B_HOME&sensitivity=low&customer=CUST002");
  });
  it("view links keep all three params", () => {
    search = "customer=CUST002&baseline=B_HOME&sensitivity=low";
    shell();
    expect(screen.getByRole("link", { name: "Story" }).getAttribute("href")).toBe("/story?customer=CUST002&baseline=B_HOME&sensitivity=low");
  });
});
