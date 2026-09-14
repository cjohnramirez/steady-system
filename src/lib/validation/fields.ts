import { z } from "zod";

/** One password rule for signup, reset and admin password changes. */
export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(255, "Use 255 characters or fewer")
  .regex(/[a-z]/, "Include a lowercase letter")
  .regex(/[A-Z]/, "Include an uppercase letter")
  .regex(/\d/, "Include a number")
  .regex(/[^A-Za-z0-9]/, "Include a symbol");

export const PASSWORD_HINT =
  "At least 8 characters, with upper and lowercase letters, a number and a symbol.";

/**
 * A phone number as text. Matches the database check on contact_person.phone:
 * an optional leading +, then 7 to 15 digits. Spaces and dashes are removed first.
 */
export const phoneSchema = z
  .string()
  .transform((value) => value.replace(/[\s-]/g, ""))
  .pipe(z.string().regex(/^\+?\d{7,15}$/, "Enter a valid phone number"));

export const optionalPhoneSchema = z
  .string()
  .transform((value) => value.replace(/[\s-]/g, ""))
  .pipe(
    z.union([
      z.literal(""),
      z.string().regex(/^\+?\d{7,15}$/, "Enter a valid phone number"),
    ]),
  );
