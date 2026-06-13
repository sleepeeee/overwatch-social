"use client";

import { createClient } from "@/lib/supabase/client";

/**
 * 不可作為 OAuth 完成後 next 回跳路徑的前綴。
 *
 * `/auth/*` — 避免 callback 遞迴或 next=/auth/error。
 * `/developer/*` — 守門路由（Server Component redirect），帶入只會被踢走，無意義。
 *
 * 未列入的路徑（如 `/`、`/browse`、`/profile`、`/share/[id]`、`/player/[id]`）皆為合法 next；
 * 跨 origin / protocol-relative 由 callback 端 `safeRedirectPath` 同源驗證擋下。
 */
export const UNSAFE_NEXT_PREFIXES = ["/auth/", "/developer/"] as const;

export function buildNext(currentPath: string): string {
  if (UNSAFE_NEXT_PREFIXES.some((p) => currentPath.startsWith(p))) {
    return "/profile";
  }
  return currentPath;
}

/**
 * 觸發 Google OAuth 登入，並於 redirectTo 帶入 `?next=<encoded current path>`，
 * 讓 `src/app/auth/callback/route.ts` 完成 code exchange 後回到使用者原本所在頁面。
 *
 * 4 個登入入口（LoginModal / HomeClient / ProfileClient / AuthShelvedButtons）統一呼叫此函式；
 * 未來新增 OAuth 參數（prompt=select_account 等）、加 telemetry、改 provider 只需改本檔。
 */
export async function signInWithGoogle(opts?: { nextPath?: string }) {
  const supabase = createClient();
  const pathname =
    opts?.nextPath ??
    (typeof window !== "undefined"
      ? window.location.pathname + window.location.search
      : "/profile");
  const next = encodeURIComponent(buildNext(pathname));
  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=${next}`,
    },
  });
}
