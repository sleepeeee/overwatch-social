import Link from "next/link";
import { ArrowLeft, Crosshair, RadioTower } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { readCaptureState } from "@/lib/developer-capture/state";
import CaptureMeter from "@/components/developer-capture/CaptureMeter";

export const metadata = {
  title: "開發者據點 HUD 調整器 | 開發者後台",
  description: "調整與保存開發者據點 HUD 顯示名稱的工具頁面",
};

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const isDev = process.env.NODE_ENV === "development";
  if (!isDev && user?.app_metadata?.role !== "developer") {
    redirect("/");
  }

  const captureState = await readCaptureState();

  return (
    <div className="min-h-screen bg-[#f4f3f0] text-slate-800 transition-colors duration-300 dark:bg-[#1a1d20] dark:text-slate-100">
      <header className="sticky top-[var(--dev-banner-height,0px)] z-30 border-b border-slate-200 bg-white/70 px-6 py-4 backdrop-blur-md dark:border-slate-800 dark:bg-[#202428]/70">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <RadioTower size={12} />
              <span>Developer Tools</span>
            </div>
            <h1 className="mt-1 flex items-center gap-2 text-lg font-black tracking-tight text-slate-900 dark:text-white">
              <Crosshair size={18} className="text-cyan-500" />
              開發者據點 HUD 調整器
            </h1>
            <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
              這裡只管插件畫面名稱，不會改 GitHub 帳號、作者對應或倉庫設定。
            </p>
          </div>

          <Link
            href="/developer"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-100"
          >
            <ArrowLeft size={13} />
            返回控制台
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-6 sm:py-8">
        <div className="mb-4 rounded-lg border border-cyan-400/20 bg-cyan-400/5 px-4 py-3 text-xs font-semibold text-cyan-700 dark:text-cyan-300">
          在這裡修改左右顯示名稱後，按下儲存即可保留。HUD 的 GitHub 連結與戰報資料不會被改寫。
        </div>

        <CaptureMeter state={captureState} showEditor />
      </main>
    </div>
  );
}
