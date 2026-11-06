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
const shell = () => render(<AppShell customers={customers}>x</AppShell>);

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
