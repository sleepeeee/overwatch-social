"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Moon, Sun, Palette, Check, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useDevMode } from "@/hooks/useDevMode";
import { useTheme, ThemeStyle } from "@/context/ThemeContext";

const THEMES = [
  { id: "theme-original-baseline", name: "原創基準", bg: "#F5F6F3", text: "#2F3A55" },
  { id: "theme-soft-midnight-lounge", name: "暗夜沙龍", bg: "#161a22", text: "#a78bfa" },
  { id: "theme-paper-card-social", name: "手作紙卡", bg: "#FCFAF6", text: "#4A3E3D" },
  { id: "theme-cyber-matchmaking-hub", name: "配對中心", bg: "#0d1117", text: "#58a6ff" },
];

export default function TopBar() {
  const router = useRouter();
  const { user } = useAuth();
  const { isDeveloper } = useDevMode();
  const { theme, setTheme, isDark, setIsDark } = useTheme();
  const [loginPending, setLoginPending] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // 初始化時同步明暗與主題狀態
  useEffect(() => {
    setMounted(true);
  }, []);

  // 監聽點擊外部關閉選單
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleThemeChange = (themeId: string) => {
    const parsedTheme = themeId.replace("theme-", "") as ThemeStyle;
    setTheme(parsedTheme);
  };

  const toggleDarkMode = () => {
    setIsDark(!isDark);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    // Let onAuthStateChange(SIGNED_OUT) set user=null; push after session cleared
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
    <div className="w-full min-w-0 flex items-center justify-between gap-3 mb-10 z-30 relative animate-[fadeIn_0.6s_ease-out]">
      <div className="flex items-center gap-3 select-none shrink min-w-0">
        {/* Left: Interactive Theme Switcher Button */}
        <div className="relative shrink-0" ref={panelRef}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            title="更換配色與主題"
            className="relative w-9 h-9 flex items-center justify-center rounded-full bg-white/30 dark:bg-stone-900/60 border border-white/40 dark:border-stone-800 shadow-sm hover:shadow-[0_4px_15px_rgba(212,197,169,0.3)] dark:hover:shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:border-morandi-sand/50 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer shrink-0"
          >
            {isDark ? (
              <Moon className="w-4 h-4 text-stone-700 dark:text-stone-300 hover:text-[#82b7cc] transition-colors duration-300" strokeWidth={1.8} />
            ) : (
              <Palette className="w-4 h-4 text-stone-700 dark:text-stone-300 hover:text-[#82b7cc] transition-colors duration-300" strokeWidth={1.8} />
            )}
            
            {/* Amber Beacon Star / Ping Glow Indicator */}
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping opacity-75"></span>
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
          </button>

          {/* Theme Dropdown Panel */}
          {isOpen && mounted && (
            <div className="absolute left-0 mt-2 w-52 rounded-2xl border border-stone-200/60 dark:border-stone-800/80 bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl shadow-lg p-2.5 z-50 animate-[fadeIn_0.2s_ease-out]">
              <div className="text-[9px] font-bold tracking-wider text-stone-400 dark:text-stone-500 mb-2 px-1 uppercase">
                配色風格 (明亮版)
              </div>
              <div className="flex flex-col gap-0.5 mb-2">
                {THEMES.map((t) => {
                  const isCurrent = theme === t.id.replace("theme-", "");
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        handleThemeChange(t.id);
                        setIsOpen(false);
                      }}
                      className={`flex items-center justify-between w-full text-left px-2 py-1.5 rounded-xl transition-all duration-200 text-xs ${
                        isCurrent && !isDark
                          ? "bg-[#5c6b8d]/10 dark:bg-stone-800 text-[#2f3a55] dark:text-white font-semibold"
                          : "hover:bg-stone-100 dark:hover:bg-stone-800/50 text-stone-700 dark:text-stone-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {/* Color dots preview */}
                        <span className="flex w-3.5 h-3.5 rounded-full overflow-hidden border border-stone-200 dark:border-stone-700 shrink-0">
                          <span className="w-1/2 h-full" style={{ backgroundColor: t.bg }} />
                          <span className="w-1/2 h-full" style={{ backgroundColor: t.text }} />
                        </span>
                        <span className="truncate">{t.name}</span>
                      </div>
                      {isCurrent && !isDark && <Check className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-stone-100 dark:border-stone-800/80 my-1.5" />

              <button
                type="button"
                onClick={() => {
                  toggleDarkMode();
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between w-full text-left px-2 py-1.5 rounded-xl transition-all duration-200 text-xs ${
                  isDark
                    ? "bg-[#5c6b8d]/10 dark:bg-stone-800 text-[#2f3a55] dark:text-white font-semibold"
                    : "hover:bg-stone-100 dark:hover:bg-stone-800/50 text-stone-700 dark:text-stone-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  {isDark ? (
                    <Sun className="w-3.5 h-3.5 text-amber-500" strokeWidth={1.8} />
                  ) : (
                    <Moon className="w-3.5 h-3.5 text-stone-700 dark:text-stone-300" strokeWidth={1.8} />
                  )}
                  <span>{isDark ? "切換為明亮版" : "切換為夜間版"}</span>
                </div>
                {isDark && <Check className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>
        
        {/* Right: Brand Text (Static display per user request) */}
        <div className="flex flex-col text-left min-w-0">
          <span className="text-xs font-light tracking-[0.25em] text-[#5d4037] dark:text-stone-300 transition-colors duration-300 truncate">
            AFTER MIDNIGHT
          </span>
          <span className="text-[9px] text-[#8c7c6c] tracking-wider font-semibold transition-colors duration-300 truncate">
            GAME ALLY HUB
          </span>
        </div>
      </div>

      {user ? (
        <div className="flex items-center gap-2 shrink-0">
          {isDeveloper && (
            <Link
              href="/developer"
              className="theme-btn flex items-center gap-2 px-4 py-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-[9px] font-bold tracking-widest uppercase text-amber-800 hover:bg-amber-500/20 transition-all duration-300"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              開發者後台
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="theme-btn flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-[#8c7c6c]/20 bg-white/20 text-[9px] font-bold tracking-widest uppercase text-[#8c7c6c]/70 hover:bg-[#8c7c6c]/8 hover:text-[#5d4037] transition-all duration-300"
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
          className="theme-btn group relative flex h-9 w-9 shrink-0 items-center justify-center gap-2.5 rounded-2xl border border-[#8c7c6c]/20 bg-white/40 p-0 text-[9px] font-bold tracking-widest uppercase text-[#5d4037] hover:text-[#3e2723] hover:bg-white hover:border-[#82b7cc]/40 shadow-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed sm:h-auto sm:w-auto sm:px-4 sm:py-2"
          aria-label={loginPending ? "Google 登入跳轉中" : "使用 Google 登入"}
        >
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.466 0-6.277-2.81-6.277-6.277 0-3.466 2.81-6.277 6.277-6.277 1.558 0 2.977.569 4.083 1.503l3.14-3.14C19.167 1.83 15.938 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.16 0 10.993-4.32 10.993-10.993 0-.616-.068-1.22-.178-1.78l-10.815-.422z" />
            <path fill="#4285F4" d="M23.055 10.422H12.24v3.978h6.887c-.287 1.071-.856 1.954-1.751 2.519l3.076 3.076c2.313-2.138 3.52-5.176 3.52-8.583 0-.312-.016-.65-.055-.99z" />
            <path fill="#34A853" d="M12.24 23.24c3.084 0 5.672-1.022 7.562-2.779l-3.076-3.076c-.856.574-1.954.915-3.076.915-2.519 0-4.662-1.704-5.413-4.114L5.033 17.26c1.879 3.543 5.568 5.98 9.878 5.98z" />
            <path fill="#FBBC05" d="M6.827 14.191c-.198-.574-.312-1.19-.312-1.83s.114-1.256.312-1.83L3.727 7.42C2.96 8.98 2.52 10.56 2.52 12.36s.44 3.38 1.207 4.94l3.1-3.109z" />
          </svg>
          <span className="hidden sm:inline">{loginPending ? "跳轉中..." : "使用 Google 登入"}</span>
        </button>
      )}
    </div>
  );
}
