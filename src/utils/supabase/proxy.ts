import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { Database } from "@/types/supabase";
import { roles } from "@/types/main";
import { clientEnv } from "@/lib/env/client";
import {
  ROLE_HOME,
  ROLE_LOGIN,
  isRole,
  pathHasPrefix,
  roleForPath,
} from "@/lib/auth/roles";

/**
 * Paths anyone may reach, signed in or not.
 *
 * `/portal` is here deliberately: the resource library is public by design.
 */
const PUBLIC_PREFIXES = ["/auth", "/home", "/misc", "/portal", "/error"];

function isPublic(pathname: string): boolean {
  return (
    pathname === "/" || PUBLIC_PREFIXES.some((p) => pathHasPrefix(pathname, p))
  );
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Also refreshes the session cookies, which is why this runs on every request.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const areaRole = roleForPath(pathname);

  // Every redirect must carry the cookies getUser() may just have rotated. A bare
  // NextResponse.redirect drops them, the browser keeps the spent refresh token,
  // and the user is signed out once the reuse window passes.
  const redirectTo = (target: string) => {
    const url = request.nextUrl.clone();
    const [path, query] = target.split("?");
    url.pathname = path;
    url.search = query ? `?${query}` : "";

    const response = NextResponse.redirect(url);
    supabaseResponse.cookies
      .getAll()
      .forEach((cookie) => response.cookies.set(cookie));
    return response;
  };

  if (!user) {
    if (isPublic(pathname)) return supabaseResponse;

    // Send them to the login page for whichever area they were reaching for.
    return redirectTo(ROLE_LOGIN[areaRole ?? "student"]);
  }

  // Login and signup are for signed-out visitors; anyone signed in goes home.
  const onLoginPage =
    pathHasPrefix(pathname, "/auth/login") ||
    pathHasPrefix(pathname, "/auth/signup");

  // Public pages need no role, so skip the lookup. This is also what keeps /error
  // from redirecting to itself.
  if (!areaRole && !onLoginPage) return supabaseResponse;

  const { role, failed } = await resolveRole(supabase, user.id);

  // The lookup itself failed (a network or database error). Do not treat that as
  // "no role" and sign the user out; send them somewhere that explains it.
  if (failed) return redirectTo("/error?reason=unavailable");

  // Signed in but with no user_roles row at all. The session is unusable, so end it.
  if (!role) {
    await supabase.auth.signOut({ scope: "local" });
    return redirectTo("/error?reason=no-role");
  }

  // A signed-in user visiting a login page goes to their own landing page instead.
  if (onLoginPage) {
    return redirectTo(ROLE_HOME[role]);
  }

  // Trying to enter another role's area.
  if (areaRole && areaRole !== role) {
    return redirectTo(ROLE_HOME[role]);
  }

  return supabaseResponse;
}

/**
 * The caller's role, from the `user_role` access token claim when the auth hook has
 * supplied one, and from the `user_roles` table when it has not.
 *
 * The fallback exists because a hook that is defined in the database but not
 * registered in Supabase auth config produces tokens with no claim at all, which is
 * the failure that took this application down in December 2025.
 */
async function resolveRole(
  supabase: ReturnType<typeof createServerClient<Database>>,
  userId: string,
): Promise<{ role: roles | null; failed: boolean }> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const claim = session?.access_token
    ? decodeJwtPayload(session.access_token)?.["user_role"]
    : undefined;

  if (isRole(claim)) return { role: claim, failed: false };

  // Filtered to the caller explicitly. Row-level security lets an admin read every
  // row, so without this maybeSingle() failed for admins and locked them out.
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return { role: null, failed: true };
  return { role: isRole(data?.role) ? data.role : null, failed: false };
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const segment = token.split(".")[1];
  if (!segment) return null;

  try {
    const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "=",
    );
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
}
