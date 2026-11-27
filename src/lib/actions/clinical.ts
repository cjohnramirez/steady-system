"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { fail, ok, toErrorMessage, type Result } from "@/lib/result";
import {
  actionItemCreateSchema,
  clinicalNoteUpsertSchema,
  DUTY_STATUSES,
  manualBookingSchema,
  warmReferralCreateSchema,
  type ActionItemCreateInput,
  type ClinicalNoteUpsertInput,
  type ManualBookingInput,
  type WarmReferralCreateInput,
} from "@/lib/validation/clinical";

const dutyStatusSchema = z.enum(DUTY_STATUSES);
const toggleActionItemSchema = z.object({
  id: z.guid("Invalid action item"),
  is_completed: z.boolean(),
});
const uuidSchema = z.guid("Invalid identifier");

async function requireCounselorProfileId() {
  const user = await requireRole("counselor");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("counselor")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (error || !data) {
    throw new Error("Counselor profile not found.");
  }
  return { supabase, counselorId: data.id };
}

export async function saveClinicalNote(
  input: ClinicalNoteUpsertInput,
): Promise<Result<{ id: string }>> {
  try {
    const { supabase, counselorId } = await requireCounselorProfileId();
    const parsed = clinicalNoteUpsertSchema.parse(input);

    const { data, error } = await supabase
      .from("clinical_note")
      .upsert(
        {
          appointment_id: parsed.appointment_id,
          counselor_id: counselorId,
          format: parsed.format,
          content: parsed.content,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "appointment_id,counselor_id" },
      )
      .select("id")
      .single();

    if (error) return fail(toErrorMessage(error));

    revalidatePath("/counselor");
    revalidatePath("/counselor/appointments");
    return ok({ id: data.id });
  } catch (err) {
    return fail(toErrorMessage(err));
  }
}

export async function createActionItem(input: ActionItemCreateInput): Promise<
  Result<{
    id: string;
    title: string;
    due_date: string | null;
    is_completed: boolean;
  }>
> {
  try {
    const { supabase, counselorId } = await requireCounselorProfileId();
    const parsed = actionItemCreateSchema.parse(input);

    const { data, error } = await supabase
      .from("action_item")
      .insert({
        appointment_id: parsed.appointment_id ?? null,
        student_id: parsed.student_id,
        counselor_id: counselorId,
        title: parsed.title,
        due_date: parsed.due_date ?? null,
      })
      .select("id, title, due_date, is_completed")
      .single();

    if (error) return fail(toErrorMessage(error));

    revalidatePath("/counselor/students");
    revalidatePath("/student");
    return ok(data);
  } catch (err) {
    return fail(toErrorMessage(err));
  }
}

export async function toggleActionItem(input: {
  id: string;
  is_completed: boolean;
}): Promise<Result<{ id: string; is_completed: boolean }>> {
  try {
    await requireRole("student", "counselor");
    const parsed = toggleActionItemSchema.parse(input);
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("action_item")
      .update({ is_completed: parsed.is_completed })
      .eq("id", parsed.id)
      .select("id, is_completed")
      .single();

    if (error) return fail(toErrorMessage(error));

    revalidatePath("/student");
    revalidatePath("/counselor/students");
    return ok(data);
  } catch (err) {
    return fail(toErrorMessage(err));
  }
}

export async function deleteActionItem(id: string): Promise<Result> {
  try {
    await requireRole("counselor");
    const parsedId = uuidSchema.parse(id);
    const supabase = await createClient();

    const { error } = await supabase
      .from("action_item")
      .delete()
      .eq("id", parsedId);

    if (error) return fail(toErrorMessage(error));

    revalidatePath("/counselor/students");
    revalidatePath("/student");
    return ok();
  } catch (err) {
    return fail(toErrorMessage(err));
  }
}

export async function createWarmReferral(
  input: WarmReferralCreateInput,
): Promise<Result<{ id: string }>> {
  try {
    const { supabase, counselorId } = await requireCounselorProfileId();
    const parsed = warmReferralCreateSchema.parse(input);

    const { data, error } = await supabase
      .from("warm_referral")
      .insert({
        appointment_id: parsed.appointment_id ?? null,
        student_id: parsed.student_id,
        from_counselor_id: counselorId,
        to_counselor_id: parsed.to_counselor_id ?? null,
        external_clinic: parsed.external_clinic || undefined,
        summary: parsed.summary,
        urgency: parsed.urgency,
      })
      .select("id")
      .single();

    if (error) return fail(toErrorMessage(error));

    revalidatePath("/counselor");
    revalidatePath("/counselor/appointments");
    revalidatePath("/admin/appointments");
    return ok({ id: data.id });
  } catch (err) {
    return fail(toErrorMessage(err));
  }
}

export async function updateDutyStatus(
  status: (typeof DUTY_STATUSES)[number],
): Promise<Result<{ duty_status: (typeof DUTY_STATUSES)[number] }>> {
  try {
    const { supabase, counselorId } = await requireCounselorProfileId();
    const parsed = dutyStatusSchema.parse(status);

    const { error } = await supabase
      .from("counselor")
      .update({ duty_status: parsed })
      .eq("id", counselorId);

    if (error) return fail(toErrorMessage(error));

    revalidatePath("/counselor");
    return ok({ duty_status: parsed });
  } catch (err) {
    return fail(toErrorMessage(err));
  }
}

export async function createManualBooking(
  input: ManualBookingInput,
): Promise<Result<{ id: string }>> {
  try {
    const { supabase, counselorId } = await requireCounselorProfileId();
    const parsed = manualBookingSchema.parse(input);

    const { data, error } = await supabase
      .from("appointment")
      .insert({
        student_id: parsed.student_id,
        counselor_id: counselorId,
        scheduled_at: parsed.scheduled_at,
        duration_minutes: parsed.duration_minutes,
        urgency: parsed.urgency,
        reason: parsed.reason,
        status: "approved",
        created_by_role: "counselor",
      })
      .select("id")
      .single();

    if (error) return fail(toErrorMessage(error));

    revalidatePath("/counselor");
    revalidatePath("/counselor/appointments");
    revalidatePath("/student");
    revalidatePath("/student/appointments");
    return ok({ id: data.id });
  } catch (err) {
    return fail(toErrorMessage(err));
  }
}
