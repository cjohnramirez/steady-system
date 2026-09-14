"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import { requireRole } from "@/lib/auth/session";
import type { TablesInsert, TablesUpdate } from "@/types/supabase";
import { fail, ok, toErrorMessage, type Result } from "@/lib/result";
import {
  announcementSchema,
  articleSchema,
  playlistSchema,
  type AnnouncementInput,
  type ArticleInput,
  type PlaylistInput,
} from "@/lib/validation/content";

type Table = "announcement" | "article" | "playlist";

async function admin<T>(run: () => Promise<Result<T>>): Promise<Result<T>> {
  try {
    await requireRole("admin");
    return await run();
  } catch (error) {
    return fail(toErrorMessage(error));
  }
}

/** The public pages render content on the server, so they are refreshed on change. */
function refreshPublicPages() {
  revalidatePath("/home");
  revalidatePath("/portal");
}

async function save(
  table: Table,
  id: string | null,
  values: Record<string, unknown>,
): Promise<Result<{ id: string }>> {
  const supabase = await createClient();
  // The three tables share the id column and differ only in the validated values,
  // so one code path is typed against one of them.
  const from = supabase.from(table as "article");
  const { data, error } = id
    ? await from
        .update(values as TablesUpdate<"article">)
        .eq("id", id)
        .select("id")
        .maybeSingle()
    : await from
        .insert(values as TablesInsert<"article">)
        .select("id")
        .single();
  if (error) return fail(toErrorMessage(error, "We couldn't save that."));
  if (!data) return fail("That item could not be found.");

  refreshPublicPages();
  return ok({ id: data.id });
}

const idOrNull = z.guid().nullable();

export async function saveAnnouncement(
  id: string | null,
  input: AnnouncementInput,
) {
  return admin(async () => {
    if (!idOrNull.safeParse(id).success)
      return fail("That announcement could not be found.");
    const parsed = announcementSchema.safeParse(input);
    if (!parsed.success) return fail(toErrorMessage(parsed.error));
    return save("announcement", id, parsed.data);
  });
}

export async function saveArticle(id: string | null, input: ArticleInput) {
  return admin(async () => {
    if (!idOrNull.safeParse(id).success)
      return fail("That article could not be found.");
    const parsed = articleSchema.safeParse(input);
    if (!parsed.success) return fail(toErrorMessage(parsed.error));
    return save("article", id, parsed.data);
  });
}

export async function savePlaylist(id: string | null, input: PlaylistInput) {
  return admin(async () => {
    if (!idOrNull.safeParse(id).success)
      return fail("That playlist could not be found.");
    const parsed = playlistSchema.safeParse(input);
    if (!parsed.success) return fail(toErrorMessage(parsed.error));
    return save("playlist", id, parsed.data);
  });
}

export async function deleteContent(table: Table, id: string): Promise<Result> {
  return admin(async () => {
    if (
      !z.enum(["announcement", "article", "playlist"]).safeParse(table).success
    )
      return fail("Unknown content.");
    if (!z.guid().safeParse(id).success)
      return fail("That item could not be found.");

    const supabase = await createClient();
    const { data, error } = await supabase
      .from(table)
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (error) return fail(toErrorMessage(error));
    if (!data) return fail("That item could not be found.");

    refreshPublicPages();
    return ok();
  });
}
