"use server";

import { createClient } from "@/lib/supabase/server";
import { HERO_ALIGNMENTS, AlignmentConfig } from "@/data/heroAlignments";
import { getCachedAlignments, setCachedAlignments } from "./alignmentCache";

export async function getHeroAlignments(): Promise<Record<string, AlignmentConfig>> {
  const cached = getCachedAlignments();
  if (cached) return cached;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("hero_alignments")
      .select("hero_id, scale, translate_x, translate_y");

    if (error) {
      console.error("[getHeroAlignments] DB error, using static fallback:", error.message);
      return { ...HERO_ALIGNMENTS };
    }

    if (!data || data.length === 0) {
      return { ...HERO_ALIGNMENTS };
    }

    const result: Record<string, AlignmentConfig> = { ...HERO_ALIGNMENTS };
    data.forEach(row => {
      result[row.hero_id] = {
        scale: parseFloat(String(row.scale)),
        translateX: row.translate_x as number,
        translateY: row.translate_y as number,
      };
    });

    // 只在成功取得資料時寫入 cache；fallback 路徑不寫，確保 DB 恢復後能重新讀取
    setCachedAlignments(result);
    return result;
  } catch (err) {
    console.error("[getHeroAlignments] unexpected error, using static fallback:", err);
    return { ...HERO_ALIGNMENTS };
  }
}

// DEFAULT_ALIGNMENT 不可在 "use server" 檔案中 re-export（Next.js 限制：只能匯出 async function）
// 請直接從 "@/data/heroAlignments" 匯入 DEFAULT_ALIGNMENT
