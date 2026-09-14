// Applies pending migrations (and, with --include-seed, the seeds) to the database
// in SUPABASE_DB_URL using the Supabase CLI, without Docker.
//
// The URL is rebuilt with the password percent-encoded, so a password copied
// straight from the dashboard works, and it is passed to the CLI without being
// printed. Usage: node scripts/db/push.mjs [--include-seed]
import { spawnSync } from "node:child_process";
import { loadEnv, requireEnv } from "../lib/load-env.mjs";
import { parseDbUrl } from "../lib/db.mjs";

loadEnv();
const { SUPABASE_DB_URL } = requireEnv("SUPABASE_DB_URL");
const { user, password, host, port, database } = parseDbUrl(SUPABASE_DB_URL);
const url = `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;

const args = [
  "supabase",
  "db",
  "push",
  "--db-url",
  url,
  "--yes",
  ...process.argv.slice(2),
];
const result = spawnSync("npx", args, {
  stdio: "inherit",
  shell: process.platform === "win32",
});
process.exit(result.status ?? 1);
