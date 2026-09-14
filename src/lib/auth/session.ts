import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { roles } from "@/types/main";
import { isRole, ROLE_HOME, ROLE_LOGIN } from "./roles";
import { AuthorizationError } from "./errors";
import { getViewer } from "./get-viewer";
import type { Viewer } from "./viewer";

export type SessionUser = {
  id: string;
  email: string | null;
  role: roles | null;
};

export { AuthorizationError } from "./errors";

/**
 * The verified caller, or null if there is no session.
 *
 * Identity comes from `auth.getUser()`, which checks the token against the auth
 * server rather than trusting the cookie. The role is read from the `user_role`
 * claim when the access token hook has supplied one, and falls back to the
 * `user_roles` table otherwise. The fallback matters because a misconfigured hook
 * is exactly how this application broke before: the claim silently went missing and
 * every signed-in user was treated as having no role at all.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  const claimed = await roleFromClaim(supabase);
  if (claimed) {
    return { id: user.id, email: user.email ?? null, role: claimed };
  }

  // Row-level security limits this to the caller's own row, so it is safe to run
  // with the caller's client rather than the service key.
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: user.email ?? null,
    role: isRole(data?.role) ? data.role : null,
  };
}

async function roleFromClaim(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<roles | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) return null;

  const payload = decodeJwtPayload(session.access_token);
  const claim = payload?.["user_role"];

  return isRole(claim) ? claim : null;
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const segment = token.split(".")[1];
  if (!segment) return null;

  try {
    const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
    const json = Buffer.from(normalized, "base64").toString("utf8");
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** The verified caller. Throws if nobody is signed in. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();

  if (!user) {
    throw new AuthorizationError("You must be signed in to do that.", 401);
  }

  return user;
}

/**
 * The verified caller, guaranteed to hold one of the given roles.
 *
 * Every server action that touches the service-role key must call this first. The
 * service key bypasses row-level security completely, so without a check here a
 * server action is an open endpoint no matter which page links to it.
 */
export async function requireRole(...allowed: roles[]): Promise<SessionUser> {
  const user = await requireUser();

  if (!user.role || !allowed.includes(user.role)) {
    throw new AuthorizationError("You do not have permission to do that.", 403);
  }

  return user;
}

/**
 * Layout equivalent of `requireRole`: redirects rather than throwing, and returns
 * the full viewer so the layout can hand it to client components.
 *
 * It duplicates what the proxy already enforces on purpose, so that a matcher
 * change or a proxy bug cannot silently expose a whole area.
 */
export async function guardPage(...allowed: roles[]): Promise<Viewer> {
  const viewer = await getViewer();

  if (!viewer) {
    const user = await getSessionUser();
    if (!user) redirect(ROLE_LOGIN[allowed[0] ?? "student"]);
    // Signed in, but with no role or no profile row to go with it.
    redirect(user.role ? "/error?reason=no-profile" : "/error?reason=no-role");
  }

  if (!allowed.includes(viewer.role)) redirect(ROLE_HOME[viewer.role]);

  return viewer;
}

/** How long a reset link's session may be used to set a new password. */
const RECOVERY_WINDOW_SECONDS = 60 * 60;

/**
 * True when the current session was opened by a password-reset link in the last
 * hour. Without this check, anyone holding an ordinary session (say, on a shared
 * computer) could set a new password without knowing the current one.
 */
export async function isRecoverySession(): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const amr = (data?.claims?.amr ?? []) as {
    method: string;
    timestamp: number;
  }[];
  const now = Math.floor(Date.now() / 1000);

  return amr.some(
    (entry) =>
      entry.method === "recovery" &&
      now - entry.timestamp < RECOVERY_WINDOW_SECONDS,
  );
}
