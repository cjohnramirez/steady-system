"use server";

import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import { clientEnv } from "@/lib/env/client";
import { getSessionUser, isRecoverySession } from "@/lib/auth/session";
import { ROLE_HOME } from "@/lib/auth/roles";
import { fail, ok, type Result } from "@/lib/result";
import { passwordSchema } from "@/lib/validation/fields";

const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
  role: z.enum(["student", "counselor", "admin"]),
});

export type LoginInput = z.input<typeof loginSchema>;

/**
 * Signs a user in and says where to send them.
 *
 * The role comes from the verified session, not from the tab the visitor clicked;
 * the submitted role is only used to refuse a mismatch. Failures are returned, not
 * thrown, because a production build hides thrown messages, which turned "wrong
 * password" into a generic error. A refused login signs out this device only; the
 * default global scope used to end the account's sessions everywhere.
 */
export async function logIn(
  input: LoginInput,
): Promise<Result<{ redirectTo: string }>> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success)
    return fail(parsed.error.issues[0]?.message ?? "Check your details.");

  const { email, password, role } = parsed.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return fail(
      /invalid login credentials/i.test(error.message)
        ? "That email and password don't match."
        : error.message,
    );
  }

  const refuse = async (message: string) => {
    await supabase.auth.signOut({ scope: "local" });
    return fail(message);
  };

  const user = await getSessionUser();
  if (!user) return refuse("We couldn't start your session. Please try again.");
  if (!user.role) {
    return refuse(
      "This account isn't set up yet. Please contact the guidance office.",
    );
  }
  if (user.role !== role) {
    return refuse(
      `This is a ${user.role} account. Use the ${user.role} tab to log in.`,
    );
  }

  if (role === "student") {
    const { data } = await supabase
      .from("student")
      .select("is_disabled")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!data) return refuse("We couldn't find your student profile.");
    if (data.is_disabled)
      return refuse(
        "This account has been disabled. Please contact the guidance office.",
      );
  } else {
    const { data } = await supabase
      .from(role)
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!data) return refuse("We couldn't find your profile.");
  }

  // Best effort. A failed counter must never block a login.
  const { error: analyticsError } = await supabase.rpc("increment_daily_login");
  if (analyticsError)
    console.warn("Login analytics update failed:", analyticsError.message);

  return ok({ redirectTo: ROLE_HOME[role] });
}

/**
 * Sends a reset link. The link returns through /auth/callback, which exchanges the
 * code for a recovery session and forwards to /auth/reset-password.
 *
 * Always reports success for a well-formed address, so the form cannot be used to
 * find out which emails have accounts.
 */
export async function sendPasswordResetEmail(email: string): Promise<Result> {
  const parsed = z.email().safeParse(email);
  if (!parsed.success) return fail("Enter a valid email address.");

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: `${clientEnv.NEXT_PUBLIC_APP_URL}/auth/callback?next=/auth/reset-password`,
  });

  if (error && /rate limit/i.test(error.message)) {
    return fail(
      "Too many reset emails were requested. Please wait a few minutes and try again.",
    );
  }

  return ok();
}

/** Sets a new password. Only valid inside the recovery session the email link opens. */
export async function updatePassword(
  password: string,
): Promise<Result<{ redirectTo: string }>> {
  const parsed = passwordSchema.safeParse(password);
  if (!parsed.success)
    return fail(
      parsed.error.issues[0]?.message ?? "Choose a stronger password.",
    );

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !(await isRecoverySession())) {
    return fail("Your reset link has expired. Please request a new one.");
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data });
  if (error) return fail(error.message);

  const sessionUser = await getSessionUser();
  return ok({
    redirectTo: sessionUser?.role ? ROLE_HOME[sessionUser.role] : "/home",
  });
}
