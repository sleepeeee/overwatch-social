import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DeveloperConsoleClient from "./DeveloperConsoleClient";

export const metadata = {
  title: "開發者主控台 | Overwatch Social",
  description: "系統管理、功能開關、開發測試工具與立繪對準儀高階製程控制台",
};

export default async function Page() {
  // 🛡️ [Security Defense-in-depth] 伺服器端開發者身分二次阻斷
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const isDev = process.env.NODE_ENV === "development";
  if (!isDev && user?.app_metadata?.role !== "developer") {
    redirect("/");
  }

  // 從資料庫中讀取現有的白名單資料
  const { data: whitelistData, error } = await supabase
    .from("developer_whitelist")
    .select("email, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch developer whitelist on server side:", error.message);
  }

  // 格式化白名單資料
  const whitelist = (whitelistData || []).map(item => ({
    email: item.email as string,
    created_at: item.created_at as string,
  }));

  // 讀取統計 + 英雄流行度（共享 supabase client，消除重複 getUser() auth round-trip）
  const [totalResult, completedResult, heroStatsResult] = await Promise.all([
    supabase.from("profiles").select("user_id", { count: "exact", head: true }),
    supabase.from("profiles").select("user_id", { count: "exact", head: true })
      .not("battle_tag", "is", null)
      .neq("battle_tag", "愛喝奶茶#3342"),
    supabase.rpc("get_hero_stats"),
  ]);

  const totalProfiles = totalResult.count ?? 0;
  const completedProfiles = completedResult.count ?? 0;
  const statsError = totalResult.error?.message || completedResult.error?.message || heroStatsResult.error?.message;

  // 🛡️ 容錯與型別安全轉換，若 RPC 失敗（如開發環境下未登入）降級為空陣列，防止頁面崩潰
  const heroStats = heroStatsResult.error 
    ? [] 
    : (heroStatsResult.data as Array<{ hero_id: string; hero_count: number | string }> ?? []).map(row => ({
        heroId: row.hero_id,
        count: Number(row.hero_count),
      }));

  return (
    <DeveloperConsoleClient
      initialWhitelist={whitelist}
      currentUserEmail={user?.email || "unknown@developer.com"}
      totalProfiles={totalProfiles}
      completedProfiles={completedProfiles}
      heroStats={heroStats}
    />
  );
}
