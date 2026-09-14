import { z } from "zod";
import { optionalPhoneSchema, passwordSchema } from "./fields";

const name = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(80, `${label} is too long`);

const username = z
  .string()
  .trim()
  .min(3, "Use at least 3 characters")
  .max(30, "Use 30 characters or fewer")
  .regex(/^[a-zA-Z0-9._]+$/, "Use letters, numbers, dots and underscores only");

const universityId = z
  .number("Enter a university ID")
  .int()
  .min(1_000_000, "Enter a valid university ID")
  .max(99_999_999_999, "Enter a valid university ID");

/** What counselors and admins may change about themselves. */
export const staffSelfUpdateSchema = z.object({
  first_name: name("First name"),
  last_name: name("Last name"),
  username,
  phone: optionalPhoneSchema,
});

const time = z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Choose a time");

export const availabilitySchema = z
  .object({
    day_of_week: z.array(z.boolean()).length(7),
    start_time: time,
    end_time: time,
    is_active: z.boolean(),
  })
  .refine((v) => v.end_time.slice(0, 5) > v.start_time.slice(0, 5), {
    message: "End time must be after the start time",
    path: ["end_time"],
  })
  .refine((v) => !v.is_active || v.day_of_week.some(Boolean), {
    message: "Choose at least one working day, or set yourself as unavailable",
    path: ["day_of_week"],
  });

export const counselorCreateSchema = z.object({
  first_name: name("First name"),
  last_name: name("Last name"),
  username,
  email: z.email("Enter a valid email address"),
  phone: optionalPhoneSchema,
  university_id: universityId,
  password: passwordSchema,
});

export const adminCounselorUpdateSchema = z.object({
  first_name: name("First name"),
  last_name: name("Last name"),
  username,
  phone: optionalPhoneSchema,
  university_id: universityId,
  is_active: z.boolean(),
});

export const adminSelfUpdateSchema = staffSelfUpdateSchema.extend({
  university_id: universityId,
});

export const changePasswordSchema = z
  .object({ password: passwordSchema, confirmPassword: z.string() })
  .refine((v) => v.password === v.confirmPassword, {
    message: "The passwords don't match",
    path: ["confirmPassword"],
  });
