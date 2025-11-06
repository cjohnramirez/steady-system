"use server";

import { createClient } from "@/utils/supabase/server";
import { Tables } from "@/types/supabase";
import { z } from "zod";
import { adminProfileFormSchema } from "./schema";

export async function getAdminProfile(): Promise<Tables<"admin"> | null> {
  const supabase = await createClient();

  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return null;

  const { data } = await supabase
    .from("admin")
    .select("*")
    .eq("user_id", user.user.id)
    .single();

  return data ?? null;
}

export async function updateAdminProfile(
  values: z.infer<typeof adminProfileFormSchema>
): Promise<Tables<"admin"> | null> {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("admin")
    .update(values)
    .eq("user_id", user.user.id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getPassword(): Promise<Tables<"admin"> | null> {
  const supabase = await createClient();

  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return null;

  const { data } = await supabase
    .from("admin")
    .select("*")
    .eq("user_id", user.user.id)
    .single();

  return data ?? null;
}