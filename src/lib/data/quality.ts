// The data-quality report is a computation dependency of the Story's Data readiness chapter, so a missing or malformed file fails the build (conventions: Numbers and provenance).
import { z } from "zod";
import type { QualityReport } from "./pipeline";

const fileReport = z.object({
  read: z.number().int().min(0),
  valid: z.number().int().min(0),
  invalid: z.array(z.object({ row: z.number(), reason: z.string() })),
  crossChecks: z.array(
    z.object({
      id: z.string(),
      checked: z.number().int().min(0),
      passed: z.boolean(),
      disagreements: z.array(z.record(z.string(), z.union([z.string(), z.number()]))),
      info: z.literal(true).optional(),
    }),
  ),
});
const reportSchema = z.object({ files: z.record(z.string(), fileReport) });

/** Validates the parsed `data/generated/data-quality.json`; throws a message naming the file. */
export function parseQualityReport(raw: unknown): QualityReport {
  const res = reportSchema.safeParse(raw);
  if (!res.success || Object.keys(res.data.files).length === 0) {
    const why = res.success ? "it lists no files" : res.error.issues[0]?.message ?? "invalid shape";
    throw new Error(`data/generated/data-quality.json is missing or unreadable (${why}). Run npm run data:build.`);
  }
  return res.data;
}
