"use server";

import z from "zod";
import { Tables } from "@/types/supabase";
import { createClient } from "@/utils/supabase/server";
import { appointmentFormSchema } from "./schema";

export async function updateAppointment(
  values: z.infer<typeof appointmentFormSchema>,
): Promise<Tables<"appointment"> | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("appointment")
    .update(values)
    .eq("id", values.id)
    .select("*")
    .single(); 

  if (error) throw new Error(error.message);
  return data || null;
}

export async function fetchStudent(
  id: string,
): Promise<Tables<"student_with_details"> | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("student_with_details")
    .select("*")
    .eq("user_id", id)
    .single(); 

  if (error) throw new Error(error.message);
  return data || null;
}

export async function fetchAppointment(
  id: string,
): Promise<Tables<"appointment_with_details"> | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("appointment_with_details")
    .select("*")
    .eq("id", id)
    .single(); 

  if (error) throw new Error(error.message);
  return data || null;
}