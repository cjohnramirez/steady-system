import z from "zod";

export const appointmentUpdateFormSchema = z.object({
  id: z.uuid("Must be an existing appointment"),
  student_id: z.uuid("Must be a valid student"),
  counselor_id: z.uuid("Must be a valid counselor"),
  scheduled_at: z.string("Must be a valid date"),
  status: z.string(),
  notes: z.string(),
});