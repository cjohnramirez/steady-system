import { describe, expect, it } from "vitest";
import { hasNextPage, pageRange, searchPattern } from "./paginate";

describe("pageRange", () => {
  it("returns an inclusive range for a zero-based page", () => {
    expect(pageRange(0, 10)).toEqual({ from: 0, to: 9 });
    expect(pageRange(2, 10)).toEqual({ from: 20, to: 29 });
  });
});

describe("hasNextPage", () => {
  // Pagers used `list.length < pageSize`, which stays enabled when the total is an
  // exact multiple of the page size and then requests an offset past the end.
  it("is false on the last full page", () => {
    expect(hasNextPage(0, 10, 10)).toBe(false);
    expect(hasNextPage(1, 10, 20)).toBe(false);
  });

  it("is true when rows remain", () => {
    expect(hasNextPage(0, 10, 11)).toBe(true);
    expect(hasNextPage(1, 10, 21)).toBe(true);
  });

  it("is false for an empty list", () => {
    expect(hasNextPage(0, 10, 0)).toBe(false);
  });
});

describe("searchPattern", () => {
  // Search text goes into a PostgREST `or=(...)` filter, where commas and
  // parentheses are syntax. Unescaped, "Cruz, Maria" broke the whole query.
  it("strips characters that are syntax in PostgREST filters", () => {
    expect(searchPattern("Cruz, Maria (CS)")).toBe("%Cruz Maria CS%");
    expect(searchPattern("100%_done")).toBe("%100done%");
  });

  it("returns null for blank input", () => {
    expect(searchPattern("   ")).toBeNull();
  });
});
