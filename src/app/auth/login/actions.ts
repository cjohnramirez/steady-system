"use server";

import { z } from "zod";
import { roles } from "@/types/main";
import { createClient } from "@/utils/supabase/server";
import { getSessionUser } from "@/lib/auth/session";
import { LoginFormSchema } from "./schema";

type LoginData = z.infer<typeof LoginFormSchema>;

export type LoginResult = {
  role: roles;
  id: string;
  userName: string;
  firstName?: string;
  emotionalStatus?: string;
};

/**
 * Signs a user in and returns just enough profile detail for the client shell.
 *
 * The role comes from the verified session, not from the tab the visitor happened
 * to click. The submitted role is only used to reject a mismatch, so someone who
 * opens the admin login page with student credentials is refused rather than
 * quietly signed in.
 *
 * Every read here runs as the newly signed-in user. The service-role key is not
 * involved: row-level security already lets a user read their own profile, and
 * using an unrestricted key for that is how a routine login ends up able to read
 * every row in the database.
 */
export default async function LoginFormAction(
  data: LoginData,
): Promise<LoginResult> {
  const input = LoginFormSchema.parse(data);
  const supabase = await createClient();

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (signInError) {
    throw new Error(signInError.message);
  }

  const user = await getSessionUser();

  if (!user) {
    throw new Error("Could not establish a session. Please try again.");
  }

  if (!user.role) {
    await supabase.auth.signOut();
    throw new Error(
      "This account has no role assigned yet. Please contact the guidance office.",
    );
  }

  if (user.role !== input.role) {
    await supabase.auth.signOut();
    throw new Error("This account cannot sign in from that page.");
  }

  // Best effort. A failed counter must never block a login, which is what it used
  // to do before December 2025.
  const { error: analyticsError } = await supabase.rpc("increment_daily_login");
  if (analyticsError) {
    console.warn("Login analytics update failed:", analyticsError.message);
  }

  if (user.role === "student") {
    const { data: profile, error } = await supabase
      .from("student_with_details")
      .select("id, username, first_name, emotional_status")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error || !profile) {
      await supabase.auth.signOut();
      throw new Error("We could not find your student profile.");
    }

    return {
      role: user.role,
      id: profile.id ?? "",
      userName: profile.username ?? "",
      firstName: profile.first_name ?? undefined,
      emotionalStatus: profile.emotional_status ?? "",
    };
  }

  const { data: profile, error } = await supabase
    .from(user.role)
    .select("id, username, first_name")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !profile) {
    await supabase.auth.signOut();
    throw new Error("We could not find your profile.");
  }

  return {
    role: user.role,
    id: profile.id,
    userName: profile.username,
    firstName: profile.first_name,
  };
}

/**
 * Sends a password reset mail pointing back at /auth/forget-password, where the
 * recovery session is picked up and the new password is set.
 */
export async function sendPasswordResetEmail(email: string): Promise<{
  error?: string;
  success?: string;
}> {
  const parsed = z.email().safeParse(email);

  if (!parsed.success) {
    return { error: "Please enter a valid email address." };
  }

  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://127.0.0.1:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: `${origin}/auth/forget-password`,
  });

  if (error) {
    return { error: error.message || "Failed to send the reset email." };
  }

  return { success: "Password reset email sent." };
}

export async function updatePassword(password: string): Promise<{
  error?: string;
  success?: string;
}> {
  const parsed = z.string().min(8).max(255).safeParse(password);

  if (!parsed.success) {
    return { error: "Password must be between 8 and 255 characters." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data });

  if (error) {
    return { error: error.message || "Password reset failed." };
  }

  return { success: "Password reset successfully." };
}
