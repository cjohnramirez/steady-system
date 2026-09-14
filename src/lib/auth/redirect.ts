/**
 * A `next` query value, reduced to a path on this origin.
 *
 * Anything that could resolve to another host (`//host`, `/\host`, `https://`) is
 * replaced by the fallback.
 */
export function safeNextPath(
  value: string | null | undefined,
  fallback = "/",
): string {
  if (!value || !value.startsWith("/")) return fallback;
  if (value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}
