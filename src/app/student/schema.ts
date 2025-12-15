import z from "zod";

export const contactPersonSchema = z.object({
  id: z.string().uuid().optional(),
  first_name: z.string().min(1, "Required"),
  last_name: z.string().min(1, "Required"),
  middle_name: z.string().min(1, "Middle name is required"),
  phone: z.string().min(7, "Invalid phone"),
});

export const updateContactPersonSchema = z.object({
  contact_person: z
    .array(contactPersonSchema)
    .min(1, "At least one contact person is required"),
});
