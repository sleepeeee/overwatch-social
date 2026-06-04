"use server";

import { createClient } from "@/lib/supabase/server";
import type { OWPlayerCard } from "@/types/card";

const PAGE_SIZE = 20;

function rowToCard(row: Record<string, unknown>): OWPlayerCard {
  return {
    card_id: (row.user_id as string),
    user_id: row.user_id as string,
    server: row.server as string,
    battle_tag: row.battle_tag as string,
    is_tag_visible: row.is_tag_visible as boolean,
    selected_heroes: (row.selected_heroes as string[]) ?? [],
    tags: (row.tags as string[]) ?? [],
    message: (row.message as string) ?? "",
    languages: (row.languages as string[]) ?? [],
    mic_status: row.mic_status as OWPlayerCard["mic_status"],
    social_channels: (row.social_channels as Record<string, string>) ?? {},
    mbti: (row.mbti as string) ?? undefined,
    display_name: (row.display_name as string) ?? undefined,
    game: (row.game as string) ?? undefined,
  };
}

// 直接查詢，不使用 unstable_cache
// 原因：unstable_cache 只失效同一 Vercel instance，其他 instance 仍服務舊資料
// 已有 migration 011 的 DB 索引（updated_at DESC、server、mic_status、game）保障查詢效能
export async function getPublicProfiles(
  offset: number,
  server?: string,
  mic?: string,
  game?: string
): Promise<OWPlayerCard[]> {
  const supabase = await createClient();

  let query = supabase
    .from("public_profiles")
    .select("*")
    .order("updated_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (server) query = query.eq("server", server);
  if (mic)    query = query.eq("mic_status", mic);
  if (game)   query = query.eq("game", game);

  const { data, error } = await query;

  if (error || !data) return [];

  return data.map((row) => rowToCard(row as Record<string, unknown>));
}
