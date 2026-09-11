"use server";

import { createClient } from "@/utils/supabase/server";
import { createServiceClient } from "@/utils/supabase/service";
import z from "zod";
import { studentInsertFormSchema } from "./schema";
import { DbError } from "@/lib/db/error";

export async function fetchDepartment(college: string) {
  const supabase = await createClient();

  if (college) {
    const { data, error } = await supabase
      .from("department")
      .select(`*`)
      .eq("college_id", college);

    if (error) throw new DbError("Error fetching department", error);
    return data || [];
  }
  return [];
}

export async function fetchCollege() {
  const supabase = await createClient();

  const { data, error } = await supabase.from("college").select(`*`);

  if (error) throw new DbError("Error fetching college", error);
  return data || [];
}

export default async function SignUpFormAction(
  values: z.infer<typeof studentInsertFormSchema>,
): Promise<{ error?: string; success?: string }> {
  const supabase = await createClient(); 
  const supabaseAdmin = await createServiceClient(); 

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
  });

  if (signUpError) {
    return { error: "Sign up failed" };
  }

  if (!signUpData.user?.id) {
    return { error: "User ID not found" };
  }

  const userRole: { user_id: string; role: "student" | "admin" | "counselor" } =
    {
      user_id: signUpData.user?.id as string,
      role: "student",
    };

  const { error: updateRoleError } = await supabaseAdmin
    .from("user_roles")
    .insert([userRole]);

  if (updateRoleError) {
    return { error: `Failed to update user role: ${updateRoleError.message}` };
  }

  const { college, password, contact_person, ...otherValues} = values;

  const { data: studentData, error: updateStudentError } = await supabaseAdmin
    .from("student")
    .insert({
      ...otherValues,
      year_level: Number(values.year_level),
      university_id: Number(values.university_id),
      user_id: signUpData.user.id,
      phone: String(values.phone)
    })
    .select();

  if (updateStudentError) {
    return { error: `Failed to insert student: ${updateStudentError.message}` };
  }

  if (!studentData?.[0]?.id) {
    return { error: "Student ID not found" };
  }

  const contactPersonData = contact_person.map(contact => ({
    ...contact,
    student_id: studentData[0].id,
    phone: Number(contact.phone)
  }));

  const { error: insertContactPerson } = await supabaseAdmin
    .from("contact_person")
    .insert(contactPersonData);

  if (insertContactPerson) {
    return { error: `Failed to insert contact person: ${insertContactPerson.message}` };
  }

  return { success: "Sign Up successful" };
}
