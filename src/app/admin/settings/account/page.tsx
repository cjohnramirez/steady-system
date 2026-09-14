import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { guardPage } from "@/lib/auth/session";
import ProfileForm from "./profile-form";
import PasswordForm from "./password-form";

export const metadata: Metadata = { title: "Account settings | GCS Admin" };

export default async function AccountSettingsPage() {
  const viewer = await guardPage("admin");
  const supabase = await createClient();
  const { data: admin } = await supabase
    .from("admin")
    .select("first_name, last_name, username, phone, university_id, email")
    .eq("id", viewer.profileId)
    .single();

  return (
    <>
      {admin && <ProfileForm admin={admin} />}
      <PasswordForm />
    </>
  );
}
