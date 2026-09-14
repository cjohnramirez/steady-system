"use server";

import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { fail, ok, toErrorMessage, type Result } from "@/lib/result";

/**
 * Appointment changes. Each one is also enforced in the database: the insert
 * policy, guard_appointment_update and assert_slot_bookable decide what is allowed,
 * and the notification trigger tells the other party. These actions validate input
 * and turn database refusals into messages a person can read.
 */

const idSchema = z.guid("That appointment could not be found.");

const bookingSchema = z.object({
  counselor_id: z.guid("Choose a counselor"),
  scheduled_at: z.iso.datetime({ offset: true, message: "Choose a time slot" }),
  reason: z
    .string()
    .trim()
    .min(1, "Choose a reason")
    .max(120, "Keep the reason under 120 characters"),
  notes: z.string().trim().max(500, "Keep notes under 500 characters"),
});

export type BookingInput = z.input<typeof bookingSchema>;

async function authorized<T>(
  roles: Parameters<typeof requireRole>,
  run: () => Promise<Result<T>>,
): Promise<Result<T>> {
  try {
    await requireRole(...roles);
    return await run();
  } catch (error) {
    return fail(toErrorMessage(error));
  }
}

export async function bookAppointment(
  input: BookingInput,
): Promise<Result<{ id: string }>> {
  return authorized(["student"], async () => {
    const parsed = bookingSchema.safeParse(input);
    if (!parsed.success) return fail(toErrorMessage(parsed.error));

    const supabase = await createClient();
    const { data: studentId, error: studentError } =
      await supabase.rpc("current_student_id");
    if (studentError || !studentId)
      return fail("We couldn't find your student profile.");

    const { data, error } = await supabase
      .from("appointment")
      .insert({ ...parsed.data, student_id: studentId, status: "pending" })
      .select("id")
      .single();

    if (error) {
      if (error.code === "42501") {
        return fail(
          "You can only book with the counselor assigned to your department.",
        );
      }
      return fail(toErrorMessage(error, "We couldn't book that appointment."));
    }
    return ok({ id: data.id });
  });
}

/** Student cancels their own pending or approved appointment. */
export async function cancelAppointment(id: string): Promise<Result> {
  return authorized(["student", "counselor", "admin"], async () => {
    if (!idSchema.safeParse(id).success)
      return fail("That appointment could not be found.");
    return setStatus(id, "cancelled");
  });
}

const counselorStatusSchema = z.enum([
  "approved",
  "rejected",
  "completed",
  "cancelled",
]);

/**
 * Counselor accepts, declines, completes or cancels.
 *
 * Accept used to send no id at all, and Reject deleted the row through a policy
 * that did not allow counselors to delete, so it reported success and did nothing.
 */
export async function setAppointmentStatus(
  id: string,
  status: z.input<typeof counselorStatusSchema>,
): Promise<Result> {
  return authorized(["counselor", "admin"], async () => {
    if (!idSchema.safeParse(id).success)
      return fail("That appointment could not be found.");
    const parsed = counselorStatusSchema.safeParse(status);
    if (!parsed.success) return fail("That status isn't allowed.");
    return setStatus(id, parsed.data);
  });
}

export async function rescheduleAppointment(
  id: string,
  scheduledAt: string,
): Promise<Result> {
  return authorized(["counselor", "admin"], async () => {
    if (!idSchema.safeParse(id).success)
      return fail("That appointment could not be found.");
    if (!z.iso.datetime({ offset: true }).safeParse(scheduledAt).success) {
      return fail("Choose a new time slot.");
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("appointment")
      .update({ scheduled_at: scheduledAt })
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error)
      return fail(
        toErrorMessage(error, "We couldn't reschedule that appointment."),
      );
    if (!data) return fail("That appointment could not be found.");
    return ok();
  });
}

export async function updateAppointmentNotes(
  id: string,
  notes: string,
): Promise<Result> {
  return authorized(["counselor", "admin"], async () => {
    if (!idSchema.safeParse(id).success)
      return fail("That appointment could not be found.");
    const parsed = z
      .string()
      .trim()
      .max(1000, "Keep notes under 1000 characters")
      .safeParse(notes);
    if (!parsed.success) return fail(toErrorMessage(parsed.error));

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("appointment")
      .update({ notes: parsed.data })
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) return fail(toErrorMessage(error));
    if (!data) return fail("That appointment could not be found.");
    return ok();
  });
}

async function setStatus(
  id: string,
  status: "approved" | "rejected" | "completed" | "cancelled",
): Promise<Result> {
  const supabase = await createClient();
  // select() so a row hidden by row-level security reads as "not found" rather
  // than as a silent success.
  const { data, error } = await supabase
    .from("appointment")
    .update({ status })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error)
    return fail(toErrorMessage(error, "We couldn't update that appointment."));
  if (!data) return fail("That appointment could not be found.");
  return ok();
}
