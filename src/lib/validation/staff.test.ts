import { describe, expect, it } from "vitest";
import { availabilitySchema } from "./staff";

const base = {
  day_of_week: [false, true, true, true, true, true, false],
  start_time: "08:00",
  end_time: "17:00",
  is_active: true,
};

describe("availabilitySchema", () => {
  it("accepts a normal week", () => {
    expect(availabilitySchema.safeParse(base).success).toBe(true);
  });

  // The modal let an end time before the start through, and the database check
  // constraint then refused it with a raw error.
  it("requires the end to be after the start", () => {
    const result = availabilitySchema.safeParse({ ...base, end_time: "08:00" });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues[0].path).toEqual(["end_time"]);
  });

  it("requires at least one working day while active", () => {
    expect(
      availabilitySchema.safeParse({
        ...base,
        day_of_week: Array(7).fill(false),
      }).success,
    ).toBe(false);
    expect(
      availabilitySchema.safeParse({
        ...base,
        is_active: false,
        day_of_week: Array(7).fill(false),
      }).success,
    ).toBe(true);
  });
});
