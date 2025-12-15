import { z } from "zod";

export const departmentSchema = z.object({
  college_id: z.string(),
  id: z.string(),
});

export const departmentsSchema = z.object({
  departments: z.array(departmentSchema),
});