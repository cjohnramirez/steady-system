import { z } from "zod";

export const adminProfileFormSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.email("Invalid email"),
  username: z.string().min(3, "Username too short"),
  phone: z.string().regex(/^09\d{9}$/, "Phone must be 11 digits starting with 09"),
});

export const adminPasswordFormSchema = z.object({
  
})