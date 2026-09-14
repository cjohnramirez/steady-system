import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { EmptyState } from "@/components/app/empty-state";
import OrganizationForm from "./organization-form";
import ContactsForm from "./contacts-form";

export const metadata: Metadata = { title: "Office details" };

export default async function SystemSettingsPage() {
  const supabase = await createClient();
  const [{ data: organization }, { data: contacts }] = await Promise.all([
    supabase.from("organization").select("*").limit(1).maybeSingle(),
    supabase
      .from("organization_contact")
      .select("platform, contact_detail")
      .order("platform"),
  ]);

  if (!organization) {
    return (
      <EmptyState
        title="No office record"
        description="Run the database seed to create one."
      />
    );
  }

  return (
    <>
      <OrganizationForm organization={organization} />
      <ContactsForm contacts={contacts ?? []} />
    </>
  );
}
