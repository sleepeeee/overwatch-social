"use server";

import { createClient } from "@/lib/supabase/server";
import { normalizeGameId, normalizeOverwatchServer } from "@/lib/gameCatalog";
import { ensureUserProfileForCurrentUser } from "@/lib/userProfileIdentity";
import { toSocialChannels } from "@/lib/socialChannels";
import { OWPlayerCard } from "@/types/card";
import { revalidateTag } from "next/cache";

export async function getMyProfile(game = 'overwatch'): Promise<OWPlayerCard | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const gameId = normalizeGameId(game);

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .eq("game", gameId)
    .single();

  if (!data) return null;

  return {
    card_id: data.id ?? `card-${data.user_id}`,
    user_id: data.user_id,
    server: normalizeOverwatchServer(data.server),
    battle_tag: data.battle_tag,
    is_tag_visible: data.is_tag_visible,
    selected_heroes: data.selected_heroes ?? [],
    tags: data.tags ?? [],
    message: data.message ?? "",
    languages: data.languages ?? [],
    mic_status: data.mic_status as OWPlayerCard["mic_status"],
    social_channels: toSocialChannels(data.social_channels),
    mbti: data.mbti ?? undefined,
    display_name: data.display_name ?? undefined,
    game: normalizeGameId(data.game),
  };
}

export async function getPublicProfile(userId: string): Promise<OWPlayerCard | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("public_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (!data) return null;
  return {
    card_id: `card-${data.user_id ?? ""}`,
    user_id: data.user_id ?? "",
    server: normalizeOverwatchServer(data.server),
    battle_tag: data.battle_tag ?? "",
    is_tag_visible: data.is_tag_visible ?? false,
    selected_heroes: data.selected_heroes ?? [],
    tags: data.tags ?? [],
    message: data.message ?? "",
    languages: data.languages ?? [],
    // DB mic_status 為 string；OWPlayerCard 為 union，合理 domain narrowing
    mic_status: (data.mic_status ?? "mic-off") as OWPlayerCard["mic_status"],
    social_channels: {},
    mbti: data.mbti ?? undefined,
    display_name: data.display_name ?? undefined,
    game: normalizeGameId(data.game),
  };
}

export async function saveDisplayName(displayName: string): Promise<{ error?: string }> {
  if (!displayName?.trim()) return { error: "名稱不可為空" };
  if (displayName.length > 30) return { error: "名稱長度超出限制（最多 30 字）" };

  const supabase = await createClient();
  const ensured = await ensureUserProfileForCurrentUser(supabase);
  if (!ensured.user?.id || ensured.error) return { error: ensured.error ?? "未登入，無法儲存" };

  const { error } = await supabase
    .from("profiles")
    .upsert(
      { user_id: ensured.user.id, game: 'overwatch', display_name: displayName.trim() },
      { onConflict: "user_id,game" }
    );

  if (error) return { error: error.message };
  revalidateTag("public-profiles", "max");  // 顯示名稱進 public view 後需要使廣場快取失效
  return {};
}

export async function getMyDisplayName(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) return null;

  const { data } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("user_id", user.id)
    .single();

  return data?.display_name ?? null;
}

export async function saveProfile(card: OWPlayerCard): Promise<{ error?: string }> {
  // 伺服器端輸入驗證（防止繞過前端直接呼叫 Server Action）
  if (!card.battle_tag?.trim()) return { error: "BattleTag 不可為空" };
  if (card.battle_tag.length > 50) return { error: "BattleTag 長度超出限制" };
  if (card.message && card.message.length > 200) return { error: "留言長度超出限制（最多 200 字）" };
  if ((card.selected_heroes ?? []).length > 3) return { error: "常用英雄最多 3 個" };
  if ((card.tags ?? []).length > 3) return { error: "標籤最多 3 個" };
  if ((card.languages ?? []).length > 3) return { error: "語言最多 3 個" };

  const supabase = await createClient();
  const ensured = await ensureUserProfileForCurrentUser(supabase);

  if (!ensured.user?.id || ensured.error) {
    return { error: ensured.error ?? "未登入，無法儲存" };
  }

  const userId = ensured.user.id;
  const game = normalizeGameId(card.game);
  const server = game === "overwatch" ? normalizeOverwatchServer(card.server) : card.server;

  const { error } = await supabase
    .from("profiles")
    .upsert(
      {
        user_id: userId,
        game,
        // 防呆雷達：DB 只存 asia/america/europe，不存「亞洲伺服器」這種畫面文字。
        server,
        battle_tag: card.battle_tag,
        is_tag_visible: card.is_tag_visible,
        selected_heroes: card.selected_heroes,
        tags: card.tags,
        message: card.message,
        languages: card.languages,
        mic_status: card.mic_status,
        social_channels: card.social_channels,
        mbti: card.mbti ?? null,
      },
      { onConflict: "user_id,game" }
    );

  if (error) return { error: error.message };
  revalidateTag("public-profiles", "max");  // 名片儲存後使廣場快取失效
  return {};
}
