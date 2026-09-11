import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { Database } from "@/types/supabase";
import { roles } from "@/types/main";
import { ROLE_HOME, ROLE_LOGIN, isRole, roleForPath } from "@/lib/auth/roles";

/**
 * Paths anyone may reach, signed in or not.
 *
 * `/portal` is here deliberately: the resource library is public by design.
 */
const PUBLIC_PREFIXES = ["/auth", "/home", "/misc", "/portal", "/error"];

function isPublic(pathname: string): boolean {
  return (
    pathname === "/" || PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))
  );
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
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

  if (!user) {
    if (isPublic(pathname)) return supabaseResponse;

    // Send them to the login page for whichever area they were reaching for.
    return redirectTo(request, ROLE_LOGIN[areaRole ?? "student"]);
  }

  const role = await resolveRole(supabase);

  // Signed in but with no role at all. That means either the access token hook is
  // not registered or the account was created without a user_roles row. Either way
  // the session is unusable, so end it rather than bouncing the user around.
  if (!role) {
    return redirectTo(request, "/error?reason=no-role");
  }

  // A signed-in user visiting a login page goes to their own landing page instead.
  if (pathname.startsWith(ROLE_LOGIN[role])) {
    return redirectTo(request, ROLE_HOME[role]);
  }

  // Trying to enter another role's area.
  if (areaRole && areaRole !== role) {
    return redirectTo(request, ROLE_HOME[role]);
  }

  return supabaseResponse;
}

function redirectTo(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  const [path, query] = pathname.split("?");
  url.pathname = path;
  url.search = query ? `?${query}` : "";
  return NextResponse.redirect(url);
}

/**
 * The caller's role, from the `user_role` access token claim when the auth hook has
 * supplied one, and from the `user_roles` table when it has not.
 *
 * The fallback exists because a hook that is defined in the database but not
 * registered in Supabase auth config produces tokens with no claim at all, which is
 * the failure that took this application down in December 2025. Middleware read the
 * claim directly, saw undefined, and redirected every signed-in user away from every
 * protected route.
 */
async function resolveRole(
  supabase: ReturnType<typeof createServerClient<Database>>,
): Promise<roles | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const claim = session?.access_token
    ? decodeJwtPayload(session.access_token)?.["user_role"]
    : undefined;

  if (isRole(claim)) return claim;

  const { data } = await supabase.from("user_roles").select("role").maybeSingle();

  return isRole(data?.role) ? data.role : null;
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
