"use server";

import { createServiceClient } from "@/utils/supabase/service";
import { requireRole } from "@/lib/auth/session";
import { counselorInsertFormSchema } from "./@modal/schema";
import type z from "zod";

type CounselorInsert = z.infer<typeof counselorInsertFormSchema>;

/**
 * Creates a counselor account: an auth user, a role assignment, and a profile row.
 *
 * Two things this function used to get wrong, both worth keeping in mind before
 * editing it.
 *
 * It ran with the service-role key and checked nothing, while living in a
 * "use server" module. That made it a public endpoint that granted the caller the
 * counselor role, so the `requireRole` call below is load bearing rather than
 * decorative.
 *
 * It also created the auth user with `signUp` on the cookie-bound server client.
 * That issues a session for the new account and writes it over the caller's own
 * cookies, so an admin who added a counselor was silently signed out and signed
 * back in as the person they had just created. `auth.admin.createUser` touches no
 * cookies, which is why it is used here.
 */
export default async function insertCounselor(values: CounselorInsert) {
  await requireRole("admin");

  // The client already validated with this schema, but a server action is reachable
  // without going through the form at all.
  const input = counselorInsertFormSchema.parse(values);
  const { password, ...profile } = input;

  const supabaseAdmin = createServiceClient();

  const { data: created, error: createError } =
    await supabaseAdmin.auth.admin.createUser({
      email: profile.email,
      password,
      email_confirm: true,
    });

  if (createError || !created.user) {
    throw new Error(
      `Could not create the counselor account: ${createError?.message ?? "unknown error"}`,
    );
  }

  const userId = created.user.id;

  // From here on, any failure leaves an auth user with no profile, so each step
  // cleans up after itself rather than leaving an account nobody can use.
  const { error: roleError } = await supabaseAdmin
    .from("user_roles")
    .insert({ user_id: userId, role: "counselor" });

  if (roleError) {
    await supabaseAdmin.auth.admin.deleteUser(userId);
    throw new Error(
      `Could not assign the counselor role: ${roleError.message}`,
    );
  }

  const { error: profileError } = await supabaseAdmin
    .from("counselor")
    .insert({ ...profile, user_id: userId });

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(userId);
    throw new Error(
      `Could not create the counselor profile: ${profileError.message}`,
    );
  }

  return { success: "Counselor account created." };
}
