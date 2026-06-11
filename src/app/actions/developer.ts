"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath, revalidateTag } from "next/cache";
import { PLACEHOLDER_BATTLE_TAG } from "@/types/card";

/**
 * 🛡️ [Security Helper] 確保只有開發者才能執行後台 Server Actions
 */
async function ensureDeveloper() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user?.app_metadata?.role !== "developer") {
    throw new Error("Unauthorized: Developer privilege required.");
  }
  return { supabase, user };
}

/**
 * 讀取開發者白名單 Email 列表
 */
export async function getWhitelistEmails() {
  try {
    const { supabase, user: currentUser } = await ensureDeveloper();
    
    const { data, error } = await supabase
      .from("developer_whitelist")
      .select("email, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to query whitelist:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

/**
 * 新增 Email 到開發者白名單
 */
export async function addWhitelistEmail(email: string) {
  try {
    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      return { success: false, error: "請輸入有效的 Email 地址（格式：user@domain.com）" };
    }

    const { supabase, user: currentUser } = await ensureDeveloper();

    const { error } = await supabase
      .from("developer_whitelist")
      .insert([{ email: trimmedEmail }]);

    if (error) {
      console.error("Failed to add email to whitelist:", error.message);
      // 處理重複寫入的狀況
      if (error.code === "23505") {
        return { success: false, error: "此 Email 已經在白名單中" };
      }
      return { success: false, error: error.message };
    }

    revalidatePath("/developer");
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

/**
 * 從開發者白名單中移除 Email
 */
export async function removeWhitelistEmail(email: string) {
  try {
    const { supabase, user: currentUser } = await ensureDeveloper();

    // 🛡️ 保護性限制：防止開發者不小心刪除自己，造成無法登入後台的死鎖
    // 使用 ensureDeveloper() 已取得的 currentUser，避免多餘的第二次 getUser() 呼叫
    if (currentUser?.email && currentUser.email.trim().toLowerCase() === email.trim().toLowerCase()) {
      return { success: false, error: "安全保護：您無法在後台將自己從白名單中移除" };
    }

    const { error } = await supabase
      .from("developer_whitelist")
      .delete()
      .eq("email", email);

    if (error) {
      console.error("Failed to remove email from whitelist:", error.message);
      return { success: false, error: error.message };
    }

    revalidatePath("/developer");
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

/**
 * 讀取所有玩家 profiles 基本資訊（用戶管理，developer-only，不含 social_channels）
 * 需要 migration 004 的 "profiles select developer" policy
 */
export async function getAllProfilesForDeveloper(search?: string): Promise<{
  success: boolean;
  data?: Array<{
    user_id: string;
    battle_tag: string;
    is_tag_visible: boolean;
    selected_heroes: string[];
    updated_at: string;
  }>;
  error?: string;
}> {
  try {
    const { supabase } = await ensureDeveloper();

    let query = supabase
      .from("profiles")
      .select("user_id, battle_tag, is_tag_visible, selected_heroes, updated_at")
      .order("updated_at", { ascending: false })
      .limit(100);

    if (search && search.trim()) {
      query = query.ilike("battle_tag", `%${search.trim()}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("getAllProfilesForDeveloper failed:", error.message);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: (data || []).map(row => ({
        user_id: row.user_id,
        battle_tag: row.battle_tag || "",
        is_tag_visible: row.is_tag_visible,
        selected_heroes: row.selected_heroes ?? [],
        updated_at: row.updated_at,
      })),
    };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

/**
 * 下架/恢復一張名片（moderation，developer-only）。
 * 下架後 public_profiles view 過濾該名片，廣場與玩家詳細頁皆不可見；
 * 本人在工作室仍看得到並可編輯。
 */
export async function setCardHidden(cardId: string, hidden: boolean) {
  try {
    await ensureDeveloper();

    const admin = createAdminClient();
    if (!admin) return { success: false, error: "伺服器尚未設定管理金鑰（SUPABASE_SECRET_KEY）" };

    const { error } = await admin
      .from("profiles")
      .update({ is_hidden: hidden })
      .eq("id", cardId);

    if (error) return { success: false, error: error.message };

    revalidateTag("public-profiles", "max");
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

/**
 * 停權/解除停權一個用戶（moderation，developer-only）。
 * 停權使用 Supabase Auth 原生 ban：無法再登入，既有 session 於 JWT 到期後失效。
 * 名片不會自動下架，需另行操作。
 */
export async function setUserBanned(userId: string, banned: boolean) {
  try {
    const { user: currentUser } = await ensureDeveloper();

    if (currentUser.id === userId) {
      return { success: false, error: "安全保護：您無法停權自己" };
    }

    const admin = createAdminClient();
    if (!admin) return { success: false, error: "伺服器尚未設定管理金鑰（SUPABASE_SECRET_KEY）" };

    // 876600h ≈ 100 年，等同永久停權；"none" 解除
    const { error } = await admin.auth.admin.updateUserById(userId, {
      ban_duration: banned ? "876600h" : "none",
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

/**
 * 讀取全部用戶的停權狀態（developer-only，後台用戶列表用）
 */
export async function getAdminBanStates(): Promise<{
  success: boolean;
  data?: Record<string, boolean>;
  error?: string;
}> {
  try {
    await ensureDeveloper();

    const admin = createAdminClient();
    if (!admin) return { success: false, error: "伺服器尚未設定管理金鑰（SUPABASE_SECRET_KEY）" };

    const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    if (error) return { success: false, error: error.message };

    const states: Record<string, boolean> = {};
    for (const u of data.users) {
      // banned_until 未來時間 = 停權中；supabase-js User 型別未宣告此欄位，需窄化
      const bannedUntil = (u as { banned_until?: string | null }).banned_until;
      states[u.id] = !!bannedUntil && new Date(bannedUntil) > new Date();
    }

    return { success: true, data: states };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

/**
 * 讀取英雄流行度統計 Top 20（developer-only，從 DB 聚合）
 */
export async function getHeroStats(): Promise<Array<{ heroId: string; count: number }>> {
  try {
    const { supabase } = await ensureDeveloper();

    const { data, error } = await supabase.rpc("get_hero_stats");

    if (error || !data) {
      console.error("Failed to fetch hero stats via RPC:", error?.message);
      return [];
    }

    return data.map(row => ({
      heroId: row.hero_id,
      count: Number(row.hero_count),
    }));
  } catch (err) {
    console.error("getHeroStats error:", err);
    return [];
  }
}

/**
 * 讀取系統真實統計：玩家帳號與遊戲名片分開計算。
 */
export async function getSystemStats() {
  try {
    const { supabase } = await ensureDeveloper();

    const [userResult, totalResult, completedResult] = await Promise.all([
      supabase.from("user_profiles").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true })
        .not("battle_tag", "is", null)
        .neq("battle_tag", PLACEHOLDER_BATTLE_TAG) // 排除預設佔位值，只計算真正填寫的名片
    ]);

    if (userResult.error) {
      console.error("getSystemStats user query failed:", userResult.error.message);
      return { success: false, totalUsers: 0, totalProfiles: 0, completedProfiles: 0, error: userResult.error.message };
    }
    if (totalResult.error) {
      console.error("getSystemStats total query failed:", totalResult.error.message);
      return { success: false, totalUsers: 0, totalProfiles: 0, completedProfiles: 0, error: totalResult.error.message };
    }
    if (completedResult.error) {
      console.error("getSystemStats completed query failed:", completedResult.error.message);
      return { success: false, totalUsers: 0, totalProfiles: 0, completedProfiles: 0, error: completedResult.error.message };
    }

    return {
      success: true,
      totalUsers: userResult.count ?? 0,
      totalProfiles: totalResult.count ?? 0,
      completedProfiles: completedResult.count ?? 0,
    };
  } catch (err) {
    console.error("Failed to get system stats:", err);
    return { success: false, totalUsers: 0, totalProfiles: 0, completedProfiles: 0 };
  }
}
