"use server";

import { createClient } from "@/utils/supabase/server";
import { createServiceClient } from "@/utils/supabase/service";

export default async function SignUpFormAction(
  formData: FormData,
): Promise<{ error?: string; success?: string }> {
  const supabase = await createClient();
  const supabaseAdmin = await createServiceClient();

  const { error: signUpError } = await supabase.auth.signUp({
    email: formData.get("email")?.toString() || "",
    password: formData.get("password")?.toString() || "",
  });

  if (signUpError) {
    return { error: "Internal server error" };
  }

  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user?.id) {
    return { error: "User ID not found" };
  }

  const { error: updateRoleError } = await supabaseAdmin
    .from("user_roles")
    .insert({
      user_id: userData.user.id,
      role: "student",
    });

  if (updateRoleError) {
    return { error: "Updating user role unsuccessful" };
  }

  const { error: updateStudentError } = await supabaseAdmin
    .from("student")
    .insert({
      first_name: formData.get("firstName")?.toString() || "",
      last_name: formData.get("lastName")?.toString() || "",
      email: formData.get("email")?.toString() || "",
      department_id: formData.get("department")?.toString() || null,
      year_level: Number(formData.get("year_level") || 0),
      student_id: Number(formData.get("studentId") || 0),
      user_id: userData.user.id,
    });

  if (updateStudentError) {
    return { error: "Internal server error" };
  }

  return { success: "Sign Up successful" };
}
