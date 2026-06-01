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
  return supabase;
}

/**
 * 讀取開發者白名單 Email 列表
 */
export async function getWhitelistEmails() {
  try {
    const supabase = await ensureDeveloper();
    
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

    const supabase = await ensureDeveloper();

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
    const supabase = await ensureDeveloper();

    // 🛡️ 保護性限制：防止開發者不小心刪除自己，造成無法登入後台的死鎖
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email && user.email.toLowerCase() === email.toLowerCase()) {
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
