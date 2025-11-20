import z from "zod";

export const contactInfoFormSchema = z.object({
  platform: z.string(),
  contact_detail: z.string(),
});

export const organizationInfoFormSchema = z.object({
  name: z
    .string({ error: "Name is required" })
    .min(2, "Name must be at least 2 characters"),
  abbreviation: z
    .string({ error: "Abbreviation is required" })
    .min(2, "Abbreviation must be at least 2 characters"),
  office_location: z
    .string({ error: "Office location is required" })
    .min(10, "Location must be at least 10 characters"),
});
