// Reads .env.local into process.env for standalone scripts.
//
// Deliberately tiny rather than a dependency. Handles KEY=value, quoted values and
// escaped newlines, which is all .env.example uses. Existing variables win, so a
// value exported in the shell overrides the file.
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

export function loadEnv(file = ".env.local") {
  const full = path.resolve(process.cwd(), file);
  if (!existsSync(full)) {
    throw new Error(
      `${file} not found. Copy .env.example to .env.local and fill it in.`,
    );
  }

  for (const raw of readFileSync(full, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;

    const eq = line.indexOf("=");
    if (eq === -1) continue;

    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1).replace(/\\n/g, "\n");
    } else {
      value = value.replace(/\s+#.*$/, "");
    }

    if (process.env[key] === undefined) process.env[key] = value;
  }
}

export function requireEnv(...keys) {
  const missing = keys.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing in .env.local: ${missing.join(", ")}`);
  }
  return Object.fromEntries(keys.map((key) => [key, process.env[key]]));
}
