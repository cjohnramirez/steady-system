"use server";

import { createClient } from "@/utils/supabase/server";
import { createServiceClient } from "@/utils/supabase/service";
import z from "zod";
import { studentSignUpFormSchema } from "./schema";

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
  values: z.infer<typeof studentSignUpFormSchema>,
): Promise<{ error?: string; success?: string }> {
  const supabase = await createClient(); 
  const supabaseAdmin = await createServiceClient(); 

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
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

  const { college, ...otherValues} = values;

  const { error: updateStudentError } = await supabaseAdmin
    .from("student")
    .insert({
      ...otherValues,
      year_level: Number(values.year_level),
      university_id: Number(values.university_id),
      user_id: signUpData.user.id,
    });

  if (updateStudentError) {
    console.log("❌ STUDENT INSERT ERROR");
    return { error: `Failed to insert student: ${updateStudentError.message}` };
  }

  console.log("✅ SIGNUP SUCCESS for user:", signUpData.user.id);

  return { success: "Sign Up successful" };
}
