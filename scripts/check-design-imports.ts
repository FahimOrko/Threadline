// Fails when code outside src/app/design/ imports the /design sample data (ADR 0010).
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, sep } from "node:path";

const allowed = join("src", "app", "design") + sep;
const offenders: string[] = [];

function walk(dir: string) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (/\.(ts|tsx|js|jsx|mjs)$/.test(name) && !path.startsWith(allowed)) {
      if (/_sample/.test(readFileSync(path, "utf8"))) offenders.push(path);
    }
  }
}

walk("src");
// tests must not use it either
walk("tests");

if (offenders.length) {
  console.error("Sample data imported outside src/app/design/:\n" + offenders.join("\n"));
  process.exit(1);
}
console.log("ok: sample data is only used inside src/app/design/");
