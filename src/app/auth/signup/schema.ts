import z from "zod";

export const contactPersonSchema = z.object({
  first_name: z.string().min(1, "Required"),
  last_name: z.string().min(1, "Required"),
  middle_name: z.string().min(1, "Middle name is required"),
  phone: z.string().min(7, "Invalid phone"),
});

export const studentBaseSchema = z.object({
  department_id: z.uuid().min(1, "Please select a valid department"),
  first_name: z.string().min(2, "First name must be at least two characters"),
  last_name: z
    .string({ error: "Last name is required" })
    .min(2, "Last name must be at least 2 characters"),
  year_level: z
    .number()
    .int()
    .min(1, "Year level must be valid")
    .max(5, "Year level must not exceed 5"),
  emotional_status_id: z.uuid().min(1, "Please select an emotional status"),
  email: z.email("Please enter a valid email address"),
  university_id: z
    .number()
    .min(1990000000, "Please enter a valid university ID"),
  username: z
    .string({ error: "Username is required" })
    .min(2, "Username must be at least 2 characters"),
  phone: z
    .string()
    .regex(/^\d{10,15}$/, "Phone number must be between 10 and 15 digits"),
  college: z.string().min(1, "Please select a valid college"),
  middle_name: z.string(),
  age: z
    .number()
    .int()
    .min(5, "Age is too low")
    .max(100, "You are definitely not that old"),
  gender: z.string().min(1, "Please select a gender"),
});

export const studentInsertFormSchema = studentBaseSchema.extend({
  contact_person: z
    .array(contactPersonSchema)
    .min(1, "At least one contact person is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(255, "Password must not exceed 255 characters")
    .regex(/(?=.*[a-z])/, "Password must contain at least one lowercase letter")
    .regex(/(?=.*[A-Z])/, "Password must contain at least one uppercase letter")
    .regex(/(?=.*\d)/, "Password must contain at least one number")
    .regex(
      /(?=.*[^A-Za-z0-9])/,
      "Password must contain at least one special character",
    ),
});

export const studentUpdateFormSchema = studentBaseSchema.extend({
  id: z.uuid("Please provide a valid student ID"),
});
