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

  if (error) throw new Error("Error fetching counselor: ", error);
  return data || null;
}

export async function fetchEmotionalStatus(): Promise<
  Tables<"emotional_status">[] | null
> {
  const supabase = await createClient();

  const { data, error } = await supabase.from("emotional_status").select("*");

  if (error) throw new Error("Error fetching emotional status: ", error);
  return data || null;
}

export async function updateStudentEmotionalStatus(
  studentId: string,
  emotionalStatusId: string,
): Promise<Tables<"student"> | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("student")
    .update({ emotional_status_id: emotionalStatusId })
    .eq("user_id", studentId)
    .select("*")
    .single();

  if (error) throw new Error("Error updating student emotional status: ", error);
  return data || null;
}

export async function updateStudentProfile(
  values: z.infer<typeof studentUpdateFormSchema>,
) {
  const supabase = await createClient();

  const { college_id, ...rest } = values;

  const { error } = await supabase
    .from("student")
    .update(rest)
    .eq("user_id", values.id)
    .select("*");

  if (error) throw new Error("Error updating student profile: ", error);
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
    .single(); 

  if (error) throw new Error("Error updating counselor profile: ", error);
  return data || null;
}
