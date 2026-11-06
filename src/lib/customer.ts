// Which customer a page shows. Pure and isomorphic: the server page and the header picker call the same function.
export const DEFAULT_CUSTOMER_ID = "CUST001"; // NorthStar Foods Group

type Param = string | string[] | undefined;

/** Resolves `?customer=`. Unknown, empty or repeated values fall back to the default; `rejected` names the bad value. */
export function resolveCustomer<C extends { customer_id: string }>(
  param: Param,
  customers: C[],
): { customer: C; rejected: string | null } {
  const fallback = customers.find((c) => c.customer_id === DEFAULT_CUSTOMER_ID) ?? customers[0];
  const value = Array.isArray(param) ? param[0] : param;
  if (value === undefined) return { customer: fallback, rejected: null };
  const match = customers.find((c) => c.customer_id === value);
  return match ? { customer: match, rejected: null } : { customer: fallback, rejected: value };
}
