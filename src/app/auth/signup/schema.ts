import z from "zod";

export const signUpFormSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z
    .string({ error: "Last name is required" })
    .min(2, "Last name must be at least 2 characters"),
  email: z.email({ error: "Please enter a valid email address" }),
  college: z.uuid("Please select a valid college"),
  departmentId: z.uuid("Please select a valid department"),
  yearLevel: z
    .int()
    .min(1, "Year level must be between 1 and 5")
    .max(5, "Year level must be between 1 and 5"),
  studentId: z.number({ error: "Please enter a valid student ID number" }),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(255, "Password must not exceed 255 characters")
    .regex(/(?=.*[a-z])/, "Password must contain at least one lowercase letter")
    .regex(/(?=.*[A-Z])/, "Password must contain at least one uppercase letter")
    .regex(/(?=.*\d)/, "Password must contain at least one number")
    .regex(/(?=.*[^A-Za-z0-9])/, "Password must contain at least one special character"),
});
