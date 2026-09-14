"use server";

import { createClient } from "@/utils/supabase/server";
import { clientEnv } from "@/lib/env/client";
import { fail, ok, toErrorMessage, type Result } from "@/lib/result";
import { signupSchema, type SignupInput } from "@/lib/validation/student";

/**
 * Registers a student.
 *
 * The profile travels in user_metadata and is written by the on_auth_user_created
 * trigger in the same transaction as the auth user, so a failure leaves nothing
 * behind. This replaces four separate service-key writes that stranded an
 * unusable, signed-in account whenever a later write failed.
 *
 * With email confirmation off (the current setting) signUp returns a session and
 * the student goes straight to their dashboard. With it on, there is no session
 * yet and the form tells them to check their email. Both work unchanged.
 */
export async function signUpStudent(
  input: SignupInput,
): Promise<Result<{ needsConfirmation: boolean }>> {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) return fail(toErrorMessage(parsed.error));

  const {
    email,
    password,
    consent: _consent,
    college_id: _college,
    ...profile
  } = parsed.data;
  const supabase = await createClient();

  const { data: available, error: availabilityError } = await supabase.rpc(
    "is_username_available",
    { p_username: profile.username },
  );

  if (availabilityError) return fail(toErrorMessage(availabilityError));
  if (!available) return fail("That username is already taken.");

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { student_profile: profile },
      emailRedirectTo: `${clientEnv.NEXT_PUBLIC_APP_URL}/auth/callback?next=/student`,
    },
  });

  if (error) {
    if (/already registered|already been registered/i.test(error.message)) {
      return fail(
        "An account with that email already exists. Try logging in instead.",
      );
    }
    if (/student_username_key/i.test(error.message)) {
      // Taken between the availability check and the insert.
      return fail("That username is already taken.");
    }
    if (/database error|violates|constraint/i.test(error.message)) {
      // The signup trigger raised, and the auth user was rolled back with it.
      return fail(
        "We couldn't create your profile. Check your details and try again.",
      );
    }
    return fail(error.message);
  }

  return ok({ needsConfirmation: !data.session });
}
