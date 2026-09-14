import type { PostgrestError } from "@supabase/supabase-js";
import { DbError } from "./error";

/** Everything a paginated table needs back from a query. */
export type Page<T> = {
  data: T[];
  count: number;
};

/** Zero-based page plus a size, the shape TanStack Table already produces. */
export type PageParams = {
  page: number;
  pageSize: number;
  search?: string;
};

/**
 * Inclusive row range for a zero-based page, which is what PostgREST's `.range()`
 * expects.
 */
export function pageRange(page: number, pageSize: number) {
  const from = page * pageSize;
  return { from, to: from + pageSize - 1 };
}

/** Whether rows exist past the given zero-based page. */
export function hasNextPage(page: number, pageSize: number, total: number) {
  return (page + 1) * pageSize < total;
}

type CountedResult<T> = {
  data: T[] | null;
  error: PostgrestError | null;
  count: number | null;
};

/**
 * Awaits a counted PostgREST query and normalises it into a `Page`.
 *
 * This replaces nine hand-written copies of the same
 * `from`/`to`/`range`/`count: "exact"` block, each of which had grown its own
 * slightly different error handling. Build the query where its filters live, then
 * hand it here. Row types still infer from the query.
 */
export async function toPage<T>(
  query: PromiseLike<CountedResult<T>>,
  message = "Could not load the list",
): Promise<Page<T>> {
  const { data, error, count } = await query;

  if (error) throw new DbError(message, error);

  return { data: data ?? [], count: count ?? 0 };
}

/** An ilike pattern for free-text search, or null when there is nothing to search. */
export function searchPattern(search: string | undefined): string | null {
  const cleaned = (search ?? "")
    .replace(/[%_,()\*"]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned ? `%${cleaned}%` : null;
}

export type SortParam = { id: string; desc: boolean } | undefined;
