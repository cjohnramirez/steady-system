import { ZodError } from "zod";

/**
 * What a server action returns.
 *
 * Actions return failures rather than throwing. In a production build Next.js
 * replaces the message of any error thrown from a server action with a generic
 * "An error occurred in the Server Components render", so every "wrong password" or
 * "slot already taken" reached the user as that sentence.
 */
export type Result<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export function ok<T>(data: T): Result<T>;
export function ok(): Result<void>;
export function ok<T>(data?: T): Result<T | undefined> {
  return { ok: true, data };
}

export function fail(error: string): { ok: false; error: string } {
  return { ok: false, error };
}

/** Client side: turns a failed Result back into a throw for TanStack Query. */
export function unwrapResult<T>(result: Result<T>): T {
  if (!result.ok) throw new Error(result.error);
  return result.data;
}

type PgLike = { code?: string; message?: string };

const UNIQUE_MESSAGES: [RegExp, string][] = [
  [/username/, "That username is already taken."],
  [
    /appointment_no_double_booking/,
    "That time slot has just been taken. Please pick another.",
  ],
  [/email/, "An account with that email already exists."],
];

/** A sentence a person can act on, from whatever was thrown or returned. */
export function toErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? fallback;
  }

  if (error && typeof error === "object" && "code" in error) {
    const { code, message = "" } = error as PgLike;

    // Raised deliberately by our own triggers and functions, so the text is meant
    // for people.
    if (
      code === "42501" ||
      code === "23514" ||
      code === "P0001" ||
      code === "22023"
    ) {
      return message || fallback;
    }

    if (code === "23505") {
      const match = UNIQUE_MESSAGES.find(([pattern]) => pattern.test(message));
      return match?.[1] ?? "That record already exists.";
    }

    if (code === "23503")
      return "That item is still in use and cannot be removed.";
  }

  if (error instanceof Error && error.message) return error.message;

  return fallback;
}
