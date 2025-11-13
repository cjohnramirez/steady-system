import { userFormSchema } from "@/app/auth/signup/schema";
import { z } from "zod";

export const adminProfileFormSchema = userFormSchema
  .extend({
    phone: z
      .string()
      .regex(/^09\d{9}$/, "Phone must be 11 digits starting with 09"),
  })
  .omit({
    password: true,
  });

export const adminPasswordFormSchema = z
  .object({
    password: userFormSchema.shape.password,
    confirmPassword: userFormSchema.shape.password,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password must match",
  });

export const adminProfilePictureFormSchema = z.object({
  avatar: z.url(),
});
