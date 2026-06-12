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
    is_card_visible: data.is_card_visible ?? true,
    is_draft: data.is_draft ?? false,
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

// 草稿卡隨機預設名稱詞庫（與 Google 身份無關，貼合深夜星空調性）
const DRAFT_NAME_WORDS = [
  "深夜哨兵", "星空旅人", "午夜行者", "月光特工", "夜航信使",
  "流星獵人", "極光守望", "暗夜貓頭鷹", "銀河漫遊者", "宵禁突破者",
];

/**
 * 進入名片編輯器時自動建檔（草稿）：
 * - battle_tag 為隨機預設名稱（詞庫 + 4 碼隨機數字）
 * - is_draft = true、is_card_visible = false（不出現在廣場）
 * - 已有名片（含草稿）時直接回傳現有資料，不重複建檔
 */
export async function provisionDefaultCard(game = "overwatch"): Promise<OWPlayerCard | null> {
  const supabase = await createClient();
  const ensured = await ensureUserProfileForCurrentUser(supabase);
  if (!ensured.user?.id || ensured.error) return null;

  const existing = await getMyProfile(game);
  if (existing) return existing;

  const word = DRAFT_NAME_WORDS[Math.floor(Math.random() * DRAFT_NAME_WORDS.length)];
  const digits = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  const draftTag = `${word}#${digits}`;

  const gameId = normalizeGameId(game);
  const { error } = await supabase.from("profiles").upsert(
    {
      user_id: ensured.user.id,
      game: gameId,
      battle_tag: draftTag,
      server: "asia",
      is_tag_visible: true,
      is_card_visible: false,
      is_draft: true,
      selected_heroes: [],
      tags: [],
      message: "GGWP！一起加油，推車到底啦 🚀",
      languages: ["繁體中文"],
      mic_status: "listen-only",
      social_channels: {},
    },
    { onConflict: "user_id,game", ignoreDuplicates: true }
  );

  if (error) {
    console.error("provisionDefaultCard failed:", error.message);
    return null;
  }
  // 草稿不在公開 view 內，無需 revalidate
  return getMyProfile(game);
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
  const [battleTagName, battleTagSuffix] = card.battle_tag.split("#");

  if (game === "overwatch" && (!battleTagName?.trim() || !battleTagSuffix?.trim())) {
    return { error: "請輸入完整 BattleTag，例如：芮萊突破者#1011" };
  }

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
        is_card_visible: card.is_card_visible ?? true,
        is_draft: false,  // 任何一次用戶儲存都讓草稿轉正
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
