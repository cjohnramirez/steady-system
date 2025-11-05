import { roles } from "@/types/main";
import { createClient } from "@/utils/supabase/client";
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
): Promise<{ error?: string; success?: string }> {
  const supabase = createClient();

  const { error: signInError } = await supabase.auth.signInWithPassword({
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

  return { success: `Authentication Successful`};
}
