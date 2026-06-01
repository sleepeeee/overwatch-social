import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DeveloperConsoleClient from "./DeveloperConsoleClient";
import { getSystemStats } from "@/app/actions/developer";

export const metadata = {
  title: "開發者主控台 | Overwatch Social",
  description: "系統管理、功能開關、開發測試工具與立繪對準儀高階製程控制台",
};

export default async function Page() {
  // 🛡️ [Security Defense-in-depth] 伺服器端開發者身分二次阻斷
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user?.app_metadata?.role !== "developer") {
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

  // 讀取真實系統統計
  const stats = await getSystemStats();

  return (
    <DeveloperConsoleClient
      initialWhitelist={whitelist}
      currentUserEmail={user?.email || "unknown@developer.com"}
      totalProfiles={stats.totalProfiles}
      completedProfiles={stats.completedProfiles}
    />
  );
}
