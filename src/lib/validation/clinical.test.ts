import { describe, expect, it } from "vitest";
import {
  actionItemCreateSchema,
  clinicalNoteUpsertSchema,
  manualBookingSchema,
  warmReferralCreateSchema,
} from "./clinical";

const VALID_UUID = "11111111-1111-4111-8111-111111111111";
const VALID_UUID_2 = "22222222-2222-4222-8222-222222222222";

describe("clinical validation schemas", () => {
  it("accepts valid SOAP and SAP clinical notes", () => {
    const soap = clinicalNoteUpsertSchema.safeParse({
      appointment_id: VALID_UUID,
      format: "soap",
      content: {
        subjective: "Student reports pre-exam anxiety.",
        objective: "Calm affect, steady speech.",
        assessment: "Mild academic stress.",
        plan: "Practice 4-7-8 breathing daily.",
      },
    });
    expect(soap.success).toBe(true);

    const sap = clinicalNoteUpsertSchema.safeParse({
      appointment_id: VALID_UUID,
      format: "sap",
      content: {
        situation: "Midterm overload.",
        action: "Built a realistic study schedule.",
        plan: "Follow-up in 2 weeks.",
      },
    });
    expect(sap.success).toBe(true);
  });

  it("rejects empty action item titles and invalid dates", () => {
    expect(
      actionItemCreateSchema.safeParse({
        student_id: VALID_UUID,
        title: "   ",
      }).success,
    ).toBe(false);

    expect(
      actionItemCreateSchema.safeParse({
        student_id: VALID_UUID,
        title: "Log sleep hours",
        due_date: "11/28/2026",
      }).success,
    ).toBe(false);

    expect(
      actionItemCreateSchema.safeParse({
        student_id: VALID_UUID,
        title: "Log sleep hours",
        due_date: "2026-12-05",
      }).success,
    ).toBe(true);
  });

  it("requires either a colleague or an external clinic for warm referrals", () => {
    const neither = warmReferralCreateSchema.safeParse({
      student_id: VALID_UUID,
      summary: "Needs specialist sleep consultation and follow-up.",
      urgency: "medium",
    });
    expect(neither.success).toBe(false);

    const colleague = warmReferralCreateSchema.safeParse({
      student_id: VALID_UUID,
      to_counselor_id: VALID_UUID_2,
      summary: "Needs specialist sleep consultation and follow-up.",
      urgency: "high",
    });
    expect(colleague.success).toBe(true);

    const external = warmReferralCreateSchema.safeParse({
      student_id: VALID_UUID,
      external_clinic: "University Health Center",
      summary: "Needs specialist sleep consultation and follow-up.",
      urgency: "low",
    });
    expect(external.success).toBe(true);
  });

  it("validates manual booking duration and ISO timestamp", () => {
    expect(
      manualBookingSchema.safeParse({
        student_id: VALID_UUID,
        scheduled_at: "2026-12-01T09:00:00+08:00",
        duration_minutes: 45,
        urgency: "medium",
        reason: "Walk-in follow-up",
      }).success,
    ).toBe(true);

    expect(
      manualBookingSchema.safeParse({
        student_id: VALID_UUID,
        scheduled_at: "not-a-date",
        duration_minutes: 5,
        reason: "",
      }).success,
    ).toBe(false);
  });
});
