import {
  studentSignUpFormSchema,
  userFormSchema,
} from "@/app/auth/signup/schema";
import z from "zod";

export const studentUpdateFormSchema = studentSignUpFormSchema
  .omit({
    password: true,
    college: true,
  })
  .extend({
    id: z.string(),
  });

export const counselorFormSchema = userFormSchema
  .omit({
    password: true,
    username: true,
  })
  .extend({
    id: z.string(),
    college_id: z.uuid().min(1, "College is required"),
  });