// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

let path = "/story/print";
vi.mock("next/navigation", () => ({
  usePathname: () => path,
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(""),
}));

import { AppShell } from "@/components/app-shell";
import { ShowMathInlineProvider, ShowMathPopover } from "@/components/show-math";
import { STORY_PRINT_PATH } from "@/lib/story/print";

afterEach(cleanup);
const shell = () => render(<AppShell customers={[{ customer_id: "C1", name: "A" }]} baselines={[{ baseline_id: "B", name: "b" }]}>story</AppShell>);
const math = { formula: "a / b", inputs: [{ label: "Wearers", value: "10" }], assumptionIds: ["T001"], baseline: "local laundry", range: { low: "1", base: "2", high: "3" } };

describe("print route", () => {
  it("path constant", () => expect(STORY_PRINT_PATH).toBe("/story/print"));
  it("AppShell renders no header or nav on the print path", () => {
    path = STORY_PRINT_PATH;
    shell();
    expect(screen.queryByRole("navigation", { name: "Views" })).toBeNull();
    expect(screen.getByText("story")).toBeTruthy();
  });
  it("AppShell keeps the shell elsewhere", () => {
    path = "/story";
    shell();
    expect(screen.getByRole("navigation", { name: "Views" })).toBeTruthy();
  });
});

describe("inline Show math", () => {
  it("expands in print mode with no trigger", () => {
    render(<ShowMathInlineProvider inline><ShowMathPopover {...math} /></ShowMathInlineProvider>);
    expect(screen.getByText("a / b")).toBeTruthy();
    expect(screen.getByText("T001")).toBeTruthy();
    expect(screen.queryByText("Show math")).toBeNull();
  });
  it("stays a popover trigger by default", () => {
    render(<ShowMathPopover {...math} />);
    expect(screen.getByText("Show math")).toBeTruthy();
    expect(screen.queryByText("a / b")).toBeNull();
  });
});

describe("cover block", () => {
  const cover = async (priorities?: string) => {
    const { StoryDocument } = await import("@/app/story/_story-document");
    const el = await StoryDocument({ searchParams: Promise.resolve(priorities ? { priorities } : {}), mode: "print" });
    return render(el);
  };
  it("lists priorities in pick order with a generation date", async () => {
    await cover("cost,hygiene");
    const dd = screen.getByText("Cost, Hygiene");
    expect(dd).toBeTruthy();
    expect(screen.getByText("Generated").nextElementSibling?.textContent).toMatch(/\d{4}/);
    expect(screen.queryByText("Export PDF")).toBeNull();
  });
  it("says none chosen", async () => {
    await cover();
    expect(screen.getByText("None chosen")).toBeTruthy();
  });
});
describe("export link", () => {
  it("carries picks only when present", async () => {
    const { StoryDocument } = await import("@/app/story/_story-document");
    const href = async (sp: Record<string, string>) => {
      render(await StoryDocument({ searchParams: Promise.resolve(sp), mode: "screen" }));
      const h = screen.getByText("Export PDF").getAttribute("href")!;
      cleanup();
      return h;
    };
    expect(await href({ priorities: "water,cost", sensitivity: "low" })).toMatch(/sensitivity=low.*priorities=water%2Ccost/);
    expect(await href({})).not.toContain("priorities");
  });
});
