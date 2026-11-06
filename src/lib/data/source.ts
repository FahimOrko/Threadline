// Data reaches the engine through this interface. A Tableau, Power BI or eLindström export only needs a new adapter.
import type { AppData } from "./schemas";

export interface DataSource {
  load(): Promise<AppData>;
}

/** Adapter over the JSON that `npm run data:build` writes. The caller supplies the parsed JSON. */
export function jsonDataSource(data: AppData): DataSource {
  return { load: async () => data };
}
