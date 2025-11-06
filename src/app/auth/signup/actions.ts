"use server";

import { createClient } from "@/utils/supabase/server";
import { createServiceClient } from "@/utils/supabase/service";

export async function fetchDepartment(college: string) {
  const supabase = await createClient();

  if (college) {
    const { data, error } = await supabase
      .from("department")
      .select(`*`)
      .eq("college_id", college);

    if (error) throw error;
    return data || [];
  }
  return [];
}

export async function fetchCollege() {
  const supabase = await createClient();

  const { data, error } = await supabase.from("college").select(`*`);

  if (error) throw error;
  return data || [];
}

export default async function SignUpFormAction(
  formData: FormData,
): Promise<{ error?: string; success?: string }> {
  const supabase = await createClient(); // normal users
  const supabaseAdmin = await createServiceClient(); // superuser

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: formData.get("email")?.toString() || "",
    password: formData.get("password")?.toString() || "",
  });

  if (signUpError) {
    console.error("🧠 SIGNUP ERROR:", signUpError);
    return { error: "Sign up failed" };
  }

  if (!signUpData.user?.id) {
    console.error("❌ User ID missing after signup:", signUpData);
    return { error: "User ID not found" };
  }

  console.log("🧠 DEBUG INSERT user_roles", {
    user_id: signUpData.user.id,
    role: "student",
  });

  const userRole: { user_id: string; role: "student" | "admin" | "counselor" } =
    {
      user_id: signUpData.user?.id as string,
      role: "student",
    };

  const { error: updateRoleError } = await supabaseAdmin
    .from("user_roles")
    .insert([userRole]);

  if (updateRoleError) {
    console.error("❌ ROLE INSERT ERROR:", updateRoleError);
    return { error: `Failed to update user role: ${updateRoleError.message}` };
  }

  const year_level = Number(formData.get("year_level") || 1);
  const student_id = Number(formData.get("student_id") || 1);

  const { error: updateStudentError } = await supabaseAdmin
    .from("student")
    .insert({
      first_name: formData.get("first_name")?.toString() || "",
      last_name: formData.get("last_name")?.toString() || "",
      email: formData.get("email")?.toString() || "",
      username: formData.get("username")?.toString() || "",
      department_id: formData.get("department_id")?.toString() || "",
      year_level: year_level,
      student_id: student_id,
      user_id: signUpData.user.id,
    });

  if (updateStudentError) {
    console.log("❌ STUDENT INSERT ERROR:", {
      year_level,
      student_id,
      first_name: formData.get("first_name"),
      last_name: formData.get("last_name"),
      email: formData.get("email"),
      department_id: formData.get("department_id"),
    });
    return { error: `Failed to insert student: ${updateStudentError.message}` };
  }

  console.log("✅ SIGNUP SUCCESS for user:", signUpData.user.id);

  return { success: "Sign Up successful" };
}
