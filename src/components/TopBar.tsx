"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Moon, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function TopBar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loginPending, setLoginPending] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    setUser(null);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
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
    <div className="w-full flex items-center justify-between mb-10 z-30 relative animate-[fadeIn_0.6s_ease-out]">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-white/30 flex items-center justify-center border border-white/40 shadow-sm hover:rotate-12 hover:scale-105 transition-all duration-500">
          <Moon className="w-4 h-4 text-[#3e2723] fill-[#3e2723]/10" />
        </div>
        <span className="text-[10px] font-bold tracking-widest text-[#3e2723] uppercase whitespace-nowrap">
          After Midnight
        </span>
      </div>

      {user ? (
        <div className="flex items-center gap-2">
          <Link
            href="/profile"
            className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-[#82b7cc]/30 bg-white/40 text-[9px] font-bold tracking-widest uppercase text-[#5d4037] hover:bg-white transition-all duration-300"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#82b7cc]" />
            我的名片
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-[#8c7c6c]/20 bg-white/20 text-[9px] font-bold tracking-widest uppercase text-[#8c7c6c]/70 hover:bg-[#8c7c6c]/8 hover:text-[#5d4037] transition-all duration-300"
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
          className="group relative flex items-center gap-2.5 px-4.5 py-2 rounded-2xl border border-[#8c7c6c]/20 bg-white/40 text-[9px] font-bold tracking-widest uppercase text-[#5d4037] hover:text-[#3e2723] hover:bg-white hover:border-[#82b7cc]/40 shadow-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.466 0-6.277-2.81-6.277-6.277 0-3.466 2.81-6.277 6.277-6.277 1.558 0 2.977.569 4.083 1.503l3.14-3.14C19.167 1.83 15.938 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.16 0 10.993-4.32 10.993-10.993 0-.616-.068-1.22-.178-1.78l-10.815-.422z" />
            <path fill="#4285F4" d="M23.055 10.422H12.24v3.978h6.887c-.287 1.071-.856 1.954-1.751 2.519l3.076 3.076c2.313-2.138 3.52-5.176 3.52-8.583 0-.312-.016-.65-.055-.99z" />
            <path fill="#34A853" d="M12.24 23.24c3.084 0 5.672-1.022 7.562-2.779l-3.076-3.076c-.856.574-1.954.915-3.076.915-2.519 0-4.662-1.704-5.413-4.114L5.033 17.26c1.879 3.543 5.568 5.98 9.878 5.98z" />
            <path fill="#FBBC05" d="M6.827 14.191c-.198-.574-.312-1.19-.312-1.83s.114-1.256.312-1.83L3.727 7.42C2.96 8.98 2.52 10.56 2.52 12.36s.44 3.38 1.207 4.94l3.1-3.109z" />
          </svg>
          {loginPending ? "跳轉中..." : "使用 Google 登入"}
        </button>
      )}
    </div>
  );
}
