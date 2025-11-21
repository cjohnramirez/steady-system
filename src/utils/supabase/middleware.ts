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

  if (request.nextUrl.pathname === "/"){
    return supabaseResponse
  }

  if (!user) {
    if (
      request.nextUrl.pathname.startsWith("/auth/login") ||
      request.nextUrl.pathname.startsWith("/auth") ||
      request.nextUrl.pathname.startsWith("/error") ||
      request.nextUrl.pathname.startsWith("/home")
    ) {
      return supabaseResponse;
    }

    const url = request.nextUrl.clone();
    if (request.nextUrl.pathname.startsWith("/admin")) {
      url.pathname = "/auth/login/admin";
    } else if (request.nextUrl.pathname.startsWith("/counselor")) {
      url.pathname = "/auth/login/counselor";
    } else {
      url.pathname = "/auth/login/student";
    }
    return NextResponse.redirect(url);
  }

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const userRole = session
      ? jwtDecode<JwtCustomPayload>(session.access_token).user_role
      : null;

    if (
      userRole === "admin" &&
      request.nextUrl.pathname.startsWith("/auth/login/admin")
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/dashboard";
      return NextResponse.redirect(url);
    }

    if (
      userRole === "counselor" &&
      request.nextUrl.pathname.startsWith("/auth/login/counselor")
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/counselor/dashboard";
      return NextResponse.redirect(url);
    }

    if (
      userRole === "student" &&
      request.nextUrl.pathname.startsWith("/auth/login/student")
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/student/profile";
      return NextResponse.redirect(url);
    }

    if (userRole !== "admin" && request.nextUrl.pathname.startsWith("/admin")) {
      if (
        userRole !== "student" &&
        request.nextUrl.pathname.startsWith("/student")
      ) {
        const url = request.nextUrl.clone();
        url.pathname = "/auth/login/student";
        return NextResponse.redirect(url);
      }

      if (
        userRole !== "counselor" &&
        request.nextUrl.pathname.startsWith("/counselor")
      ) {
        const url = request.nextUrl.clone();
        url.pathname = "/auth/login/counselor";
        return NextResponse.redirect(url);
      }

      return supabaseResponse;
    }

    return supabaseResponse;
  } catch {
    const url = request.nextUrl.clone();
    url.pathname = "/error";
    return NextResponse.redirect(url);
  }
}
