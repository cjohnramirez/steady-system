"use server";

import { roles } from "@/types/main";
import { createClient } from "@/utils/supabase/server";
import { createServiceClient } from "@/utils/supabase/service";
import { error } from "console";
import { jwtDecode } from "jwt-decode";

interface JwtCustomPayload {
  user_role: roles;
  exp: number;
  iat: number;
  sub: string;
}

export default async function LoginFormAction(
  formData: FormData,
  role: roles,
): Promise<{
  error?: string;
  success?: string;
  data?: { userName: string; emotionalStatus?: string; id: string };
}> {
  let emotionalStatus: string | undefined;

  const supabase = await createClient();
  const supabaseAdmin = await createServiceClient();

  const { data: userData, error: signInError } =
    await supabase.auth.signInWithPassword({
      email: formData.get("email")?.toString() || "",
      password: formData.get("password")?.toString() || "",
    });

  if (signInError) {
    return { error: signInError.message };
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    const jwt = jwtDecode<JwtCustomPayload>(session.access_token);
    if (jwt.user_role !== role) {
      supabase.auth.signOut();
      return { error: "Unauthorized access for this role" };
    }
  }

  if (!userData.user) {
    return { error: "User data not available" };
  }

  console.log(role)

  if (role === "student") {
    const { data: studentProfileData, error: studentProfileError } =
      await supabaseAdmin
        .from("student_with_details")
        .select("*")
        .eq("id", userData.user!.id)
        .single();

    if (!studentProfileError && studentProfileData) {
      emotionalStatus = studentProfileData.emotional_status ?? "";
    }

    const { error: analyticsError } = await supabaseAdmin.rpc(
      "increment_daily_login",
    );

    if (analyticsError) {
      return { error: `Failed to update analytics: ${analyticsError.message}` };
    }

    return {
      success: "Authentication Successful",
      data: {
        userName: studentProfileData?.username ?? "",
        emotionalStatus,
        id: userData.user.id,
      },
    };
  } else {
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from(`${role}`)
      .select("*")
      .eq("user_id", userData.user!.id)
      .single();

    if (profileError) {
      return { error: "Failed to retrieve profile data" };
    }

    const { error: analyticsError } = await supabaseAdmin.rpc(
      "increment_daily_login",
    );

    if (analyticsError) {
      return { error: `Failed to update analytics: ${analyticsError.message}` };
    }

    return {
      success: "Authentication Successful",
      data: {
        userName: profileData.username,
        id: userData.user.id,
      },
    };
  }
}
