"use server";

import { createClient } from "@/utils/supabase/server";
import z from "zod";
import { Tables } from "@/types/supabase";
import { counselorFormSchema, studentUpdateFormSchema } from "./schema";

export async function fetchCounselor(
  id: string,
): Promise<Tables<"counselor_with_details"> | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("counselor_with_details")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data || null;
}

export async function fetchEmotionalStatus(): Promise<
  Tables<"emotional_status">[] | null
> {
  const supabase = await createClient();

  const { data, error } = await supabase.from("emotional_status").select("*");

  if (error) throw new Error(error.message);
  return data || null;
}

export async function updateStudentProfile(
  values: z.infer<typeof studentUpdateFormSchema>,
): Promise<Tables<"student"> | null> {
  const supabase = await createClient();

  const { college_id, ...rest } = values;

  const { data, error } = await supabase
    .from("student")
    .update(rest)
    .eq("user_id", values.id)
    .select("*")
    .maybeSingle();

    console.log(data)

  if (error) throw new Error(error.message);
  return data || null;
}

export async function updateCounselorProfile(
  values: z.infer<typeof counselorFormSchema>,
): Promise<Tables<"counselor"> | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("counselor")
    .update(values)
    .eq("id", values.id)
    .select("*")
    .single(); // please include this too!

  if (error) throw new Error(error.message);
  return data || null;
}
