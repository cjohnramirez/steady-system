import { describe, expect, it } from "vitest";
import { safeNextPath } from "./redirect";

describe("safeNextPath", () => {
  it("keeps same-origin paths", () => {
    expect(safeNextPath("/student")).toBe("/student");
    expect(safeNextPath("/auth/reset-password?x=1")).toBe(
      "/auth/reset-password?x=1",
    );
  });

  // `startsWith("/")` accepted both of these, and browsers resolve them to another
  // host, which made /auth/confirm an open redirect.
  it("rejects protocol-relative and backslash paths", () => {
    expect(safeNextPath("//evil.example")).toBe("/");
    expect(safeNextPath("/\\evil.example")).toBe("/");
  });

  it("rejects absolute URLs and empty values", () => {
    expect(safeNextPath("https://evil.example")).toBe("/");
    expect(safeNextPath(null)).toBe("/");
    expect(safeNextPath("")).toBe("/");
  });

  it("uses the given fallback", () => {
    expect(safeNextPath(null, "/home")).toBe("/home");
  });
});
