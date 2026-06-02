import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { readCaptureState } from "@/lib/developer-capture/state";
import CaptureHudAdjusterClient from "./CaptureHudAdjusterClient";

export const metadata = {
  title: "GIT OUTPOST CONSOLE | 開發者後台",
  description: "完整 Git 據點佔領 HUD 調整器——4 Tab 面板（手冊/資源下載/規格/向量代碼）",
};

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const isDev = process.env.NODE_ENV === "development";
  if (!isDev && user?.app_metadata?.role !== "developer") {
    redirect("/");
  }

  const captureState = await readCaptureState();

  return <CaptureHudAdjusterClient initialState={captureState} />;
}
