"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidateTag } from "next/cache";

export interface UserProfileRow {
  user_id: string;
  nickname: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminUserListItem {
  user_id: string;
  nickname: string | null;
  games: string[];
  last_active: string | null;
}

export interface AdminUserCard {
  id: string;
  user_id: string;
  game: string;
  server: string;
  battle_tag: string;
  is_tag_visible: boolean;
  selected_heroes: string[];
  tags: string[];
  message: string;
  languages: string[];
  mic_status: string;
  display_name: string | null;
  updated_at: string;
}

async function ensureDeveloper() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.app_metadata?.role !== "developer") {
    throw new Error("Unauthorized: Developer privilege required.");
  }
  return { supabase, user };
}

export async function getMyUserProfile(): Promise<UserProfileRow | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) return null;

  const { data } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return data as UserProfileRow | null;
}

export async function saveNickname(nickname: string): Promise<{ error?: string }> {
  const trimmed = nickname.trim();

  if (trimmed.length > 30) return { error: "暱稱長度不可超過 30 字元" };

  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user?.id) return { error: "未登入，無法儲存" };

  const nicknameValue = trimmed.length > 0 ? trimmed : null;

  const { error } = await supabase
    .from("user_profiles")
    .upsert(
      { user_id: user.id, nickname: nicknameValue },
      { onConflict: "user_id" }
    );

  if (error) return { error: error.message };
  revalidateTag("public-profiles", "max");
  return {};
}

export async function getAdminUserList(options: {
  query?: string;
  offset?: number;
} = {}): Promise<{ success: boolean; data?: AdminUserListItem[]; error?: string }> {
  try {
    const { supabase } = await ensureDeveloper();
    const { query = "", offset = 0 } = options;

    let dbQuery = supabase
      .from("user_profiles")
      .select(`
        user_id,
        nickname,
        profiles (
          game,
          updated_at
        )
      `)
      .order("updated_at", { ascending: false, referencedTable: "profiles" })
      .range(offset, offset + 49);

    if (query.trim()) {
      dbQuery = dbQuery.ilike("nickname", `%${query.trim()}%`);
    }

    const { data, error } = await dbQuery;
    if (error) return { success: false, error: error.message };

    const items: AdminUserListItem[] = (data ?? []).map((row: {
      user_id: string;
      nickname: string | null;
      profiles: Array<{ game: string; updated_at: string }> | null;
    }) => {
      const profiles = row.profiles ?? [];
      const games = [...new Set(profiles.map(p => p.game))];
      const lastActive = profiles.length > 0
        ? profiles.sort((a, b) => b.updated_at.localeCompare(a.updated_at))[0].updated_at
        : null;

      return {
        user_id: row.user_id,
        nickname: row.nickname,
        games,
        last_active: lastActive,
      };
    });

    return { success: true, data: items };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export async function getAdminUserCards(userId: string): Promise<{
  success: boolean;
  data?: AdminUserCard[];
  error?: string;
}> {
  try {
    const { supabase } = await ensureDeveloper();

    const { data, error } = await supabase
      .from("profiles")
      .select("id, user_id, game, server, battle_tag, is_tag_visible, selected_heroes, tags, message, languages, mic_status, display_name, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) return { success: false, error: error.message };

    return { success: true, data: (data ?? []) as AdminUserCard[] };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
