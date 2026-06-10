import type { User } from "@supabase/supabase-js";

type SupabaseLike = {
  auth: {
    getUser: () => Promise<{ data: { user: User | null }; error: Error | null }>;
  };
  from: (table: string) => {
    upsert: (
      values: Record<string, unknown>,
      options?: { onConflict?: string; ignoreDuplicates?: boolean }
    ) => PromiseLike<{ error: Error | null }>;
  };
};

function getInitialNickname(user: User): string | null {
  const metadataName =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email?.split("@")[0] ??
    null;

  if (typeof metadataName !== "string") return null;
  const trimmed = metadataName.trim();
  return trimmed.length > 0 ? trimmed.slice(0, 30) : null;
}

export async function ensureUserProfileForUser(
  supabase: SupabaseLike,
  user: User
): Promise<{ error?: string }> {
  // 防呆雷達：ignoreDuplicates=true 會保留玩家已設定的 nickname，不會被 Google 名稱洗掉。
  const { error } = await supabase
    .from("user_profiles")
    .upsert(
      {
        user_id: user.id,
        nickname: getInitialNickname(user),
      },
      { onConflict: "user_id", ignoreDuplicates: true }
    );

  if (error) return { error: error.message };
  return {};
}

export async function ensureUserProfileForCurrentUser(
  supabase: SupabaseLike
): Promise<{ user: User | null; error?: string }> {
  const { data, error } = await supabase.auth.getUser();
  if (error) return { user: null, error: error.message };
  if (!data.user) return { user: null, error: "未登入，無法建立玩家資料" };

  const ensured = await ensureUserProfileForUser(supabase, data.user);
  if (ensured.error) return { user: data.user, error: ensured.error };
  return { user: data.user };
}
