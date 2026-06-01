"use server";

import { AlignmentConfig } from "@/data/heroAlignments";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * 🛡️ [APC - Advanced Process Control]
 * 英雄立繪補償參數持久化：upsert 到 Supabase hero_alignments 表。
 * 取代原本的 fs.writeFileSync（在 Vercel read-only filesystem 靜默失敗）。
 */
export async function saveHeroAlignments(alignments: Record<string, AlignmentConfig>) {
  try {
    // 🛡️ [Security Defense-in-depth] 伺服器端開發者角色二次校驗
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user?.app_metadata?.role !== "developer") {
      return { success: false, error: "未授權：僅限白名單開發者使用對準儀參數調整" };
    }

    const entries = Object.entries(alignments).map(([hero_id, cfg]) => ({
      hero_id,
      scale: parseFloat(cfg.scale.toFixed(2)),
      translate_x: cfg.translateX,
      translate_y: cfg.translateY,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from("hero_alignments")
      .upsert(entries, { onConflict: "hero_id" });

    if (error) {
      console.error("Failed to save hero alignments:", error.message);
      return { success: false, error: error.message };
    }

    // NOTE: revalidatePath 對 Client Component 無效（browse/profile 均為 "use client"）。
    // 真正的更新機制：用戶重整頁面時 useEffect 重新呼叫 getHeroAlignments() 取最新值。
    // 若需即時更新，應在 AdjusterClientPage 成功後呼叫 router.refresh()（開發者工具可接受刷頁）。
    revalidatePath("/browse");   // 對未來可能的 Server Component 子元件保留
    revalidatePath("/profile");
    return { success: true };
  } catch (err) {
    console.error("Failed to save hero alignments via Server Action:", err);
    return { success: false, error: String(err) };
  }
}
