import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { WORLD_PATH, ZONES, resolveZone, worldHref } from "@/lib/world";

describe("zone registry", () => {
  it("lists the six zones in fixed order with Trees built and the rest coming soon", () => {
    expect(ZONES.map((z) => [z.id, z.status])).toEqual([["trees", "built"], ["water", "soon"], ["air", "soon"], ["energy", "soon"], ["circularity", "soon"], ["delivery", "soon"]]);
  });
  it("gives Air no headline Fact and every other zone one", () => {
    expect(ZONES.find((z) => z.id === "air")!.headlineFactId).toBeUndefined();
    expect(ZONES.filter((z) => z.id !== "air").every((z) => z.headlineFactId)).toBe(true);
  });
});

describe("resolveZone", () => {
  it("is the hub with no value", () => expect(resolveZone(undefined)).toEqual({ zone: null, rejected: null }));
  it("finds a built zone", () => expect(resolveZone("trees").zone?.id).toBe("trees"));
  it("treats a zone not built yet as the hub, without a notice", () => expect(resolveZone("water")).toEqual({ zone: null, rejected: null }));
  it("falls back to the hub and names an unknown value", () => expect(resolveZone("NOPE")).toEqual({ zone: null, rejected: "NOPE" }));
});

describe("worldHref", () => {
  it("keeps every other param, including view and unknown ones", () => {
    const u = new URL(worldHref({ view: "customer", customer: "CUST002", x: "1", zone: "trees" }, null), "http://x");
    expect(u.pathname).toBe(WORLD_PATH);
    expect(Object.fromEntries(u.searchParams)).toEqual({ view: "customer", customer: "CUST002", x: "1" });
  });
  it("sets the zone", () => expect(new URL(worldHref({ view: "customer" }, "trees"), "http://x").searchParams.get("zone")).toBe("trees"));
});

describe("world sources", () => {
  it("never uses Math.random, so server and browser markup match", () => {
    for (const f of ["src/components/trees-stage.tsx", "src/components/world-hub.tsx"]) expect(readFileSync(f, "utf8")).not.toMatch(/Math\.random/);
  });
});
