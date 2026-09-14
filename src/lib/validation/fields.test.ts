import { describe, expect, it } from "vitest";
import { passwordSchema, phoneSchema } from "./fields";

describe("passwordSchema", () => {
  it("accepts a strong password", () => {
    expect(passwordSchema.safeParse("Password123!").success).toBe(true);
  });

  // The reset flow only required eight characters while signup required mixed case,
  // a digit and a symbol, so a reset could set a password signup would refuse.
  it.each([
    "short1!A",
    "password123!",
    "PASSWORD123!",
    "Password!!!",
    "Password123",
  ])("applies the signup rules everywhere (%s)", (value) => {
    const ok = passwordSchema.safeParse(value).success;
    expect(ok).toBe(value === "short1!A");
  });
});

describe("phoneSchema", () => {
  // Stored as text now. Number() used to strip the leading zero.
  it("keeps local and international formats", () => {
    expect(phoneSchema.parse("09171234567")).toBe("09171234567");
    expect(phoneSchema.parse("+639171234567")).toBe("+639171234567");
  });

  it("strips spaces and dashes people type", () => {
    expect(phoneSchema.parse("0917 123-4567")).toBe("09171234567");
  });

  it("rejects letters and short numbers", () => {
    expect(phoneSchema.safeParse("0917abc").success).toBe(false);
    expect(phoneSchema.safeParse("12345").success).toBe(false);
  });
});
