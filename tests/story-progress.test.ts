import { describe, expect, it } from "vitest";
import { clearProgress, isEnded, markEnded, readProgress, writeProgress } from "@/lib/story/progress";

function memory() {
  const m = new Map<string, string>();
  return {
    m,
    get length() { return m.size; },
    key: (i: number) => [...m.keys()][i] ?? null,
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
  };
}
const q = (s: string) => new URLSearchParams(s);
const boom = { length: 0, key: () => { throw new Error("x"); }, getItem: () => { throw new Error("x"); }, setItem: () => { throw new Error("x"); }, removeItem: () => { throw new Error("x"); } };

describe("game progress", () => {
  it("round trips the game keys only, and a bare read finds the last customer", () => {
    const s = memory();
    writeProgress("customer", q("view=customer&scene=3&beat=2&customer=C1&baseline=B_X&priorities=water,cost"), false, s);
    expect(readProgress("customer", null, s)).toEqual({ query: "scene=3&beat=2&customer=C1&baseline=B_X&priorities=water,cost", ended: false });
    expect(readProgress("customer", "C1", s)?.query).not.toContain("view");
    expect(readProgress("kam", null, s)).toBeNull();
  });

  it("keeps the ended flag across later writes and reports it", () => {
    const s = memory();
    writeProgress("customer", q("scene=end&customer=C1"), true, s);
    writeProgress("customer", q("scene=4&beat=1&customer=C1"), false, s);
    expect(isEnded("customer", "C1", s)).toBe(true);
    expect(isEnded("customer", "C2", s)).toBe(false);
  });

  it("marks the ending without a stored address", () => {
    const s = memory();
    markEnded("customer", "C1", s);
    expect(isEnded("customer", "C1", s)).toBe(true);
    expect(isEnded("customer", null, s)).toBe(true);
  });

  it("ignores and removes corrupt or unknown values", () => {
    const s = memory();
    s.setItem("lvr.game.kam.none", "{not json");
    expect(readProgress("kam", null, s)).toBeNull();
    s.setItem("lvr.game.kam.none", JSON.stringify({ q: "scene=9", ended: false }));
    expect(readProgress("kam", null, s)).toBeNull();
    expect(s.m.has("lvr.game.kam.none")).toBe(false);
    s.setItem("lvr.game.kam.none", JSON.stringify({ q: "evil=1", ended: false }));
    expect(readProgress("kam", null, s)).toBeNull();
  });

  it("clears every record of the view and leaves the other view", () => {
    const s = memory();
    writeProgress("customer", q("scene=2&customer=C1"), true, s);
    writeProgress("kam", q("scene=2&customer=C1"), false, s);
    clearProgress("customer", s);
    expect(isEnded("customer", "C1", s)).toBe(false);
    expect(readProgress("customer", null, s)).toBeNull();
    expect(readProgress("kam", "C1", s)).not.toBeNull();
  });

  it("falls back to a fresh game when storage throws or is missing", () => {
    expect(() => { writeProgress("kam", q("scene=1"), false, boom); markEnded("kam", null, boom); clearProgress("kam", boom); }).not.toThrow();
    expect(readProgress("kam", null, boom)).toBeNull();
    expect(isEnded("kam", null, boom)).toBe(false);
    expect(readProgress("kam", null, null)).toBeNull();
  });
});
