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
  };
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
    throw new Error(signInError.message);
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Skip strict role validation for now - just proceed with login
  // if (session) {
  //   const jwt = jwtDecode<JwtCustomPayload>(session.access_token);
  //   let userRole = jwt.user_role;
  //   
  //   if (!userRole) {
  //     try {
  //       const { data: roleData, error: roleError } = await supabaseAdmin
  //         .from("user_roles")
  //         .select("role")
  //         .eq("user_id", userData.user!.id)
  //         .single();
  //       
  //       if (!roleError && roleData) {
  //         userRole = roleData.role;
  //       }
  //     } catch (err) {
  //       // Silently fail role validation
  //     }
  //   }
  // }

  if (!userData.user) {
    throw new Error("User data not available");
  }

  if (data.role === "student") {
    try {
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

      // Don't throw on analytics error - it shouldn't block login
      if (analyticsError) {
        console.warn("Analytics update failed:", analyticsError);
      }

      return {
        data: {
          userName: studentProfileData?.username ?? "test",
          emotionalStatus,
          id: studentProfileData?.id ?? "",
        },
      };
    } catch (err) {
      console.error("Student profile fetch error:", err);
      // Return minimal data on error
      return {
        data: {
          userName: "student",
          emotionalStatus: "",
          id: userData.user.id,
        },
      };
    }
  } else {
    try {
      const { data: profileData, error: profileError } = await supabaseAdmin
        .from(`${data.role}`)
        .select("*")
        .eq("user_id", userData.user!.id)
        .single();

      if (profileError) {
        console.error("Profile fetch error:", profileError);
        // Return minimal data on error
        return {
          data: {
            firstName: "",
            userName: data.role,
            id: userData.user.id,
          },
        };
      }

      const { error: analyticsError } = await supabaseAdmin.rpc(
        "increment_daily_login",
      );

      // Don't throw on analytics error - it shouldn't block login
      if (analyticsError) {
        console.warn("Analytics update failed:", analyticsError);
      }

      return {
        data: {
          firstName: profileData.first_name,
          userName: profileData.username,
          id: profileData.id,
        },
      };
    } catch (err) {
      console.error("Non-student profile fetch error:", err);
      // Return minimal data on error
      return {
        data: {
          firstName: "",
          userName: data.role,
          id: userData.user.id,
        },
      };
    }
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
