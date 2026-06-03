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
  };
}

export async function getPublicProfiles(
  offset: number,
  server?: string,
  mic?: string
): Promise<OWPlayerCard[]> {
  const supabase = await createClient();

  let query = supabase
    .from("public_profiles")
    .select("*")
    .order("updated_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (server) query = query.eq("server", server);
  if (mic)    query = query.eq("mic_status", mic);

  const { data, error } = await query;

  if (error || !data) return [];

  return data.map((row) => rowToCard(row as Record<string, unknown>));
}
