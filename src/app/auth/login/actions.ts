"use server";

import { roles } from "@/types/main";
import { createClient } from "@/utils/supabase/server";
import { createServiceClient } from "@/utils/supabase/service";
import { jwtDecode } from "jwt-decode";

interface JwtCustomPayload {
  user_role: roles;
  exp: number;
  iat: number;
  sub: string;
}

interface LoginData {
  email: string;
  password: string;
  role: roles;
}

export default async function LoginFormAction(data: LoginData): Promise<{
  data?: {
    userName: string;
    emotionalStatus?: string;
    id: string;
    firstName?: string;
    userId: string;
  };
  status_code?: number;
}> {
  let emotionalStatus: string | undefined;

  const supabase = await createClient();
  const supabaseAdmin = await createServiceClient();

  const { data: userData, error: signInError } =
    await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

  if (signInError) {
    return { status_code: 401 };
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    const jwt = jwtDecode<JwtCustomPayload>(session.access_token);
    if (jwt.user_role !== data.role) {
      supabase.auth.signOut();
      return { status_code: 403 };
    }
  }

  if (!userData.user) {
    return { status_code: 400 };
  }

  if (data.role === "student") {
    const { data: studentProfileData, error: studentProfileError } =
      await supabaseAdmin
        .from("student_with_details")
        .select("*")
        .eq("user_id", userData.user!.id)
        .single();

    if (!studentProfileError && studentProfileData) {
      emotionalStatus = studentProfileData.emotional_status ?? "";
    }

    const { error: analyticsError } = await supabaseAdmin.rpc(
      "increment_daily_login",
    );

    if (analyticsError) {
      return { status_code: 500 };
    }

    return {
      data: {
        userName: studentProfileData?.username ?? "test",
        emotionalStatus,
        id: studentProfileData?.id ?? "",
        userId: session?.user.id ?? ""
      },
    };
  } else {
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from(`${data.role}`)
      .select("*")
      .eq("user_id", userData.user!.id)
      .single();

    if (profileError) {
      return { status_code: 400 };
    }

    const { error: analyticsError } = await supabaseAdmin.rpc(
      "increment_daily_login",
    );

    if (analyticsError) {
      return { status_code: 500 };
    }

    return {
      data: {
        firstName: profileData.first_name,
        userName: profileData.username,
        id: profileData.id,
        userId: session?.user.id ?? ""
      }
    };
  }
}

export async function sendResetPasswordEmail(email: string): Promise<{
  error?: string;
  success?: string;
}> {
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email);

  if (error)
    return {
      error: `Password reset email was not sent. Please check if your email exists`,
    };

  return { success: "Password reset email sent successfully." };
}

export async function updatePassword(password: string): Promise<{
  error?: string;
  success?: string;
}> {
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) return { error: "Password reset failed" };

  return { success: "Password reset successfully" };
}

export async function sendPasswordResetEmail(email: string): Promise<{
  error?: string;
  success?: string;
}> {
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/forget-password`,
  });

  if (error) {
    return { error: error.message || "Failed to send reset email" };
  }

  return { success: "Password reset email sent successfully" };
}
