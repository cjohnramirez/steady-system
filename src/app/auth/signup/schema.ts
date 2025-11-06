import z from "zod";

export const signUpFormSchema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z
    .string({ error: "Last name is required" })
    .min(2, "Last name must be at least 2 characters"),
  username: z
    .string({ error: "Username is required" })
    .min(2, "Username must be at least 2 characters"),
  email: z.email("Please enter a valid email address"),
  college: z.string().min(1, "Please select a valid college"),
  department_id: z.string().min(1, "Please select a valid department"),
  year_level: z.string().regex(/^[1-5]$/, "Year level must be between 1 and 5"),
  student_id: z
    .string()
    .regex(/^\d{10}$/, "Student ID must be exactly 10 digits"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(255, "Password must not exceed 255 characters")
    .regex(/(?=.*[a-z])/, "Password must contain at least one lowercase letter")
    .regex(/(?=.*[A-Z])/, "Password must contain at least one uppercase letter")
    .regex(/(?=.*\d)/, "Password must contain at least one number")
    .regex(/(?=.*[^A-Za-z0-9])/, "Password must contain at least one special character"),
});
