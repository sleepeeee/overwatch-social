"use server";

import { createClient } from "@/lib/supabase/server";
import { OWPlayerCard } from "@/types/card";

export async function getMyProfile(): Promise<OWPlayerCard | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!data) return null;

  return {
    card_id: data.id ?? `card-${data.user_id}`,
    user_id: data.user_id,
    server: data.server,
    battle_tag: data.battle_tag,
    is_tag_visible: data.is_tag_visible,
    selected_heroes: data.selected_heroes ?? [],
    tags: data.tags ?? [],
    message: data.message ?? "",
    languages: data.languages ?? [],
    mic_status: data.mic_status as OWPlayerCard["mic_status"],
    social_channels: data.social_channels ?? {},
    mbti: data.mbti ?? undefined,
  };
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
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims?.sub) {
    return { error: "未登入，無法儲存" };
  }

  const userId = claimsData.claims.sub;

  const { error } = await supabase
    .from("profiles")
    .upsert({
      user_id: userId,
      server: card.server,
      battle_tag: card.battle_tag,
      is_tag_visible: card.is_tag_visible,
      selected_heroes: card.selected_heroes,
      tags: card.tags,
      message: card.message,
      languages: card.languages,
      mic_status: card.mic_status,
      social_channels: card.social_channels,
      mbti: card.mbti ?? null,
    });

  if (error) return { error: error.message };
  return {};
}
