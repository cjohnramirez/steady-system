"use server";

import z from "zod";
import { appointmentUpdateFormSchema } from "./schema";
import { Tables } from "@/types/supabase";
import { createClient } from "@/utils/supabase/server";

export async function updateAppointment(
  values: z.infer<typeof appointmentUpdateFormSchema>,
): Promise<Tables<"appointment"> | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("appointment")
    .update(values)
    .eq("id", values.id)
    .select("*")
    .single(); // please include this too!

  if (error) throw new Error(error.message);
  return data || null;
}

export async function fetchStudent(
  id: number,
): Promise<Tables<"student"> | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("student")
    .select("*")
    .eq("university_id", id)
    .single(); // please include this too!

  if (error) throw new Error(error.message);
  return data || null;
}