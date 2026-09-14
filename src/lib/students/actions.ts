"use server";

import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { fail, ok, toErrorMessage, type Result } from "@/lib/result";
import {
  adminStudentUpdateSchema,
  contactPersonsSchema,
  studentSelfUpdateSchema,
} from "@/lib/validation/student";

async function guarded<T>(
  roles: Parameters<typeof requireRole>,
  run: (userId: string, role: string | null) => Promise<Result<T>>,
): Promise<Result<T>> {
  try {
    const user = await requireRole(...roles);
    return await run(user.id, user.role);
  } catch (error) {
    return fail(toErrorMessage(error));
  }
}

/**
 * A student edits their own profile. Only the fields in studentSelfUpdateSchema are
 * accepted, and the update is keyed on the session, not on an id from the client.
 * The old action accepted any column for any row, so a student could clear their
 * own is_disabled flag or move themselves into another department.
 */
export async function updateOwnProfile(
  input: z.input<typeof studentSelfUpdateSchema>,
): Promise<Result> {
  return guarded(["student"], async (userId) => {
    const parsed = studentSelfUpdateSchema.safeParse(input);
    if (!parsed.success) return fail(toErrorMessage(parsed.error));

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("student")
      .update({ ...parsed.data, phone: parsed.data.phone || null })
      .eq("user_id", userId)
      .select("id")
      .maybeSingle();

    if (error)
      return fail(toErrorMessage(error, "We couldn't save your profile."));
    if (!data) return fail("We couldn't find your profile.");
    return ok();
  });
}

export async function updateOwnEmotionalStatus(
  emotionalStatusId: string,
): Promise<Result> {
  return guarded(["student"], async (userId) => {
    if (!z.guid().safeParse(emotionalStatusId).success)
      return fail("Choose how you are feeling.");

    const supabase = await createClient();
    const { error } = await supabase
      .from("student")
      .update({ emotional_status_id: emotionalStatusId })
      .eq("user_id", userId);

    if (error) return fail(toErrorMessage(error));
    return ok();
  });
}

/**
 * Replaces a student's emergency contacts in one transaction. The old version
 * deleted every contact and then inserted the new list as a second request, so a
 * failed insert left the student with none.
 */
export async function saveContactPersons(
  studentId: string,
  contacts: z.input<typeof contactPersonsSchema>,
): Promise<Result> {
  return guarded(["student", "admin"], async () => {
    if (!z.guid().safeParse(studentId).success)
      return fail("That student could not be found.");
    const parsed = contactPersonsSchema.safeParse(contacts);
    if (!parsed.success) return fail(toErrorMessage(parsed.error));

    const supabase = await createClient();
    const { error } = await supabase.rpc("replace_contact_persons", {
      p_student_id: studentId,
      p_contacts: parsed.data,
    });

    if (error)
      return fail(toErrorMessage(error, "We couldn't save the contacts."));
    return ok();
  });
}

export async function adminUpdateStudent(
  studentId: string,
  input: z.input<typeof adminStudentUpdateSchema>,
): Promise<Result> {
  return guarded(["admin"], async () => {
    if (!z.guid().safeParse(studentId).success)
      return fail("That student could not be found.");
    const parsed = adminStudentUpdateSchema.safeParse(input);
    if (!parsed.success) return fail(toErrorMessage(parsed.error));

    const { college_id: _college, ...values } = parsed.data;
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("student")
      .update({ ...values, phone: values.phone || null })
      .eq("id", studentId)
      .select("id")
      .maybeSingle();

    if (error)
      return fail(toErrorMessage(error, "We couldn't save the student."));
    if (!data) return fail("That student could not be found.");
    return ok();
  });
}
