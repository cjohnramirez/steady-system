import type { DB } from "@/lib/db/types";
import type { roles } from "@/types/main";
import { isRole } from "./roles";

/**
 * Who is signed in, with the profile fields the shell renders.
 *
 * This used to live in a persisted zustand store that only the login form filled.
 * Anyone who reached a page any other way (a fresh signup, a password reset, a
 * cleared browser) had a valid session and an empty store, so the navigation showed
 * "Login" and every query ran with an empty id. It is now read from the session on
 * the server by each layout and handed down, so it cannot disagree with the cookie.
 */
export type Viewer = {
  userId: string;
  email: string | null;
  role: roles;
  /** The id of the student, counselor or admin row, not the auth user. */
  profileId: string;
  userName: string;
  firstName: string;
  lastName: string;
  avatar: string;
  /** Student only. The mood name used to curate portal content. */
  emotionalStatus: string | null;
};

/**
 * Loads the viewer for whichever client is passed: the server client in layouts,
 * the browser client anywhere that needs to re-read after a change.
 */
export async function fetchViewer(supabase: DB): Promise<Viewer | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: roleRow } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  const role = roleRow?.role;
  if (!isRole(role)) return null;

  const base = { userId: user.id, email: user.email ?? null, role };

  if (role === "student") {
    const { data } = await supabase
      .from("student")
      .select(
        "id, username, first_name, last_name, avatar, emotional_status(name)",
      )
      .eq("user_id", user.id)
      .maybeSingle();

    if (!data) return null;

    return {
      ...base,
      profileId: data.id,
      userName: data.username,
      firstName: data.first_name,
      lastName: data.last_name,
      avatar: data.avatar,
      emotionalStatus: data.emotional_status?.name ?? null,
    };
  }

  const { data } = await supabase
    .from(role)
    .select("id, username, first_name, last_name, avatar")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) return null;

  return {
    ...base,
    profileId: data.id,
    userName: data.username,
    firstName: data.first_name,
    lastName: data.last_name,
    avatar: data.avatar,
    emotionalStatus: null,
  };
}
