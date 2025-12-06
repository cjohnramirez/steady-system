"use server";

import { createClient } from "@/utils/supabase/server";
import { Tables } from "@/types/supabase";
import { z } from "zod";
import { adminPasswordFormSchema, adminProfileFormSchema } from "./schema";

export async function fetchAdminProfile(): Promise<Tables<"admin"> | null> {
  const supabase = await createClient();

  const { data: user } = await supabase.auth.getUser();

  if (!user?.user) return null;

  const { data, error } = await supabase
    .from("admin")
    .select("*")
    .eq("user_id", user.user.id)
    .single();

  if (error) throw new Error("Error fetching admin profile: ", error);
  return data ?? null;
}

export async function updateAdminProfile(
  values: z.infer<typeof adminProfileFormSchema>,
): Promise<Tables<"admin"> | null> {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("admin")
    .update(values)
    .eq("user_id", user?.user?.id ?? "")
    .select()
    .single();

  if (error) throw new Error("Error updating admin profile: ", error);
  return data;
}

export async function updateAdminPassword(
  values: z.infer<typeof adminPasswordFormSchema>,
): Promise<Tables<"admin"> | null> {
  const supabase = await createClient();

  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return null;

  const { error : passwordError } = await supabase.auth.updateUser({
    password: values.password,
  });

  if (passwordError) throw new Error("Error updating admin password: ", passwordError);

  const { data } = await supabase
    .from("admin")
    .select("*")
    .eq("user_id", user.user.id)
    .single();

  return data ?? null;
}

export async function updateAdminProfilePicture(): Promise<Tables<"admin"> | null> {
  return null;
}
