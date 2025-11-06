import { signUpFormSchema } from "@/app/auth/signup/schema";
import { z } from "zod";

const { first_name, last_name, email, username, password } =
  signUpFormSchema.shape;

export const adminProfileFormSchema = z.object({
  first_name: first_name,
  last_name: last_name,
  email: email,
  username: username,
  phone: z
    .string()
    .regex(/^09\d{9}$/, "Phone must be 11 digits starting with 09"),
});

export const adminPasswordFormSchema = z
  .object({
    password: password,
    confirmPassword: password,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password must match",
    path: ["confirmPassword"],
  });

export const adminProfilePictureFormSchema = z.object({
  avatar: z.url()
})
