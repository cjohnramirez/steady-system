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
  data?: { userName: string };
}> {
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
      return { error: "Unauthorized access for this role" };
    }
  }

  if (!userData.user) {
    return { error: "User data not available" };
  }

  

  const { data: profileData, error: profileError } = await supabaseAdmin
    .from(`${role}`)
    .select("*")
    .eq("user_id", userData.user!.id)
    .single();

  if (profileError) {
    console.log(userData.user.id)
    return { error: "Failed to retrieve profile data" };
  }

  return {
    success: "Authentication Successful",
    data: { userName: profileData.username },
  };
}
