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
 * 讀取指定遊戲或全部特色標籤
 */
export async function getGameSpecialTags(gameId?: string) {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("game_special_tags")
      .select("id, game_id, tag_name, style_class, created_at")
      .order("created_at", { ascending: false });

    if (gameId) {
      query = query.eq("game_id", gameId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Failed to query game special tags:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

/**
 * 新增特色標籤 (僅限開發者)
 */
export async function addGameSpecialTag(gameId: string, tagName: string, styleClass: string) {
  try {
    const trimmedGameId = gameId.trim();
    const trimmedTagName = tagName.trim();
    const trimmedStyleClass = styleClass.trim();

    if (!trimmedGameId || !trimmedTagName || !trimmedStyleClass) {
      return { success: false, error: "所有欄位皆為必填項目" };
    }

    const { supabase } = await ensureDeveloper();

    const { error } = await supabase
      .from("game_special_tags")
      .insert([
        {
          game_id: trimmedGameId,
          tag_name: trimmedTagName,
          style_class: trimmedStyleClass,
        },
      ]);

    if (error) {
      console.error("Failed to add game tag:", error.message);
      return { success: false, error: error.message };
    }

    revalidatePath("/developer");
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

/**
 * 刪除特色標籤 (僅限開發者)
 */
export async function deleteGameSpecialTag(tagId: string) {
  try {
    if (!tagId) {
      return { success: false, error: "標籤 ID 無效" };
    }

    const { supabase } = await ensureDeveloper();

    const { error } = await supabase
      .from("game_special_tags")
      .delete()
      .eq("id", tagId);

    if (error) {
      console.error("Failed to delete game tag:", error.message);
      return { success: false, error: error.message };
    }

    revalidatePath("/developer");
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
