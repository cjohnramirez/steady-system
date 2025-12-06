import z from "zod";

export const counselorUpdateFormSchema = z.object({
  email: z.email("Please enter a valid email address"),
  first_name: z.string().min(2, "First name must be at least two characters"),
  last_name: z
    .string({ error: "Last name is required" })
    .min(2, "Last name must be at least 2 characters"),
  university_id: z
    .string({ error: "Username is required" })
    .min(8, "University ID must be at least 8 characters"),
  username: z
    .string({ error: "Username is required" })
    .min(2, "Username must be at least 2 characters"),
  phone: z
    .string()
    .regex(/^\d{10,15}$/, "Phone number must be between 10 and 15 digits"),
  id: z.string(),
});
