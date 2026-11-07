import { readFileSync } from "node:fs";
import Papa from "papaparse";
import { describe, expect, it } from "vitest";
import { buildData } from "@/lib/data/pipeline";
import { activeWearers, garmentsInCirculation, garmentUtilization, operationalFacts, replacementsPostponed, repairs, requireValue, serviceRequests, siteComparison, siteFacts } from "@/lib/engine";

const stems = ["data_dictionary", "repairs", "sites", "customers", "assumptions", "service_activity", "products", "service_cycles", "waste_circularity", "customer_impacts", "laundry_resources", "baselines", "laundries"];
const { data } = buildData(Object.fromEntries(stems.map((s) => [s, readFileSync(`data/raw/${s}.csv`, "utf8")])));
const period = { from: "2025-01", to: "2025-12" };
const csv = (n: string) => Papa.parse<Record<string, string>>(readFileSync(`data/raw/${n}.csv`, "utf8"), { header: true, skipEmptyLines: true }).data;
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const sa = csv("service_activity");
const rep = csv("repairs");
const cyc = csv("service_cycles");

const northSites = data.sites.filter((s) => s.customer_id === "CUST001").map((s) => s.site_id);
const [s1, s2] = northSites;
const at = (siteId: string) => ({ customerId: "CUST001", period, siteId });

// Independent recomputation straight from the CSV text.
const dec = (id: string) => sa.filter((r) => r.site_id === id && r.month === "2025-12");
const expected = (id: string) => ({
  wearers: Math.max(0, ...dec(id).map((r) => Number(r.active_wearers))),
  garments: sum(dec(id).map((r) => Number(r.allocated_pieces))),
  scanned: sum(dec(id).map((r) => Number(r.active_assets_scanned))),
  repairs: sum(rep.filter((r) => r.site_id === id).map((r) => Number(r.repair_count))),
  requests: sum(sa.filter((r) => r.site_id === id).map((r) => Number(r.service_requests))),
});

describe("site scope", () => {
  for (const id of [s1, s2]) {
    it(`${id}: values match an independent recomputation`, () => {
      const e = expected(id);
      const sc = at(id);
      expect(requireValue(activeWearers(data, sc))).toBe(e.wearers);
      expect(requireValue(garmentsInCirculation(data, sc))).toBe(e.garments);
      expect(requireValue(repairs(data, sc))).toBe(e.repairs);
      expect(requireValue(replacementsPostponed(data, sc))).toBe(e.repairs);
      expect(requireValue(serviceRequests(data, sc))).toBe(e.requests);
      expect(requireValue(garmentUtilization(data, sc))).toBeCloseTo((e.scanned / e.garments) * 100, 9);
    });
  }

  it("additive Facts over all NorthStar sites equal the customer Facts", () => {
    const total = (f: (sc: ReturnType<typeof at>) => number) => sum(northSites.map((id) => f(at(id))));
    const cust = { customerId: "CUST001", period };
    expect(total((sc) => requireValue(activeWearers(data, sc)))).toBe(requireValue(activeWearers(data, cust)));
    expect(total((sc) => requireValue(garmentsInCirculation(data, sc)))).toBe(requireValue(garmentsInCirculation(data, cust)));
    expect(total((sc) => requireValue(repairs(data, sc)))).toBe(requireValue(repairs(data, cust)));
    expect(total((sc) => requireValue(serviceRequests(data, sc)))).toBe(requireValue(serviceRequests(data, cust)));
  });

  it("a site combined with another customer counts nothing", () => {
    const wrong = { customerId: "CUST002", period, siteId: s1 };
    expect(requireValue(activeWearers(data, wrong))).toBe(0);
    expect(requireValue(repairs(data, wrong))).toBe(0);
    expect(requireValue(serviceRequests(data, wrong))).toBe(0);
    expect(siteComparison(data, wrong).every((p) => p.site.value === 0)).toBe(true);
  });

  it("without a siteId the customer Facts keep their values", () => {
    const f = operationalFacts(data, { customerId: "CUST001", period });
    expect(f.find((x) => x.id === "garments_in_circulation")?.value).toBe(31743);
    expect(f.find((x) => x.id === "service_requests")?.value).toBe(515);
    expect(f.every((x) => x.scope.siteId === undefined)).toBe(true);
  });

  it("carries the site in scope and keeps provenance", () => {
    const f = activeWearers(data, at(s1));
    expect(f.scope).toEqual({ customerId: "CUST001", customerName: "NorthStar Foods Group", siteId: s1, siteName: data.sites.find((s) => s.site_id === s1)!.site_name });
    expect(f.methods).toEqual(["CALCULATED"]);
    expect(f.source).toBe("SYNTHETIC");
  });

  it("siteFacts omits delivery sites, recycling share and footprint", () => {
    const all = Object.values(siteFacts(data, at(s1))).flat().map((f) => f.id);
    expect(all).not.toContain("delivery_sites");
    expect(all).not.toContain("recycling_reuse_share");
    expect(all.some((id) => /footprint|saved|delivery/.test(id))).toBe(false);
    expect(all).toContain("repairs");
    expect(all).toContain("garment_utilization");
  });

  it("on-time rate uses only the site's cycles", () => {
    const c = cyc.filter((r) => r.site_id === s1);
    const f = siteFacts(data, at(s1)).percentages.find((x) => x.id === "on_time_cycle_rate");
    expect(f?.value).toBeCloseTo((c.filter((r) => r.performance_flag === "ON_TIME").length / c.length) * 100, 9);
  });
});

describe("site comparison", () => {
  it("pairs the site with its customer and names each in the label", () => {
    const pairs = siteComparison(data, at(s1));
    expect(pairs.map((p) => p.id)).toEqual(["garment_utilization", "repairs_per_100_garments"]);
    const e = expected(s1);
    const cu = { scanned: sum(sa.filter((r) => r.customer_id === "CUST001" && r.month === "2025-12").map((r) => Number(r.active_assets_scanned))), garments: 31743 };
    const [util, rate] = pairs;
    expect(util.site.value).toBeCloseTo((e.scanned / e.garments) * 100, 9);
    expect(util.customer.value).toBeCloseTo((cu.scanned / cu.garments) * 100, 9);
    expect(rate.site.value).toBeCloseTo((e.repairs / e.garments) * 100, 9);
    expect(rate.customer.value).toBeCloseTo((requireValue(repairs(data, { customerId: "CUST001", period })) / cu.garments) * 100, 9);
    expect(util.site.label).toMatch(/this site$/);
    expect(util.customer.label).toMatch(/all NorthStar Foods Group sites$/);
    expect(util.site.scope.siteId).toBe(s1);
    expect(util.customer.scope.siteId).toBeUndefined();
  });

  it("a site without December rows: utilization 0, repair rate pair omitted", () => {
    const empty = { ...data, serviceActivity: data.serviceActivity.filter((r) => !(r.site_id === s1 && r.month === "2025-12")) };
    expect(requireValue(garmentUtilization(empty, at(s1)))).toBe(0);
    expect(siteComparison(empty, at(s1)).map((p) => p.id)).toEqual(["garment_utilization"]);
  });
});
