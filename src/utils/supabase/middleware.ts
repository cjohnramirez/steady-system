import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";
import { roles } from "@/types/main";

interface JwtCustomPayload {
  user_role: roles;
  exp: number;
  iat: number;
  sub: string;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (
      request.nextUrl.pathname.startsWith("/auth/login") ||
      request.nextUrl.pathname.startsWith("/auth") ||
      request.nextUrl.pathname.startsWith("/error")
    ) {
      return supabaseResponse;
    }

    const url = request.nextUrl.clone();
    url.pathname = request.nextUrl.pathname.startsWith("/admin")
      ? "/auth/login/admin"
      : "/auth/login/student";
    return NextResponse.redirect(url);
  }

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const userRole = session
      ? jwtDecode<JwtCustomPayload>(session.access_token).user_role
      : null;

    if (userRole !== "admin" && request.nextUrl.pathname.startsWith("/admin")) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login/admin";
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  } catch {
    const url = request.nextUrl.clone();
    url.pathname = "/error";
    return NextResponse.redirect(url);
  }
}
