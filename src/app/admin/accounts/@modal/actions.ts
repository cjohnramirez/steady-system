"use server";

import { createClient } from "@/utils/supabase/server";
import z from "zod";
import { Tables } from "@/types/supabase";
import { counselorFormSchema, studentUpdateFormSchema } from "./schema";

export async function updateStudentProfile(
  values: z.infer<typeof studentUpdateFormSchema>,
): Promise<Tables<"student"> | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("student")
    .update(values)
    .eq("id", values.id)
    .select("*")
    .single(); // please include this too!

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
