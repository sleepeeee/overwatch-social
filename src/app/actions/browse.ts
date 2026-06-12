"use server";

import { createClient } from "@/lib/supabase/server";
import { normalizeGameId, normalizeOverwatchServer } from "@/lib/gameCatalog";
import { toSocialChannels } from "@/lib/socialChannels";
import type { OWPlayerCard } from "@/types/card";
import type { Database } from "@/types/database";

type PublicProfileRow = Database["public"]["Views"]["public_profiles"]["Row"];

const PAGE_SIZE = 20;

function rowToCard(row: PublicProfileRow): OWPlayerCard {
  return {
    card_id: row.user_id ?? "",
    user_id: row.user_id ?? "",
    server: normalizeOverwatchServer(row.server),
    battle_tag: row.battle_tag ?? "",
    is_tag_visible: row.is_tag_visible ?? false,
    selected_heroes: row.selected_heroes ?? [],
    tags: row.tags ?? [],
    message: row.message ?? "",
    languages: row.languages ?? [],
    // DB mic_status 為 string；OWPlayerCard 為 union，此處為合理 domain narrowing
    mic_status: (row.mic_status ?? "mic-off") as OWPlayerCard["mic_status"],
    social_channels: toSocialChannels(row.social_channels),
    mbti: row.mbti ?? undefined,
    display_name: row.display_name ?? undefined,
    game: normalizeGameId(row.game),
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

  if (server) query = query.eq("server", normalizeOverwatchServer(server));
  if (mic)    query = query.eq("mic_status", mic);
  if (game)   query = query.eq("game", normalizeGameId(game));

  const { data, error } = await query;

  if (error || !data) return [];

  return data.map(rowToCard);
}
