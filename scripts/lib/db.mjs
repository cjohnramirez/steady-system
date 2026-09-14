// A pg client for maintenance scripts, connected with SUPABASE_DB_URL.
import pg from "pg";
import { loadEnv, requireEnv } from "./load-env.mjs";

/**
 * Splits a connection string by hand rather than with `new URL`, so a password
 * pasted from the dashboard with unencoded @, # or / still works. The host is
 * whatever follows the last @.
 */
export function parseDbUrl(url) {
  const match = url.match(
    /^postgres(?:ql)?:\/\/([^:]+):(.*)@([^@/:]+)(?::(\d+))?\/([^?]+)/,
  );
  if (!match)
    throw new Error("SUPABASE_DB_URL is not a postgres:// connection string.");
  const [, user, password, host, port = "5432", database] = match;
  let decoded = password;
  try {
    decoded = decodeURIComponent(password);
  } catch {
    // Not percent-encoded; use as typed.
  }
  return {
    user: decodeURIComponent(user),
    password: decoded,
    host,
    port: Number(port),
    database,
  };
}

export async function connect() {
  loadEnv();
  const { SUPABASE_DB_URL } = requireEnv("SUPABASE_DB_URL");
  const client = new pg.Client({
    ...parseDbUrl(SUPABASE_DB_URL),
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  return client;
}
