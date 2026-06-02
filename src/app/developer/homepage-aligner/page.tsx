import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import HomepageAlignerClient from "./HomepageAlignerClient";
import { getAnnouncements } from "@/app/actions/homepage";

export const metadata = {
  title: "首頁內容精密調校儀 | Overwatch Social",
  description: "系統研發與版面位置對準調校專用的進階控制儀",
};

export default async function Page() {
  // 🛡️ [Security Defense-in-depth] 伺服器端開發者身分二次阻斷
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const isDev = process.env.NODE_ENV === "development";
  if (!isDev && user?.app_metadata?.role !== "developer") {
    redirect("/");
  }

  // 讀取首頁公告
  const announcementsData = await getAnnouncements();

  return (
    <HomepageAlignerClient
      initialAnnouncements={announcementsData || []}
      currentUserEmail={user?.email || "unknown@developer.com"}
    />
  );
}
