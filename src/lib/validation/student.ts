import { z } from "zod";
import { optionalPhoneSchema, passwordSchema, phoneSchema } from "./fields";

/**
 * Student form schemas. Limits match the database constraints in
 * supabase/migrations: age 10–120, year level 1–6, text phone numbers.
 *
 * The old signup schema allowed ages from 5, required an emergency contact's middle
 * name while labelling it optional, and demanded a 10-digit university ID the seeded
 * accounts did not have. The admin edit form validated fields it did not render, so
 * it could never be submitted.
 */

const name = (label: string, min = 1) =>
  z
    .string()
    .trim()
    .min(min, `${label} is required`)
    .max(80, `${label} is too long`);

export const GENDERS = [
  "male",
  "female",
  "non-binary",
  "prefer not to say",
] as const;

export const contactPersonSchema = z.object({
  first_name: name("First name"),
  middle_name: z.string().trim().max(80),
  last_name: name("Last name"),
  phone: phoneSchema,
});

export type ContactPersonInput = z.input<typeof contactPersonSchema>;

export const contactPersonsSchema = z
  .array(contactPersonSchema)
  .min(1, "Add at least one emergency contact")
  .max(3, "Add up to three emergency contacts");

const profileFields = {
  first_name: name("First name"),
  middle_name: z.string().trim().max(80),
  last_name: name("Last name"),
  username: z
    .string()
    .trim()
    .min(3, "Use at least 3 characters")
    .max(30, "Use 30 characters or fewer")
    .regex(
      /^[a-zA-Z0-9._]+$/,
      "Use letters, numbers, dots and underscores only",
    ),
  phone: optionalPhoneSchema,
  gender: z.enum(GENDERS, "Choose a gender"),
  age: z
    .number("Enter your age")
    .int()
    .min(10, "Age must be at least 10")
    .max(120, "Enter a valid age"),
  year_level: z
    .number("Choose a year level")
    .int()
    .min(1, "Choose a year level")
    .max(6),
};

const enrollmentFields = {
  college_id: z.guid("Choose a college"),
  department_id: z.guid("Choose a department"),
  university_id: z
    .number("Enter your university ID")
    .int()
    .min(1_000_000, "Enter a valid university ID")
    .max(99_999_999_999, "Enter a valid university ID"),
  emotional_status_id: z.guid("Choose how you are feeling"),
};

export const signupSchema = z.object({
  ...profileFields,
  ...enrollmentFields,
  email: z.email("Enter a valid email address"),
  password: passwordSchema,
  contact_person: contactPersonsSchema,
  consent: z.literal(true, "Please read and accept the consent form"),
});

export type SignupInput = z.input<typeof signupSchema>;

/** What a student may change about themselves. Enrollment fields are admin-only. */
export const studentSelfUpdateSchema = z.object(profileFields);

/** What an admin may change on a student record. */
export const adminStudentUpdateSchema = z.object({
  ...profileFields,
  college_id: enrollmentFields.college_id,
  department_id: enrollmentFields.department_id,
  university_id: enrollmentFields.university_id,
  is_disabled: z.boolean(),
});
