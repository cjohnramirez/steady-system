"use server";

import { Tables } from "@/types/supabase";
import { createClient } from "@/utils/supabase/server";
import z from "zod";
import { organizationInfoFormSchema } from "./schema";

export async function fetchOrganizationInfo(): Promise<Tables<"organization"> | null> {
  const supabase = await createClient();

  const { data, error } = await supabase.from("organization").select("*");

  if (error) throw new Error(error.message);

  return data && data[0] ? data[0] : null;
}

export async function updateOrganizationInfo(
  values: z.infer<typeof organizationInfoFormSchema>,
): Promise<Tables<"organization"> | null> {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) throw new Error("Unauthorized");

  const orgInfo = await fetchOrganizationInfo();

  if (!orgInfo) {
    throw new Error("Organization not fetched");
  }

  const { data, error } = await supabase
    .from("organization")
    .update(values)
    .eq("id", orgInfo?.id ?? "");

  if (error) throw new Error(error.message);
  return data?.[0] ?? null;
}

export async function fetchOrganizationContact(): Promise<
  Tables<"organization_contact">[] | null
> {
  const supabase = await createClient();

  const { data } = await supabase.from("organization_contact").select("*");

  return data ?? null;
}

export async function updateOrganizationContact(
  values: Partial<Tables<"organization_contact">>[],
): Promise<Tables<"organization_contact"> | null> {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) throw new Error("Unauthorized");

  await Promise.all(
    values.map(async (value) => {
      const { data, error } = await supabase
        .from("organization_contact")
        .update(value)
        .select();

      if (error) throw new Error(error.message);
      return data?.[0] ?? null;
    }),
  );

  return null;
}
