"use server";

import { unstable_cache } from "next/cache";
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

// unstable_cache 包裝：tag-based 失效（saveProfile/saveDisplayName 呼叫 revalidateTag）
// revalidate: 60 為保底 TTL（即使 revalidateTag 未命中也最多 60 秒舊）
export const getPublicProfiles = unstable_cache(
  async (
    offset: number,
    server?: string,
    mic?: string,
    game?: string
  ): Promise<OWPlayerCard[]> => {
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
  },
  ["public-profiles"],
  { tags: ["public-profiles"], revalidate: 60 }
);
