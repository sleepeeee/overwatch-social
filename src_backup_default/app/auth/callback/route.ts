import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function safeRedirectPath(next: string | null, origin: string): string {
  if (!next) return "/profile";
  try {
    const decoded = decodeURIComponent(next);
    const url = new URL(decoded, origin);
    // 只允許同源相對路徑，排除 protocol-relative (//)
    if (
      url.origin === origin &&
      url.pathname.startsWith("/") &&
      !decoded.startsWith("//")
    ) {
      return url.pathname + url.search + url.hash;
    }
  } catch {
    // URL parse 失敗，fallback
  }
  return "/";
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/error?reason=no_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/auth/error?reason=exchange_failed`);
  }

  const redirectPath = safeRedirectPath(next, origin);
  return NextResponse.redirect(`${origin}${redirectPath}`);
}
