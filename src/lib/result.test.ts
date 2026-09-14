import { describe, expect, it } from "vitest";
import { z } from "zod";
import { fail, ok, toErrorMessage, unwrapResult } from "./result";
import { AuthorizationError } from "./auth/errors";

describe("Result", () => {
  it("unwraps a success", () => {
    expect(unwrapResult(ok(3))).toBe(3);
  });

  // Server actions return failures instead of throwing, because Next.js replaces a
  // thrown error's message with a generic one in production builds. unwrapResult
  // turns it back into a throw on the client, where TanStack Query expects one.
  it("throws the failure's message on the client", () => {
    expect(() => unwrapResult(fail("Slot taken"))).toThrow("Slot taken");
  });
});

describe("toErrorMessage", () => {
  it("uses the message Postgres raised for permission and check errors", () => {
    expect(
      toErrorMessage({ code: "42501", message: "Students can only cancel" }),
    ).toBe("Students can only cancel");
    expect(
      toErrorMessage({
        code: "23514",
        message: "That time slot is not available",
      }),
    ).toBe("That time slot is not available");
  });

  it("explains a unique violation instead of leaking the constraint name", () => {
    expect(
      toErrorMessage({
        code: "23505",
        message:
          'duplicate key value violates unique constraint "student_username_key"',
      }),
    ).toBe("That username is already taken.");
    expect(
      toErrorMessage({
        code: "23505",
        message: "duplicate key ... appointment_no_double_booking",
      }),
    ).toBe("That time slot has just been taken. Please pick another.");
  });

  it("reports the first zod issue", () => {
    const parsed = z
      .object({ email: z.email("Enter a valid email") })
      .safeParse({ email: "x" });
    expect(parsed.success).toBe(false);
    if (!parsed.success)
      expect(toErrorMessage(parsed.error)).toBe("Enter a valid email");
  });

  it("passes authorization messages through", () => {
    expect(toErrorMessage(new AuthorizationError("Sign in first", 401))).toBe(
      "Sign in first",
    );
  });

  it("falls back for unknown values", () => {
    expect(toErrorMessage(undefined, "Could not save")).toBe("Could not save");
  });
});
