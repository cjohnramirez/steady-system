import { describe, expect, it } from "vitest";
import {
  ampmTo24,
  dateToString,
  extractPublicId,
  generateRange,
  generateTimeSlots,
  strToTitleCase,
  toAMPM,
} from "./format";

describe("generateRange", () => {
  it("counts from the step up to the maximum", () => {
    expect(generateRange(10, 2)).toEqual([2, 4, 6, 8, 10]);
  });

  it("includes the maximum only when the step lands on it", () => {
    expect(generateRange(9, 2)).toEqual([2, 4, 6, 8]);
  });

  it("treats a zero or negative step as one rather than looping forever", () => {
    expect(generateRange(3, 0)).toEqual([1, 2, 3]);
    expect(generateRange(3, -5)).toEqual([1, 2, 3]);
  });

  it("returns nothing when the step is past the maximum", () => {
    expect(generateRange(2, 10)).toEqual([]);
  });
});

describe("ampmTo24 and toAMPM", () => {
  it("handles midnight, which is the case a modulo gets wrong", () => {
    expect(ampmTo24("12:00 AM")).toBe("00:00:00");
    expect(toAMPM("00:00")).toBe("12:00 AM");
  });

  it("handles noon", () => {
    expect(ampmTo24("12:30 PM")).toBe("12:30:00");
    expect(toAMPM("12:30")).toBe("12:30 PM");
  });

  it("converts afternoon times", () => {
    expect(ampmTo24("1:05 PM")).toBe("13:05:00");
    expect(toAMPM("13:05")).toBe("1:05 PM");
  });

  it("round-trips every half hour of the day", () => {
    for (let h = 0; h < 24; h += 1) {
      for (const m of [0, 30]) {
        const twentyFour = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
        expect(ampmTo24(toAMPM(twentyFour))).toBe(`${twentyFour}:00`);
      }
    }
  });
});

describe("generateTimeSlots", () => {
  it("produces a half-hour slot for each opening, excluding the closing time", () => {
    const slots = generateTimeSlots("08:00:00", "17:00:00");

    expect(slots).toHaveLength(18);
    expect(slots.at(0)).toBe("8:00 AM");
    expect(slots.at(-1)).toBe("4:30 PM");
  });

  it("ignores a timezone suffix on either sign", () => {
    expect(generateTimeSlots("08:00:00+08", "10:00:00+08")).toEqual(
      generateTimeSlots("08:00:00", "10:00:00"),
    );
    expect(generateTimeSlots("08:00:00-05", "10:00:00-05")).toEqual(
      generateTimeSlots("08:00:00", "10:00:00"),
    );
  });

  it("returns nothing when the window is empty or inverted", () => {
    expect(generateTimeSlots("09:00:00", "09:00:00")).toEqual([]);
    expect(generateTimeSlots("17:00:00", "08:00:00")).toEqual([]);
  });

  it("handles a window shorter than one slot", () => {
    expect(generateTimeSlots("09:00:00", "09:20:00")).toEqual(["9:00 AM"]);
  });
});

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
    // Worth knowing: Cloudinary only includes the version when configured to. A
    // URL without one yields no id, and the caller then skips the delete rather
    // than failing, so an unversioned URL leaks its file.
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

describe("dateToString", () => {
  it("falls back when there is no date", () => {
    expect(dateToString()).toBe("No schedule");
    expect(dateToString("")).toBe("No schedule");
  });

  it("renders a readable date", () => {
    const rendered = dateToString("2026-03-15T01:00:00.000Z");

    expect(rendered).toContain("2026");
    expect(rendered).toContain("March");
  });
});
