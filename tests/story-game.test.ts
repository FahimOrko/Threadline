import { describe, expect, it } from "vitest";
import { generatedSource } from "@/lib/data/generated";
import { storyFacts } from "@/lib/story/facts";
import { buildStory } from "@/lib/story";
import { PRIORITIES, SENSITIVITY_DESCRIPTION, SENSITIVITY_LABEL } from "@/lib/selection";
import { observations as observationsFor } from "@/lib/engine";
import {
  ALL_TEMPLATES,
  CUSTOMER_VIEW_INTRO,
  previousHref,
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
  pickLine,
  holds,
  scriptContext,
  slotTexts,
  startOverHref,
  startOverState,
  reportLinkState,
  REPORT_HINT,
  isFirstBeat,
  suggest,
  chapterObservationCounts,
  neutralLabel,
  SUGGESTION_WHY,
  type Slot,
  type ScriptCtx,
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
  it("frame the estimate as the team's declared range, not a measurement, with the plain labels", () => {
    const s = SCENES.find((x) => x.id === "sensitivity")!;
    const text = [...s.intro.map((l) => l.text), ...s.explain.flatMap(slotTexts), s.answer, ...s.meaning.flatMap(slotTexts)].join(" ");
    expect(text).toMatch(/declared/);
    expect(text).toMatch(/not a measurement/);
    for (const l of ["Cautious", "Standard", "Generous"]) expect(text).toContain(l);
  });
  it("never say baseline, sensitivity or Fact in a line, with tokens left out", () => {
    for (const t of [...ALL_TEMPLATES, ...leadLines]) expect(t.replace(/\{\{fact:[a-z0-9_]+\}\}|\{[a-zA-Z]+\}/g, ""), t).not.toMatch(/\b(baseline|sensitivity|fact)s?\b/i);
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
  it("clamps a meaning beat without a choice back to the question", () => {
    const beats = beatsFor(SCENES[2], "kam");
    expect(clampBeat(beats, beats.length - 1, false)).toBe(beats.findIndex((b) => b.kind === "ask"));
  });
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
  it("/story keeps unknown params, spells out the four levers and drops scene and beat", () => {
    const path = "/story";
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
  const q = (href: string) => new URLSearchParams(href.split("?")[1]);
  it("every picker choice, Previous and Next keep view=customer", () => {
    const p = { view: "customer", x: "1" };
    for (const c of ["CUST001", "CUST002", "CUST003"]) expect(q(stepHref(p, 1, 3, { customer: c })).get("view")).toBe("customer");
    expect(q(previousHref(p, "customer", 1, 3) as string).get("view")).toBe("customer");
    expect(q(stepHref(p, 1, 3)).get("view")).toBe("customer");
    expect(q(startOverHref(p)).get("view")).toBe("customer");
    expect(q(exitHref("/story", p, { customer: "CUST001", baseline: "B_LOCAL", sensitivity: "base", priorities: [] })).get("view")).toBe("customer");
  });
  it("is generic intro lines, no explain beats (they read the default customer), then the picker and the usual follow-up", () => {
    const beats = beatsFor(SCENES[0], "customer");
    expect(beats.map((b) => b.kind)).toEqual([...CUSTOMER_VIEW_INTRO.map(() => "line"), "ask", "react", "answer", ...SCENES[0].meaning.map(() => "meaning")]);
  });
  it("names no customer before one is chosen", () => {
    for (const l of CUSTOMER_VIEW_INTRO) expect(l.text).not.toMatch(/\{company\}|\{\{fact:/);
  });
  it("is unchanged in the KAM view and in later scenes", () => {
    for (const [i, view] of [[0, "kam"], [1, "customer"]] as const) {
      const kinds = beatsFor(SCENES[i], view).map((b) => b.kind);
      expect(kinds.slice(kinds.indexOf("ask"), kinds.indexOf("ask") + 3)).toEqual(["ask", "react", "answer"]);
      expect(kinds.slice(kinds.indexOf("answer") + 1)).toEqual(SCENES[i].meaning.map(() => "meaning"));
    }
    expect(beatsFor(SCENES[1], "kam")[2].kind).toBe("explain");
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

describe("the one sensitivity label map", () => {
  it("names the three levels in plain words, with a description each", () => {
    expect(SENSITIVITY_LABEL).toEqual({ low: "Cautious estimate", base: "Standard estimate", high: "Generous estimate" });
    for (const l of ["low", "base", "high"] as const) expect(SENSITIVITY_DESCRIPTION[l].length).toBeGreaterThan(10);
  });
  it("is what the game buttons show, with URL values untouched", async () => {
    const data = await generatedSource.load();
    const opts = optionsFor(SCENES[2], data, labels);
    expect(opts.map((o) => [o.value, o.label, o.hint])).toEqual((["low", "base", "high"] as const).map((l) => [l, SENSITIVITY_LABEL[l], SENSITIVITY_DESCRIPTION[l]]));
  });
  it("is what the story text shows", async () => {
    const { facts, st } = await factsFor({ sensitivity: "high" });
    const lead = leadingChapter("water").lines[0];
    expect(renderLine(lead, facts, { baseline: st.short, sensitivity: SENSITIVITY_LABEL[st.sensitivity], company: "" })).toContain("Generous estimate");
  });
});

describe("consequence card labels", () => {
  it("name no baseline in any row label, even for baseline-dependent Facts", async () => {
    const { facts } = await factsFor({ baseline: "B_HOME" });
    const dependent = facts.filter((f) => f.baseline);
    expect(dependent.length).toBeGreaterThan(0);
    for (const f of dependent) expect(neutralLabel(f), f.id).not.toMatch(/ vs |local laundry|home washing|in-house/i);
    expect(neutralLabel(facts.find((f) => f.id === "water_saved")!)).toBe("Water saved");
  });
  it("leave other Facts alone", async () => {
    const { facts } = await factsFor({});
    const f = facts.find((x) => !x.baseline)!;
    expect(neutralLabel(f)).toBe(f.label);
  });
  it("resolve the Before and After baselines from the lever values", async () => {
    const data = await generatedSource.load();
    const before = resolveState(data, beforeParams(SCENES[1], { baseline: "B_HOME" }));
    const after = resolveState(data, { baseline: "B_HOME" });
    expect([before.short, after.short]).toEqual(["local laundry", "home washing"]);
  });
});

describe("header report link", () => {
  it("is disabled on every beat until the ending, with a visible hint text", () => {
    for (const p of [{}, { scene: "1", beat: "3" }, { scene: "2", beat: "5" }, { scene: "4", beat: "6" }, { scene: "9" }]) expect(reportLinkState(p).disabled, JSON.stringify(p)).toBe(true);
    expect(REPORT_HINT).toBe("Finish the review to open your report");
  });
  it("is active on the ending and keeps every param except scene and beat", () => {
    const st = reportLinkState({ scene: "end", beat: "2", customer: "CUST002", baseline: "B_HOME", sensitivity: "high", priorities: "cost,hygiene", view: "customer", x: "1" });
    expect(st.disabled).toBe(false);
    const u = new URL(st.href, "http://x");
    expect(u.pathname).toBe("/story");
    expect(Object.fromEntries(u.searchParams)).toEqual({ customer: "CUST002", baseline: "B_HOME", sensitivity: "high", priorities: "cost,hygiene", view: "customer", x: "1" });
  });
});

describe("start over state", () => {
  it("is disabled, not hidden, on the very first beat with nothing chosen", () => {
    expect(isFirstBeat({}, "kam")).toBe(true);
    expect(startOverState({}, "kam").disabled).toBe(true);
    expect(startOverState({ view: "customer", x: "1" }, "kam").disabled).toBe(true);
  });
  it("is enabled on every later beat and on the ending", () => {
    expect(startOverState({ scene: "1", beat: "1" }, "kam").disabled).toBe(false);
    expect(startOverState({ scene: "2", beat: "0" }, "kam").disabled).toBe(false);
    expect(startOverState({ scene: "end", beat: "0" }, "kam").disabled).toBe(false);
  });
  it("is enabled on the first beat once a lever is set, and clears it", () => {
    const st = startOverState({ baseline: "B_HOME" }, "kam");
    expect(st.disabled).toBe(false);
    expect(st.href).toBe("/story/game");
  });
  it("counts the customer as a choice in the customer view too", () => {
    expect(startOverState({ view: "customer" }, "customer").disabled).toBe(true);
    expect(startOverState({ view: "customer", customer: "CUST002" }, "customer").disabled).toBe(false);
  });
});

describe("start over", () => {
  const q = (h: string) => new URLSearchParams(h.split("?")[1]);
  const params = { view: "customer", x: "1", customer: "CUST002", baseline: "B_HOME", sensitivity: "high", priorities: "cost", scene: "3", beat: "2" };
  it("clears scene, beat and the four levers and keeps view and unknown params", () => {
    const h = q(startOverHref(params));
    expect([...h.keys()].sort()).toEqual(["view", "x"]);
    expect(startOverHref(params).startsWith("/story/game?")).toBe(true);
  });
  it("clears the customer in the customer view too, so the picker returns", () => {
    const h = q(startOverHref(params));
    expect(h.has("customer")).toBe(false);
    expect(h.get("view")).toBe("customer");
    expect(["baseline", "sensitivity", "priorities", "scene", "beat"].some((k) => h.has(k))).toBe(false);
  });
});

const ctx = (over: Partial<ScriptCtx> = {}): ScriptCtx => ({ observations: [], facts: [], level: "base", largestSite: null, zeroDelivery: false, spreadUnset: false, ...over });
const slots = (): { id: string; slot: Slot }[] => SCENES.flatMap((s) => [...s.explain, ...s.meaning]).filter((x) => x.rules).map((slot, i) => ({ id: String(i), slot }));

describe("conditional dialogue", () => {
  it("picks the rule's line when its condition holds and the fallback when nothing does", () => {
    const cases: [Slot, Partial<ScriptCtx>][] = slots().flatMap(({ slot }) =>
      slot.rules!.map((r): [Slot, Partial<ScriptCtx>] => {
        const w = r.when;
        return [{ ...slot, rules: [r] }, "obs" in w ? { observations: [{ id: w.obs }] } : "level" in w ? { level: w.level } : "data" in w ? { largestSite: "X", zeroDelivery: true, spreadUnset: true } : { facts: [{ id: w.factNull, value: null } as never] }];
      }),
    );
    expect(cases.length).toBeGreaterThan(8);
    for (const [slot, over] of cases) {
      const hit = pickLine(slot, ctx(over));
      expect(hit.text).toBe(slot.rules![0].text);
      if (!("level" in slot.rules![0].when)) expect(pickLine(slot, ctx()).text).toBe(slot.fallback);
    }
  });
  it("evaluates each condition kind", () => {
    expect(holds({ obs: "a" }, ctx({ observations: [{ id: "a" }] }))).toBe(true);
    expect(holds({ obs: "a" }, ctx())).toBe(false);
    expect(holds({ factNull: "f" }, ctx({ facts: [{ id: "f", value: null } as never] }))).toBe(true);
    expect(holds({ factNull: "f" }, ctx({ facts: [{ id: "f", value: 1 } as never] }))).toBe(false);
    expect(holds({ data: "largestSite" }, ctx({ largestSite: "A" }))).toBe(true);
    expect(holds({ data: "zeroDelivery" }, ctx())).toBe(false);
    expect(holds({ level: "high" }, ctx({ level: "high" }))).toBe(true);
  });
  it("gives every sensitivity level exactly one meaning line", () => {
    const slot = SCENES[2].meaning[0];
    const texts = (["low", "base", "high"] as const).map((level) => pickLine(slot, ctx({ level })).text);
    expect(new Set(texts).size).toBe(3);
    expect(texts[0]).toContain("Cautious");
    expect(texts[2]).toContain("Generous");
  });
  it("gives every customer in the data pack a complete script with no empty beat", async () => {
    const data = await generatedSource.load();
    for (const c of data.customers) {
      const { facts, st } = await factsFor({ customer: c.customer_id });
      const obs = storyFacts(data, { customerId: c.customer_id, period }, st.baseline, st.sensitivity).observations;
      const { ctx: sc, words: sw } = scriptContext(data, c.customer_id, st.baseline, st.sensitivity, facts, obs, period);
      for (const view of ["kam", "customer"] as const)
        for (const scene of [...SCENES, "end" as const]) {
          for (const b of beatsFor(scene, view)) {
            const text = b.kind === "line" ? b.line.text : b.kind === "explain" || b.kind === "meaning" ? pickLine(b.slot, sc).text : "x";
            const out = renderLine(text, facts, { baseline: st.short, sensitivity: "S", company: c.customer_name, comparison: "C", chapter: "Ch", lead: "L", ...sw });
            expect(out.trim().length, `${c.customer_id} ${text}`).toBeGreaterThan(0);
            expect(out).not.toMatch(/\{/);
          }
        }
    }
  });
  it("raises the repair spike only for a customer that has one", async () => {
    const data = await generatedSource.load();
    const seen = new Set<boolean>();
    for (const c of data.customers) {
      const { facts, st } = await factsFor({ customer: c.customer_id });
      const obs = storyFacts(data, { customerId: c.customer_id, period }, st.baseline, st.sensitivity).observations;
      const { ctx: sc, words } = scriptContext(data, c.customer_id, st.baseline, st.sensitivity, facts, obs, period);
      const line = renderLine(pickLine(SCENES[0].explain[1], sc).text, facts, { baseline: "b", sensitivity: "s", company: "", ...words });
      const has = obs.some((o) => o.id === "obs_repair_spike");
      seen.add(has);
      expect(line.includes("rose well above"), c.customer_id).toBe(has);
    }
  });
  it("names the largest site by garments in circulation, as a word", async () => {
    const data = await generatedSource.load();
    const { facts, st } = await factsFor({});
    const { ctx: sc } = scriptContext(data, "CUST001", st.baseline, st.sensitivity, facts, [], period);
    expect(sc.largestSite).toEqual(expect.any(String));
    expect(sc.zeroDelivery).toBe(false);
    expect(sc.spreadUnset).toBe(false);
  });
  it("flags zero delivery for home washing", async () => {
    const data = await generatedSource.load();
    const { facts, st } = await factsFor({ baseline: "B_HOME" });
    expect(scriptContext(data, "CUST001", st.baseline, st.sensitivity, facts, [], period).ctx.zeroDelivery).toBe(true);
  });
});

describe("suggested choices", () => {
  const base = { customerIds: ["CUST003", "CUST001", "CUST002"], customerObservationCounts: { CUST001: 2, CUST002: 4, CUST003: 4 }, chapterCounts: {} as Record<string, number> };
  it("picks the customer with the most observations and breaks ties by the lowest id", () => {
    expect(suggest(SCENES[0], "kam", base)).toBe("CUST002");
  });
  it("changes when observation counts change", () => {
    expect(suggest(SCENES[0], "kam", { ...base, customerObservationCounts: { ...base.customerObservationCounts, CUST001: 9 } })).toBe("CUST001");
  });
  it("is deterministic regardless of the order of the customers", () => {
    expect(suggest(SCENES[0], "kam", { ...base, customerIds: [...base.customerIds].reverse() })).toBe(suggest(SCENES[0], "kam", base));
  });
  it("suggests the default comparison laundry and the Standard estimate", () => {
    expect(suggest(SCENES[1], "kam", base)).toBe("B_LOCAL");
    expect(suggest(SCENES[2], "kam", base)).toBe("base");
  });
  it("suggests the chapter with the most fired observations, and follows the counts", () => {
    expect(suggest(SCENES[3], "kam", { ...base, chapterCounts: { risk: 3, circularity: 1 } })).toBe("hygiene");
    expect(suggest(SCENES[3], "kam", { ...base, chapterCounts: { risk: 1, circularity: 2 } })).toBe("circularity");
  });
  it("breaks a tie by default chapter order, and falls back to the first pickable chapter when none fire", () => {
    // "Your year in numbers" serves no priority, so the first pickable chapter in default order is circularity.
    expect(suggest(SCENES[3], "kam", { ...base, chapterCounts: {} })).toBe("circularity");
    expect(suggest(SCENES[3], "kam", { ...base, chapterCounts: { risk: 1, circularity: 1 } })).toBe("circularity");
  });
  it("counts observations per chapter", () => {
    expect(chapterObservationCounts([{ id: "obs_repair_spike" }, { id: "obs_over_allocation" }, { id: "obs_replacements_postponed" }, { id: "nope" }])).toEqual({ risk: 2, circularity: 1 });
  });
  it("marks exactly one option per scene, for every customer, using real observation counts", async () => {
    const data = await generatedSource.load();
    const counts = Object.fromEntries(data.customers.map((c) => [c.customer_id, observationsFor(data, { customerId: c.customer_id, period }).observations.length]));
    for (const c of data.customers) {
      const { st } = await factsFor({ customer: c.customer_id });
      const obs = storyFacts(data, { customerId: c.customer_id, period }, st.baseline, st.sensitivity).observations;
      const sctx = { customerIds: data.customers.map((x) => x.customer_id), customerObservationCounts: counts, chapterCounts: chapterObservationCounts(obs) };
      for (const s of SCENES) {
        const pick = suggest(s, "kam", sctx);
        const options = optionsFor(s, data, labels);
        expect(options.filter((o) => o.value === pick).length, `${c.customer_id} ${s.id}`).toBe(1);
        expect(SUGGESTION_WHY[s.id].length).toBeGreaterThan(10);
      }
    }
  });
  it("gives no suggestion on the locked customer scene in the customer view, but does in later scenes", () => {
    expect(suggest(SCENES[0], "customer", base)).toBeNull();
    expect(suggest(SCENES[1], "customer", base)).toBe("B_LOCAL");
  });
  it("pre-selects nothing: options carry no selected flag", async () => {
    const data = await generatedSource.load();
    for (const s of SCENES) for (const o of optionsFor(s, data, labels)) expect(Object.keys(o)).not.toContain("suggested");
  });
});

describe("previous step", () => {
  const q = (h: string | null) => Object.fromEntries(new URLSearchParams((h ?? "").split("?")[1]));
  it("steps back one beat inside a scene and keeps every other param", () => {
    expect(q(previousHref({ view: "customer", x: "1", baseline: "B_HOME" }, "kam", 2, 5))).toEqual({ view: "customer", x: "1", baseline: "B_HOME", scene: "2", beat: "4" });
  });
  it("goes to the last beat of the scene before from a scene's first beat", () => {
    const last = beatsFor(SCENES[1], "kam").length - 1;
    expect(q(previousHref({}, "kam", 3, 0))).toEqual({ scene: "2", beat: String(last) });
  });
  it("goes from the ending into the last scene", () => {
    const last = beatsFor(SCENES[SCENES.length - 1], "kam").length - 1;
    expect(q(previousHref({}, "kam", "end", 0))).toEqual({ scene: String(SCENES.length), beat: String(last) });
  });
  it("is null on the first beat of scene 1", () => expect(previousHref({}, "kam", 1, 0)).toBeNull());
  it("uses the customer view's beat count when crossing scenes", () => {
    expect(q(previousHref({ view: "customer" }, "customer", 2, 0)).beat).toBe(String(beatsFor(SCENES[0], "customer").length - 1));
  });
});
