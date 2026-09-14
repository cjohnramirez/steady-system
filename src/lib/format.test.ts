import { describe, expect, it } from "vitest";
import {
  extractPublicId,
  formatClockTime,
  formatEventRange,
  fromOfficeInputValue,
  strToTitleCase,
  toOfficeInputValue,
} from "./format";

describe("extractPublicId", () => {
  it("pulls the id out of a versioned Cloudinary URL", () => {
    expect(
      extractPublicId(
        "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto/v1700000000/articles/abc123",
      ),
    ).toBe("articles/abc123");
  });

  it("stops at the query string", () => {
    expect(
      extractPublicId(
        "https://res.cloudinary.com/demo/image/upload/v1700000000/playlists/xyz?_a=BAA",
      ),
    ).toBe("playlists/xyz");
  });

  it("returns null when the URL carries no version segment", () => {
    // Cloudinary only includes the version when configured to. A URL without one
    // yields no id, and the caller then skips the delete rather than failing.
    expect(
      extractPublicId(
        "https://res.cloudinary.com/demo/image/upload/f_auto/articles/abc123",
      ),
    ).toBeNull();
  });

  it("returns null for something that is not a Cloudinary URL", () => {
    expect(extractPublicId("/placeholder.png")).toBeNull();
  });
});

describe("strToTitleCase", () => {
  it("capitalises each word and lowercases the rest", () => {
    expect(strToTitleCase("juan DELA cruz")).toBe("Juan Dela Cruz");
  });

  it("leaves an empty string alone", () => {
    expect(strToTitleCase("")).toBe("");
  });
});

describe("formatClockTime", () => {
  it("formats database times", () => {
    expect(formatClockTime("08:00:00")).toBe("8:00 AM");
    expect(formatClockTime("17:30:00+08")).toBe("5:30 PM");
    expect(formatClockTime("00:15")).toBe("12:15 AM");
  });
});

describe("formatEventRange", () => {
  it("collapses a same-day range", () => {
    expect(
      formatEventRange("2026-09-14T01:00:00Z", "2026-09-14T04:00:00Z"),
    ).toBe("September 14, 2026, 9:00 AM – 12:00 PM");
  });
});

describe("office datetime inputs", () => {
  it("round-trips through Manila time", () => {
    expect(toOfficeInputValue("2026-09-13T16:00:00.000Z")).toBe(
      "2026-09-14T00:00",
    );
    expect(fromOfficeInputValue("2026-09-14T00:00")).toBe(
      "2026-09-13T16:00:00.000Z",
    );
    expect(fromOfficeInputValue("")).toBe("");
  });
});
