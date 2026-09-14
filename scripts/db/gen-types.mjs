// Regenerates src/types/supabase.ts from the linked hosted project.
//
// `supabase gen types --db-url` needs Docker, which this project does not assume, so
// this goes through the Management API instead. Run `npx supabase login` once, then:
//   node scripts/db/gen-types.mjs
import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { loadEnv, requireEnv } from "../lib/load-env.mjs";

loadEnv();
const { NEXT_PUBLIC_SUPABASE_URL } = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
const projectId = new URL(NEXT_PUBLIC_SUPABASE_URL).hostname.split(".")[0];

const result = spawnSync(
  "npx",
  [
    "supabase",
    "gen",
    "types",
    "typescript",
    "--project-id",
    projectId,
    "--schema",
    "public",
  ],
  {
    encoding: "utf8",
    shell: process.platform === "win32",
    maxBuffer: 20 * 1024 * 1024,
  },
);

if (result.status !== 0 || !result.stdout.includes("export type Database")) {
  console.error(result.stderr || result.stdout);
  process.exit(1);
}

writeFileSync("src/types/supabase.ts", result.stdout);
console.log("wrote src/types/supabase.ts");
