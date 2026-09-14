import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { safeNextPath } from "@/lib/auth/redirect";

/**
 * Where Supabase sends PKCE links (password reset, email confirmation) with a
 * `?code=`. Exchanges it for a session on the server and forwards to `next`.
 *
 * The forgot-password page used to wait for the browser client to exchange the code
 * itself, which only worked in the browser that requested the email, and failed
 * silently everywhere else.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"), "/home");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  const failed = next.startsWith("/auth/reset-password")
    ? "/auth/forget-password?error=link-expired"
    : "/auth/login/student?error=link-expired";

  return NextResponse.redirect(`${origin}${failed}`);
}
