"use server";

import { createClient } from "@/lib/supabase/server";
import { HERO_ALIGNMENTS, DEFAULT_ALIGNMENT, AlignmentConfig } from "@/data/heroAlignments";

/**
 * 從 Supabase hero_alignments 表讀取英雄對準參數。
 * 任何失敗均 fallback 到靜態 HERO_ALIGNMENTS（intentional fallback，不破壞頁面渲染）。
 * 不需要 ensureDeveloper()——公開讀（RLS: FOR SELECT USING (true)）。
 */
export async function getHeroAlignments(): Promise<Record<string, AlignmentConfig>> {
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
      return { ...HERO_ALIGNMENTS }; // DB 未 seed 或空表，fallback 靜態
    }

    const result: Record<string, AlignmentConfig> = { ...HERO_ALIGNMENTS };
    data.forEach(row => {
      result[row.hero_id] = {
        scale: parseFloat(String(row.scale)),
        translateX: row.translate_x as number,
        translateY: row.translate_y as number,
      };
    });
    return result;
  } catch (err) {
    console.error("[getHeroAlignments] unexpected error, using static fallback:", err);
    return { ...HERO_ALIGNMENTS };
  }
}

export { DEFAULT_ALIGNMENT };
