"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      return { success: false, error: "請輸入有效的 Email 地址" };
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
    if (currentUser?.email && currentUser.email.toLowerCase() === email.toLowerCase()) {
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
 * 讀取系統真實統計（需要 developer 角色才能查全部 profiles）
 * 注意：使用 developer-specific SELECT policy（003 migration 已加入）
 */
export async function getSystemStats() {
  try {
    const { supabase, user: currentUser } = await ensureDeveloper();

    const [totalResult, completedResult] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true })
        .not("battle_tag", "is", null)
        .neq("battle_tag", "愛喝奶茶#3342") // 排除預設佔位值，只計算真正填寫的名片
    ]);

    if (totalResult.error) {
      console.error("getSystemStats total query failed:", totalResult.error.message);
      return { success: false, totalProfiles: 0, completedProfiles: 0, error: totalResult.error.message };
    }
    if (completedResult.error) {
      console.error("getSystemStats completed query failed:", completedResult.error.message);
      return { success: false, totalProfiles: 0, completedProfiles: 0, error: completedResult.error.message };
    }

    return {
      success: true,
      totalProfiles: totalResult.count ?? 0,
      completedProfiles: completedResult.count ?? 0,
    };
  } catch (err) {
    console.error("Failed to get system stats:", err);
    return { success: false, totalProfiles: 0, completedProfiles: 0 };
  }
}
