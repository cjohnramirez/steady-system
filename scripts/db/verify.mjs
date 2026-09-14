// Runs scripts/db/verify.sql against the hosted project through the Supabase
// Management API and reports each security check. Nothing is changed: every check
// is rolled back. Requires `npx supabase login` once.
//   node scripts/db/verify.mjs
import { spawnSync } from "node:child_process";
import { loadEnv, requireEnv } from "../lib/load-env.mjs";

loadEnv();
const { NEXT_PUBLIC_SUPABASE_URL } = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
const projectRef = new URL(NEXT_PUBLIC_SUPABASE_URL).hostname.split(".")[0];

const result = spawnSync(
  "npx",
  [
    "supabase",
    "db",
    "query",
    "--linked",
    "--project-ref",
    projectRef,
    "-f",
    "scripts/db/verify.sql",
    "--output-format",
    "json",
  ],
  {
    encoding: "utf8",
    shell: process.platform === "win32",
    maxBuffer: 10 * 1024 * 1024,
  },
);

const start = result.stdout.indexOf("{");
if (result.status !== 0 || start === -1) {
  console.error(result.stderr || result.stdout);
  process.exit(1);
}

// The CLI prints a status line first, then an object whose rows are the last
// statement's result.
const rows = JSON.parse(result.stdout.slice(start)).rows ?? [];

let failed = 0;
for (const row of rows) {
  const passed =
    row.passed === true || row.passed === "t" || row.passed === "true";
  if (!passed) failed += 1;
  console.log(`${passed ? "  ok  " : "  FAIL"}  ${row.name}  (${row.detail})`);
}

console.log(
  failed
    ? `\n${failed} of ${rows.length} checks failed`
    : `\nAll ${rows.length} checks passed`,
);
process.exit(failed ? 1 : 0);
