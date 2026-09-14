"use server";

import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import { requireRole, requireUser } from "@/lib/auth/session";
import { fail, ok, toErrorMessage, type Result } from "@/lib/result";
import {
  adminSelfUpdateSchema,
  changePasswordSchema,
} from "@/lib/validation/staff";
import {
  organizationContactsSchema,
  organizationSchema,
} from "@/lib/validation/organization";

async function guarded<T>(
  run: (userId: string) => Promise<Result<T>>,
): Promise<Result<T>> {
  try {
    const user = await requireRole("admin");
    return await run(user.id);
  } catch (error) {
    return fail(toErrorMessage(error));
  }
}

export async function updateOwnAdminProfile(
  input: z.input<typeof adminSelfUpdateSchema>,
): Promise<Result> {
  return guarded(async (userId) => {
    const parsed = adminSelfUpdateSchema.safeParse(input);
    if (!parsed.success) return fail(toErrorMessage(parsed.error));

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("admin")
      .update(parsed.data)
      .eq("user_id", userId)
      .select("id")
      .maybeSingle();

    if (error)
      return fail(toErrorMessage(error, "We couldn't save your profile."));
    if (!data) return fail("We couldn't find your profile.");
    return ok();
  });
}

/** Any signed-in user changing their own password while signed in. */
export async function changeOwnPassword(
  input: z.input<typeof changePasswordSchema>,
): Promise<Result> {
  try {
    await requireUser();
  } catch (error) {
    return fail(toErrorMessage(error));
  }

  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) return fail(toErrorMessage(parsed.error));

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    // With secure_password_change on, sessions older than a day must sign in again.
    if (/reauthentication/i.test(error.message)) {
      return fail(
        "For your security, log out and back in, then change your password.",
      );
    }
    if (/different from the old/i.test(error.message)) {
      return fail("Choose a password you haven't used here before.");
    }
    return fail(error.message);
  }
  return ok();
}

/**
 * Updates the single organization row. The old action ran an update without
 * select(), so a refused update (no admin role) reported success with nothing
 * saved.
 */
export async function updateOrganization(
  organizationId: string,
  input: z.input<typeof organizationSchema>,
): Promise<Result> {
  return guarded(async () => {
    if (!z.guid().safeParse(organizationId).success)
      return fail("Office details could not be found.");
    const parsed = organizationSchema.safeParse(input);
    if (!parsed.success) return fail(toErrorMessage(parsed.error));

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("organization")
      .update(parsed.data)
      .eq("id", organizationId)
      .select("id")
      .maybeSingle();

    if (error)
      return fail(
        toErrorMessage(error, "We couldn't save the office details."),
      );
    if (!data) return fail("Office details could not be found.");
    return ok();
  });
}

export async function saveOrganizationContacts(
  input: z.input<typeof organizationContactsSchema>,
): Promise<Result> {
  return guarded(async () => {
    const parsed = organizationContactsSchema.safeParse(input);
    if (!parsed.success) return fail(toErrorMessage(parsed.error));

    const supabase = await createClient();
    const { error: deleteError } = await supabase
      .from("organization_contact")
      .delete()
      .not("id", "is", null);
    if (deleteError) return fail(toErrorMessage(deleteError));

    if (parsed.data.length) {
      const { error } = await supabase
        .from("organization_contact")
        .insert(parsed.data);
      if (error) return fail(toErrorMessage(error));
    }
    return ok();
  });
}

/** Sends an in-app notification to everyone holding a role. */
export async function broadcastToRole(
  role: "student" | "counselor" | "admin",
  title: string,
  body: string,
  link?: string,
): Promise<Result<{ sent: number }>> {
  return guarded(async () => {
    const parsed = z
      .object({
        role: z.enum(["student", "counselor", "admin"]),
        title: z.string().trim().min(1).max(120),
        body: z.string().trim().max(500),
        link: z.string().startsWith("/").max(200).optional(),
      })
      .safeParse({ role, title, body, link });
    if (!parsed.success) return fail("Check the announcement details.");

    const supabase = await createClient();
    const { data, error } = await supabase.rpc("notify_role", {
      p_role: parsed.data.role,
      p_title: parsed.data.title,
      p_body: parsed.data.body,
      p_link: parsed.data.link,
    });
    if (error) return fail(toErrorMessage(error));
    return ok({ sent: data ?? 0 });
  });
}
