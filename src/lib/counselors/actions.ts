"use server";

import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import { createServiceClient } from "@/utils/supabase/service";
import { requireRole } from "@/lib/auth/session";
import { fail, ok, toErrorMessage, type Result } from "@/lib/result";
import {
  adminCounselorUpdateSchema,
  availabilitySchema,
  counselorCreateSchema,
  staffSelfUpdateSchema,
} from "@/lib/validation/staff";

async function guarded<T>(
  roles: Parameters<typeof requireRole>,
  run: (userId: string) => Promise<Result<T>>,
): Promise<Result<T>> {
  try {
    const user = await requireRole(...roles);
    return await run(user.id);
  } catch (error) {
    return fail(toErrorMessage(error));
  }
}

/** A counselor edits their own name, username and phone. Keyed on the session. */
export async function updateOwnCounselorProfile(
  input: z.input<typeof staffSelfUpdateSchema>,
): Promise<Result> {
  return guarded(["counselor"], async (userId) => {
    const parsed = staffSelfUpdateSchema.safeParse(input);
    if (!parsed.success) return fail(toErrorMessage(parsed.error));

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("counselor")
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

export async function updateOwnAvailability(
  input: z.input<typeof availabilitySchema>,
): Promise<Result> {
  return guarded(["counselor"], async (userId) => {
    const parsed = availabilitySchema.safeParse(input);
    if (!parsed.success) return fail(toErrorMessage(parsed.error));

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("counselor")
      .update(parsed.data)
      .eq("user_id", userId)
      .select("id")
      .maybeSingle();

    if (error)
      return fail(toErrorMessage(error, "We couldn't save your availability."));
    if (!data) return fail("We couldn't find your profile.");
    return ok();
  });
}

/**
 * Creates a counselor account: auth user, role and profile.
 *
 * `auth.admin.createUser` on the service client, not `signUp` on the cookie
 * client, which used to sign the admin out and in as the new counselor. Each later
 * step deletes the auth user on failure so no half-made account is left behind.
 */
export async function createCounselor(
  input: z.input<typeof counselorCreateSchema>,
): Promise<Result<{ id: string }>> {
  return guarded(["admin"], async () => {
    const parsed = counselorCreateSchema.safeParse(input);
    if (!parsed.success) return fail(toErrorMessage(parsed.error));

    const { password, ...profile } = parsed.data;
    const admin = createServiceClient();

    const { data: available } = await admin.rpc("is_username_available", {
      p_username: profile.username,
    });
    if (available === false) return fail("That username is already taken.");

    const { data: created, error: createError } =
      await admin.auth.admin.createUser({
        email: profile.email,
        password,
        email_confirm: true,
      });

    if (createError || !created.user) {
      return fail(
        /already been registered|already exists/i.test(
          createError?.message ?? "",
        )
          ? "An account with that email already exists."
          : `We couldn't create the account: ${createError?.message ?? "unknown error"}`,
      );
    }

    const userId = created.user.id;
    const { error: roleError } = await admin
      .from("user_roles")
      .insert({ user_id: userId, role: "counselor" });

    if (roleError) {
      await admin.auth.admin.deleteUser(userId);
      return fail(
        toErrorMessage(roleError, "We couldn't assign the counselor role."),
      );
    }

    const { data: row, error: profileError } = await admin
      .from("counselor")
      .insert({ ...profile, user_id: userId })
      .select("id")
      .single();

    if (profileError) {
      await admin.auth.admin.deleteUser(userId);
      return fail(
        toErrorMessage(
          profileError,
          "We couldn't create the counselor profile.",
        ),
      );
    }

    return ok({ id: row.id });
  });
}

export async function adminUpdateCounselor(
  counselorId: string,
  input: z.input<typeof adminCounselorUpdateSchema>,
): Promise<Result> {
  return guarded(["admin"], async () => {
    if (!z.guid().safeParse(counselorId).success)
      return fail("That counselor could not be found.");
    const parsed = adminCounselorUpdateSchema.safeParse(input);
    if (!parsed.success) return fail(toErrorMessage(parsed.error));

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("counselor")
      .update(parsed.data)
      .eq("id", counselorId)
      .select("id")
      .maybeSingle();

    if (error)
      return fail(toErrorMessage(error, "We couldn't save the counselor."));
    if (!data) return fail("That counselor could not be found.");
    return ok();
  });
}

/**
 * Sets exactly which departments a counselor covers: assigns the chosen ones and
 * releases any others they held.
 */
export async function setCounselorDepartments(
  counselorId: string,
  departmentIds: string[],
): Promise<Result> {
  return guarded(["admin"], async () => {
    const parsed = z
      .object({
        counselorId: z.guid(),
        departmentIds: z.array(z.guid()).max(50),
      })
      .safeParse({ counselorId, departmentIds });
    if (!parsed.success) return fail("Choose valid departments.");

    const supabase = await createClient();

    let release = supabase
      .from("department")
      .update({ counselor_id: null })
      .eq("counselor_id", counselorId);
    if (departmentIds.length) {
      release = release.not("id", "in", `(${departmentIds.join(",")})`);
    }
    const { error: releaseError } = await release;
    if (releaseError) return fail(toErrorMessage(releaseError));

    if (departmentIds.length) {
      const { error } = await supabase
        .from("department")
        .update({ counselor_id: counselorId })
        .in("id", departmentIds);
      if (error) return fail(toErrorMessage(error));
    }

    return ok();
  });
}
