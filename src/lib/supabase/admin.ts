import { createClient } from "@supabase/supabase-js";

/**
 * Server-only admin client：使用 SUPABASE_SECRET_KEY（sb_secret_...），
 * 可繞過 RLS 與操作 auth.admin API。
 * ⚠️ 嚴禁在 Client Component import；嚴禁將金鑰加 NEXT_PUBLIC_ 前綴。
 * 環境變數未設定時回傳 null，呼叫端應優雅降級。
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secretKey) return null;

  return createClient(url, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
