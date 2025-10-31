"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient, createServiceClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(formData: FormData) {
  const supabaseService = await createServiceClient();
  const supabase = await createClient();

  const formDataObj = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { data : userData, error: signUpError } = await supabase.auth.signUp(formDataObj);

  if (signUpError) {
    console.log("Signup Error: ", signUpError.message);
    redirect("/error");
  }

  const userRole: { user_id: string; role: "student" | "admin" | "counselor" } = {
    user_id: userData.user?.id as string,
    role: "admin",
  };

  const { error: roleError } = await supabaseService
    .from("user_roles")
    .insert([userRole]);

  if (roleError) {
    console.log("Role Error: ", roleError.message);
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/");
}
