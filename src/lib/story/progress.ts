// Game progress in sessionStorage (ADR 0033). The address stays the source of truth: storage is a copy used to restore a bare
// game address and to carry the "ended" flag. Every access is in try/catch; any failure means a fresh game, never an error.
// Pure over an injectable store so it is testable without a browser.

type Store = Pick<Storage, "getItem" | "setItem" | "removeItem" | "key" | "length">;
type View = "kam" | "customer";

const PREFIX = "lvr.game.";
/** The game's own query keys. Anything else in the address (`view`, unknown params) is not stored. */
export const GAME_KEYS = ["scene", "beat", "customer", "baseline", "sensitivity", "priorities"] as const;
export const ENDED_PARAM = "ended";

type Stored = { q: string; ended: boolean };

const recordKey = (view: View, customer: string | null) => `${PREFIX}${view}.${customer ?? "none"}`;
const lastKey = (view: View) => `${PREFIX}${view}.last`;
const CHANGED = "lvr:progress";
/** Tells same-tab subscribers (the gate, the sidebar) that storage changed; the native `storage` event only fires in other tabs. */
const notify = () => {
  try {
    if (typeof window !== "undefined") window.dispatchEvent(new Event(CHANGED));
  } catch {
    // ignored
  }
};
export function subscribeProgress(cb: () => void): () => void {
  window.addEventListener(CHANGED, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(CHANGED, cb);
    window.removeEventListener("storage", cb);
  };
}
const browserStore = (): Store | null => {
  try {
    return typeof window === "undefined" ? null : window.sessionStorage;
  } catch {
    return null;
  }
};

/** A stored query is kept only if it holds game keys alone and a scene and beat of the expected shape. */
function validQuery(q: unknown): q is string {
  if (typeof q !== "string") return false;
  const p = new URLSearchParams(q);
  for (const [k, v] of p) {
    if (!(GAME_KEYS as readonly string[]).includes(k)) return false;
    if (k === "scene" && !/^([1-4]|end)$/.test(v)) return false;
    if (k === "beat" && !/^\d{1,2}$/.test(v)) return false;
  }
  return true;
}

function read(key: string, store: Store): Stored | null {
  try {
    const raw = store.getItem(key);
    if (raw === null) return null;
    const v: unknown = JSON.parse(raw);
    if (v && typeof v === "object" && validQuery((v as Stored).q) && typeof (v as Stored).ended === "boolean") return v as Stored;
  } catch {
    // unavailable or unparsable: behave as fresh
  }
  try {
    store.removeItem(key); // corrupt or foreign: drop it
  } catch {
    // ignored
  }
  return null;
}

/** The last customer written for the view, or "none". */
function lastCustomer(view: View, store: Store): string | null {
  try {
    const c = store.getItem(lastKey(view));
    return c && c !== "none" ? c : null;
  } catch {
    return null;
  }
}

/** The stored record for a customer, or for the last one written when `customer` is null (a bare address). */
export function readProgress(view: View, customer: string | null, store: Store | null = browserStore()): { query: string; ended: boolean } | null {
  if (!store) return null;
  const r = read(recordKey(view, customer ?? lastCustomer(view, store)), store);
  return r ? { query: r.q, ended: r.ended } : null;
}

/** Saves the game keys of `params` for the view and customer. `ended` is kept once set. */
export function writeProgress(view: View, params: URLSearchParams, ended = false, store: Store | null = browserStore()): void {
  if (!store) return;
  try {
    const q = new URLSearchParams();
    for (const k of GAME_KEYS) {
      const v = params.get(k);
      if (v !== null) q.set(k, v);
    }
    const customer = params.get("customer");
    const key = recordKey(view, customer);
    const kept = read(key, store)?.ended ?? false;
    store.setItem(key, JSON.stringify({ q: q.toString().replaceAll("%2C", ","), ended: ended || kept }));
    store.setItem(lastKey(view), customer ?? "none");
    notify();
  } catch {
    // quota or blocked: the address still carries the state
  }
}

/** Records that the review ended for the customer (also on the `ended=1` address). */
export function markEnded(view: View, customer: string | null, store: Store | null = browserStore()): void {
  if (!store) return;
  try {
    const key = recordKey(view, customer);
    store.setItem(key, JSON.stringify({ q: read(key, store)?.q ?? "", ended: true }));
    if (customer) store.setItem(lastKey(view), customer);
    notify();
  } catch {
    // ignored: the ending link carries ended=1
  }
}

/** True once the review ended for this customer, or for the last one written when `customer` is null. */
export function isEnded(view: View, customer: string | null, store: Store | null = browserStore()): boolean {
  return store ? (readProgress(view, customer, store)?.ended ?? false) : false;
}

/** Start over: removes every stored record and pointer of the view. */
export function clearProgress(view: View, store: Store | null = browserStore()): void {
  if (!store) return;
  try {
    const mine = `${PREFIX}${view}.`;
    const keys: string[] = [];
    for (let i = 0; i < store.length; i++) {
      const k = store.key(i);
      if (k?.startsWith(mine)) keys.push(k);
    }
    for (const k of keys) store.removeItem(k);
    notify();
  } catch {
    // ignored
  }
}
