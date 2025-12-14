"use server"
import { TablesInsert } from "@/types/supabase";
import { createClient } from "@/utils/supabase/server";
import { createServiceClient } from "@/utils/supabase/service";
import { error } from "console";

export default async function insertCounselor(
  values: TablesInsert<"counselor"> & { password: string },
) {
  const supabase = await createClient();
  const supabaseAdmin = await createServiceClient();

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
  });

  if (signUpError) {
    throw new Error(`Sign Up Error: ${signUpError.message}`)
  }

  if (!signUpData.user?.id) {
    throw new Error("User ID not found")
  }

  const userRole: { user_id: string; role: "student" | "admin" | "counselor" } =
    {
      user_id: signUpData.user?.id as string,
      role: "counselor",
    };

  const { error: updateRoleError } = await supabaseAdmin
    .from("user_roles")
    .insert([userRole]);

  if (updateRoleError) {
    throw new Error(`Failed to update user role: ${updateRoleError.message}`)
  }

  const { password, ...rest } = values

  const { error: updateCounselorError } = await supabaseAdmin
    .from("counselor")
    .insert([{ ...rest, user_id: signUpData.user.id }]);

  if (updateCounselorError) {
    throw new Error(`Failed to insert counselor: ${updateCounselorError.message}`)
  }

  return { success: "Sign Up successful" };
} 
