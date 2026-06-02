import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdjusterClientPage from "./AdjusterClientPage";

export const metadata = {
  title: "精密立繪對準儀 | 開發者後台",
  description: "鬥陣特工名片英雄半身立繪精準置中縮放與位移補償參數校準控制台",
};

export default async function Page() {
  // 🛡️ [Security Defense-in-depth] 伺服器端開發者權限阻斷，防止繞過前端 UI 越權訪問
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const isDev = process.env.NODE_ENV === "development";
  if (!isDev && user?.app_metadata?.role !== "developer") {
    redirect("/");
  }

  return <AdjusterClientPage />;
}
