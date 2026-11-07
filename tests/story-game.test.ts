import { describe, expect, it } from "vitest";
import { generatedSource } from "@/lib/data/generated";
import { storyFacts } from "@/lib/story/facts";
import { buildStory } from "@/lib/story";
import { PRIORITIES } from "@/lib/selection";
import {
  ALL_TEMPLATES,
  CUSTOMER_VIEW_INTRO,
  IMPACT_WORLD_HREF,
  SCENES,
  beatsFor,
  beforeParams,
  changedFacts,
  clampBeat,
  exitHref,
  gameHref,
  hasChoice,
  leadingChapter,
  optionsFor,
  renderLine,
  resolveBeat,
  resolveScene,
  resolveState,
  stepHref,
} from "@/lib/story/game";

const period = { from: "2025-01", to: "2025-12" };
const labels = Object.fromEntries(PRIORITIES.map((p) => [p, p])) as Record<(typeof PRIORITIES)[number], string>;

async function factsFor(params: Record<string, string | undefined>) {
  const data = await generatedSource.load();
  const st = resolveState(data, params);
  return { data, st, facts: storyFacts(data, { customerId: st.customer.customer_id, period }, st.baseline, st.sensitivity).facts };
}

// Explicit and small: units and ids that legitimately contain digits. Anything else with a digit is a number a character must not say.
const ALLOWED = [/\bCO2e\b/g, /\bT\d{3}\b/g];
const TOKEN = /\{\{fact:([a-z0-9_]+)\}\}/g;
const stripped = (t: string) => ALLOWED.reduce((s, re) => s.replace(re, ""), t.replace(TOKEN, ""));

describe("dialogue templates", () => {
  const leadLines = PRIORITIES.map((p) => leadingChapter(p).lines[0]);
  it("hold no digit outside a fact token, CO2e or a T-prefixed assumption id", () => {
    for (const t of ALL_TEMPLATES) expect(stripped(t), t).not.toMatch(/\d/);
  });
  it("catch a bare number", () => expect(stripped("We saved 40 kg of CO2e under T002")).toMatch(/\d/));
  it("use only Fact ids that exist", async () => {
    const { facts } = await factsFor({});
    const ids = [...ALL_TEMPLATES, ...leadLines].flatMap((t) => [...t.matchAll(TOKEN)].map((m) => m[1]));
    expect(ids.length).toBeGreaterThan(5);
    for (const id of new Set(ids)) expect(facts.some((f) => f.id === id), id).toBe(true);
  });
  it("frame sensitivity as the declared T002 spread, not a measured range", () => {
    const s = SCENES.find((x) => x.id === "sensitivity")!;
    const text = [...s.intro.map((l) => l.text), s.answer].join(" ");
    expect(text).toMatch(/T002/);
    expect(text).toMatch(/declared/);
    expect(text).toMatch(/not a measured range/);
  });
  it("resolve every scene line for every customer without throwing", async () => {
    const data = await generatedSource.load();
    for (const c of data.customers) {
      const { facts, st } = await factsFor({ customer: c.customer_id });
      const words = { baseline: st.short, sensitivity: st.sensitivity, company: c.customer_name, chapter: "X", lead: leadLines[0] };
      for (const t of ALL_TEMPLATES) expect(renderLine(t, facts, words)).not.toMatch(/\{/);
    }
  });
  it("write a null Fact as Needs input", async () => {
    const { facts, st } = await factsFor({});
    expect(renderLine("Cost: {{fact:cost_of_unused_allocation}}", facts, { baseline: st.short, sensitivity: st.sensitivity, company: "" })).toBe("Cost: Needs input");
  });
});

describe("scene and beat resolvers", () => {
  it("default to scene 1, beat 0", () => {
    expect(resolveScene(undefined)).toEqual({ scene: 1, rejected: null });
    expect(resolveBeat(undefined, 5)).toEqual({ beat: 0, rejected: null });
  });
  it("accept 1 to 4 and end", () => {
    expect(resolveScene("3").scene).toBe(3);
    expect(resolveScene("end").scene).toBe("end");
  });
  it.each(["0", "5", "x", "", "1.5"])("reject scene %j and name it", (v) => expect(resolveScene(v)).toEqual({ scene: 1, rejected: v }));
  it.each(["-1", "9", "x"])("reject beat %j and name it", (v) => expect(resolveBeat(v, 5)).toEqual({ beat: 0, rejected: v }));
  it("clamps a reaction without a choice back to the question", () => {
    const beats = beatsFor(SCENES[1], "kam");
    const ask = beats.findIndex((b) => b.kind === "ask");
    expect(clampBeat(beats, ask + 1, false)).toBe(ask);
    expect(clampBeat(beats, ask + 2, false)).toBe(ask);
    expect(clampBeat(beats, ask + 1, true)).toBe(ask + 1);
    expect(clampBeat(beats, 0, false)).toBe(0);
  });
  it("sees a choice only when the lever is in the address", () => {
    expect(hasChoice(SCENES[1], { baseline: "B_HOME" })).toBe(true);
    expect(hasChoice(SCENES[1], {})).toBe(false);
    expect(hasChoice(SCENES[3], { priorities: "" })).toBe(false);
  });
});

describe("links keep every existing param", () => {
  const params = { customer: "CUST002", view: "customer", x: ["1", "2"], baseline: "B_HOME" };
  const state = { customer: "CUST002", baseline: "B_HOME", sensitivity: "high", priorities: ["cost"] as const };
  const q = (href: string) => new URLSearchParams(href.split("?")[1]);
  it("a step keeps unknown and repeated params and sets scene, beat and the choice", () => {
    const h = q(stepHref(params, 3, 4, { sensitivity: "low" }));
    expect(h.get("view")).toBe("customer");
    expect(h.getAll("x")).toEqual(["1", "2"]);
    expect(h.get("scene")).toBe("3");
    expect(h.get("beat")).toBe("4");
    expect(h.get("sensitivity")).toBe("low");
    expect(h.get("customer")).toBe("CUST002");
  });
  it("a choice replaces the lever instead of repeating it", () => expect(q(stepHref(params, 2, 3, { baseline: "B_LOCAL" })).getAll("baseline")).toEqual(["B_LOCAL"]));
  it.each(["/story", "/story/print"])("%s keeps unknown params, spells out the four levers and drops scene and beat", (path) => {
    const href = exitHref(path, { ...params, scene: "end", beat: "2" }, state);
    expect(href.startsWith(`${path}?`)).toBe(true);
    const h = q(href);
    expect(h.get("view")).toBe("customer");
    expect(h.getAll("x")).toEqual(["1", "2"]);
    expect(h.has("scene") || h.has("beat")).toBe(false);
    expect([h.get("customer"), h.get("baseline"), h.get("sensitivity"), h.get("priorities")]).toEqual(["CUST002", "B_HOME", "high", "cost"]);
  });
  it("keeps the priorities comma literal and omits an empty pick list", () => {
    expect(gameHref("/story", {}, { priorities: "water,cost" })).toBe("/story?priorities=water,cost");
    expect(exitHref("/story", {}, { ...state, priorities: [] })).not.toContain("priorities");
  });
  it("is the bare path with no params", () => expect(gameHref("/story/game", {}, {})).toBe("/story/game"));
});

describe("customer view scene 1", () => {
  it("is intro lines and one confirmation, with no reaction, answer or customer choice", () => {
    const beats = beatsFor(SCENES[0], "customer");
    expect(beats.map((b) => b.kind)).toEqual([...CUSTOMER_VIEW_INTRO.map(() => "line"), "ask"]);
  });
  it("is unchanged in the KAM view and in later scenes", () => {
    expect(beatsFor(SCENES[0], "kam").map((b) => b.kind).slice(-3)).toEqual(["ask", "react", "answer"]);
    expect(beatsFor(SCENES[1], "customer").map((b) => b.kind).slice(-3)).toEqual(["ask", "react", "answer"]);
  });
  it("lists every customer in the KAM view", async () => {
    const data = await generatedSource.load();
    expect(optionsFor(SCENES[0], data, labels).map((o) => o.value)).toEqual(data.customers.map((c) => c.customer_id));
  });
  it("has the end scene as recap then actions", () => expect(beatsFor("end", "kam").map((b) => b.kind)).toEqual(["line", "recap", "actions"]));
});

describe("consequences", () => {
  it("baseline scene changes only footprint Facts", async () => {
    const before = await factsFor({});
    const after = await factsFor({ baseline: "B_HOME" });
    const changed = changedFacts(before.facts, after.facts).map((c) => c.id);
    expect(changed.length).toBeGreaterThan(0);
    expect(changed).toEqual(expect.arrayContaining(["water_saved", "co2e_saved"]));
    expect(changed).not.toEqual(expect.arrayContaining(["active_wearers"]));
    for (const c of changedFacts(before.facts, after.facts)) expect(c.delta?.value).toBeCloseTo(c.after.value! - c.before.value!, 9);
  });
  it("beforeParams resets only the scene's own lever", () => {
    expect(beforeParams(SCENES[1], { customer: "CUST002", baseline: "B_HOME", view: "customer" })).toEqual({ customer: "CUST002", baseline: undefined, view: "customer" });
  });
  it("sensitivity scene changes savings values", async () => {
    const before = await factsFor({});
    const after = await factsFor({ sensitivity: "high" });
    expect(changedFacts(before.facts, after.facts).map((c) => c.id)).toContain("co2e_saved");
  });
  it("customer scene keeps a Fact at Needs input without a delta", async () => {
    const before = await factsFor({});
    const after = await factsFor({ customer: "CUST002" });
    const cards = changedFacts(before.facts, after.facts, SCENES[0].cards);
    const cost = cards.find((c) => c.id === "cost_of_unused_allocation")!;
    expect(cost.after.value).toBeNull();
    expect(cost.delta).toBeNull();
    expect(cards.find((c) => c.id === "active_wearers")!.delta).not.toBeNull();
  });
  it("priority moves no Fact", async () => {
    const before = await factsFor({});
    const after = await factsFor({ priorities: "cost" });
    expect(changedFacts(before.facts, after.facts)).toEqual([]);
    expect(leadingChapter("cost").id).toBe(buildStory(["cost"])[0].id);
  });
  it("throws on a card id with no Fact instead of printing a blank", async () => {
    const { facts } = await factsFor({});
    expect(() => changedFacts(facts, facts, ["nope"])).toThrow(/nope/);
  });
});

describe("impact world slot", () => {
  it("is empty until the Impact World change sets it", () => expect(IMPACT_WORLD_HREF).toBeNull());
});
