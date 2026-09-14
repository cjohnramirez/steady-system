import { z } from "zod";
import { phoneSchema } from "./fields";

const time = z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Choose a time");

export const organizationSchema = z
  .object({
    name: z.string().trim().min(2, "Enter the office name").max(120),
    abbreviation: z.string().trim().min(2, "Enter an abbreviation").max(20),
    email: z.email("Enter a valid email address"),
    phone: phoneSchema,
    office_location: z
      .string()
      .trim()
      .min(5, "Enter the office location")
      .max(200),
    day_of_week: z.array(z.boolean()).length(7),
    start_office_hour: time,
    end_office_hour: time,
  })
  .refine(
    (v) => v.end_office_hour.slice(0, 5) > v.start_office_hour.slice(0, 5),
    {
      message: "Closing time must be after opening time",
      path: ["end_office_hour"],
    },
  );

export const CONTACT_PLATFORMS = [
  "facebook",
  "instagram",
  "email",
  "phone",
  "website",
] as const;

export const organizationContactsSchema = z
  .array(
    z.object({
      platform: z.enum(CONTACT_PLATFORMS, "Choose a platform"),
      contact_detail: z
        .string()
        .trim()
        .min(3, "Enter the contact detail")
        .max(200),
    }),
  )
  .max(10);
