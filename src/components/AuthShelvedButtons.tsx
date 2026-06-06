"use client";

import React, { useState } from "react";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useDevMode } from "@/hooks/useDevMode";

/**
 * 🔒 曜石暗夜星河 - 已收納備份的原版認證與開發者按鈕
 * 
 * 此元件用於備份原本在 TopBar.tsx 中的：
 * 1. 開發者後台按鈕 (isDeveloper)
 * 2. 帳戶登出按鈕 (handleLogout)
 * 3. Google 登入按鈕 (handleGoogleLogin)
 * 
 * 待完全移植驗證外觀後，我們將與使用者討論如何把這些按鈕重新整合到 UI (例如個人主控台底部或 TopBar) 中。
 */
export default function AuthShelvedButtons() {
  const { user } = useAuth();
  const { isDeveloper } = useDevMode();
  const [loginPending, setLoginPending] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const handleGoogleLogin = async () => {
    if (loginPending) return;
    setLoginPending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      console.error("Google 登入失敗:", error.message);
      setLoginPending(false);
    }
  };

  return (
    <div className="flex items-center gap-2 p-4 rounded-3xl bg-black/40 border border-white/5 w-fit">
      <span className="text-[10px] font-mono text-zinc-500 mr-2">SHELVED AUTH:</span>
      {user ? (
        <div className="flex items-center gap-2">
          {isDeveloper && (
            <Link
              href="/developer"
              className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-amber-500/30 bg-amber-500/5 text-[9px] font-bold tracking-widest uppercase text-amber-400 hover:bg-amber-500/25 transition-all duration-300"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              開發者後台
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-white/10 bg-white/5 text-[9px] font-bold tracking-widest uppercase text-zinc-300 hover:bg-white/10 hover:text-white transition-all duration-300"
            title="登出"
          >
            <LogOut size={10} />
            登出
          </button>
        </div>
      ) : (
        <button
          onClick={handleGoogleLogin}
          disabled={loginPending}
          className="group relative flex h-9 items-center justify-center gap-2.5 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-[9px] font-bold tracking-widest uppercase text-zinc-300 hover:text-white hover:bg-white/10 hover:border-auroraTeal/40 shadow-sm transition-all duration-300 disabled:opacity-50"
        >
          <span>{loginPending ? "跳轉中..." : "使用 Google 登入"}</span>
        </button>
      )}
    </div>
  );
}
