import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { safeNextPath } from "@/lib/auth/redirect";

const ALLOWED_TYPES: EmailOtpType[] = [
  "email",
  "recovery",
  "magiclink",
  "invite",
  "signup",
];

/**
 * Verifies `token_hash` links, for email templates that use
 * `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=...`. Unlike the
 * PKCE links handled by /auth/callback, these work on any device.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const typeParam = searchParams.get("type") as EmailOtpType | null;
  const type =
    typeParam && ALLOWED_TYPES.includes(typeParam) ? typeParam : null;
  // startsWith("/") used to accept //evil.example, an open redirect.
  const next = safeNextPath(
    searchParams.get("next"),
    type === "recovery" ? "/auth/reset-password" : "/home",
  );

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(
    `${origin}/auth/login/student?error=link-expired`,
  );
}
