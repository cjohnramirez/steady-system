import type { PostgrestError } from "@supabase/supabase-js";

/**
 * A database failure, with the original Postgres error kept on `cause`.
 *
 * The pattern this replaces was `throw new Error("Could not load:", error)`.
 * Error's second argument is an options bag, not another message part, so every
 * one of those calls quietly threw away the detail, the hint and the SQLSTATE
 * code and left the user looking at a message that ended in a colon.
 */
export class DbError extends Error {
  readonly code?: string;
  readonly details?: string | null;
  readonly hint?: string | null;

  constructor(message: string, cause: PostgrestError) {
    super(`${message}: ${cause.message}`, { cause });
    this.name = "DbError";
    this.code = cause.code;
    this.details = cause.details;
    this.hint = cause.hint;
  }
}

/** Throws a DbError when the query failed, otherwise returns the rows. */
export function unwrap<T>(
  result: { data: T | null; error: PostgrestError | null },
  message: string,
): T {
  if (result.error) throw new DbError(message, result.error);
  if (result.data === null) throw new Error(`${message}: no data returned`);
  return result.data;
}
