import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildData } from "@/lib/data/pipeline";
import { jsonDataSource } from "@/lib/data/source";

describe("jsonDataSource", () => {
  it("returns plain serialisable objects", async () => {
    const stems = ["data_dictionary", "repairs", "sites", "customers", "assumptions", "service_activity", "products"];
    const files = Object.fromEntries(stems.map((s) => [s, readFileSync(`data/raw/${s}.csv`, "utf8")]));
    const { data } = buildData(files);
    const loaded = await jsonDataSource(data).load();
    expect(JSON.parse(JSON.stringify(loaded))).toEqual(loaded);
    expect(loaded.customers).toHaveLength(3);
    expect(loaded.products).toHaveLength(6);
  });
});
