import { describe, expect, it } from "vitest";
import { resolveCustomer } from "@/lib/customer";

const customers = [{ customer_id: "CUST002" }, { customer_id: "CUST001" }, { customer_id: "CUST003" }];

describe("resolveCustomer", () => {
  it("defaults to NorthStar when the param is missing", () => {
    expect(resolveCustomer(undefined, customers)).toEqual({ customer: customers[1], rejected: null });
  });
  it("accepts a known id", () => {
    expect(resolveCustomer("CUST003", customers)).toEqual({ customer: customers[2], rejected: null });
  });
  it("falls back and names an unknown id", () => {
    expect(resolveCustomer("NOPE", customers)).toEqual({ customer: customers[1], rejected: "NOPE" });
  });
  it("rejects an empty value", () => {
    expect(resolveCustomer("", customers).rejected).toBe("");
  });
  it("uses the first of a repeated param", () => {
    expect(resolveCustomer(["CUST002", "CUST003"], customers).customer).toBe(customers[0]);
  });
});
