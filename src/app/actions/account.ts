"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { revalidateTag } from "next/cache";

/**
 * 刪除目前登入用戶的整個帳號。
 * 透過 admin client 刪除 auth.users 紀錄，profiles / user_profiles
 * 依 FK ON DELETE CASCADE 連帶清除，最後登出清掉本機 session。
 */
export async function deleteMyAccount(): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "未登入，無法刪除帳號" };

  // SUPABASE_SECRET_KEY 為 server-only 金鑰（sb_secret_...），可繞過 RLS，嚴禁加 NEXT_PUBLIC_ 前綴
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!secretKey || !supabaseUrl) return { error: "伺服器尚未設定刪除權限，請聯絡管理員" };

  const admin = createAdminClient(
    supabaseUrl,
    secretKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return { error: `刪除失敗：${error.message}` };

  await supabase.auth.signOut();
  revalidateTag("public-profiles", "max");
  return {};
}
