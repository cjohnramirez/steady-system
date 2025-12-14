"use server";

import { createClient } from "@/utils/supabase/server";
import { Tables, TablesUpdate } from "@/types/supabase";

export async function fetchContactPerson(id: string) {
  const supabase = await createClient()
}

export async function fetchStudent(
  id: string,
): Promise<Tables<"student_with_details"> | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("student_with_details")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data || null;
}

export async function fetchCounselor(
  id: string,
): Promise<Tables<"counselor_with_details"> | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("counselor_with_details")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(`Error fetching counselor: ${error.message}`);
  return data || null;
}

export async function fetchEmotionalStatus(): Promise<
  Tables<"emotional_status">[] | null
> {
  const supabase = await createClient();

  const { data, error } = await supabase.from("emotional_status").select("*");

  if (error) throw new Error(`Error fetching emotional status: ${error.message}`);
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
    .eq("id", studentId)
    .select("*")
    .single();

  if (error)
    throw new Error(`Error updating student emotional status: ${error.message}`);
  return data || null;
}

export async function updateStudentProfile(values: TablesUpdate<"student">) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("student")
    .update(values)
    .eq("id", values.id ?? "")
    .select("*")
    .single();

  if (error) throw new Error(`Error updating student profile: ${error.message}`);
}

export async function updateCounselorProfile(
  values: TablesUpdate<"counselor">,
): Promise<Tables<"counselor"> | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("counselor")
    .update(values)
    .eq("id", values?.id ?? "")
    .select("*")
    .single();

  if (error) throw new Error(`Error updating counselor profile: ${error.message}`);
  return data || null;
}
