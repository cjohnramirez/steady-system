import { z } from "zod";

export const URGENCY_LEVELS = ["low", "medium", "high"] as const;
export const DUTY_STATUSES = [
  "available",
  "in_session",
  "writing_notes",
  "off_duty",
] as const;
export const NOTE_FORMATS = ["soap", "sap"] as const;
export const REFERRAL_STATUSES = [
  "pending",
  "accepted",
  "declined",
  "completed",
] as const;

export const soapNoteSchema = z.object({
  subjective: z.string().trim().max(4000).default(""),
  objective: z.string().trim().max(4000).default(""),
  assessment: z.string().trim().max(4000).default(""),
  plan: z.string().trim().max(4000).default(""),
});

export const sapNoteSchema = z.object({
  situation: z.string().trim().max(4000).default(""),
  action: z.string().trim().max(4000).default(""),
  plan: z.string().trim().max(4000).default(""),
});

export const clinicalNoteUpsertSchema = z.discriminatedUnion("format", [
  z.object({
    appointment_id: z.guid("Select an appointment"),
    format: z.literal("soap"),
    content: soapNoteSchema,
  }),
  z.object({
    appointment_id: z.guid("Select an appointment"),
    format: z.literal("sap"),
    content: sapNoteSchema,
  }),
]);

export const actionItemCreateSchema = z.object({
  appointment_id: z.guid().optional(),
  student_id: z.guid("Select a student"),
  title: z
    .string()
    .trim()
    .min(1, "Enter an action step")
    .max(240, "Keep action steps under 240 characters"),
  due_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid date")
    .optional(),
});

export const warmReferralCreateSchema = z
  .object({
    appointment_id: z.guid().optional(),
    student_id: z.guid("Select a student"),
    to_counselor_id: z.guid().optional(),
    external_clinic: z.string().trim().max(160).default(""),
    summary: z
      .string()
      .trim()
      .min(10, "Provide a brief clinical handoff summary")
      .max(2000, "Keep the summary under 2000 characters"),
    urgency: z.enum(URGENCY_LEVELS).default("medium"),
  })
  .refine(
    (v) => Boolean(v.to_counselor_id) || v.external_clinic.trim().length > 0,
    {
      message: "Select a receiving counselor or enter an external clinic",
      path: ["to_counselor_id"],
    },
  );

export const manualBookingSchema = z.object({
  student_id: z.guid("Select a student"),
  scheduled_at: z.iso.datetime({
    offset: true,
    message: "Choose a date and time",
  }),
  duration_minutes: z.number().int().min(15).max(180).default(45),
  urgency: z.enum(URGENCY_LEVELS).default("low"),
  reason: z.string().trim().min(1, "Enter a reason").max(500),
});

export type ClinicalNoteUpsertInput = z.input<typeof clinicalNoteUpsertSchema>;
export type ActionItemCreateInput = z.input<typeof actionItemCreateSchema>;
export type WarmReferralCreateInput = z.input<typeof warmReferralCreateSchema>;
export type ManualBookingInput = z.input<typeof manualBookingSchema>;
