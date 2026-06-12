"use client";

import { useState } from "react";
import { Palette, Check } from "lucide-react";
import { useTheme, type ThemeStyle } from "@/context/ThemeContext";
import { useDevMode } from "@/hooks/useDevMode";

// developer-only 主題預覽切換器（add-standalone-theme-style）
// 一般用戶與 anon 不渲染任何入口；主題純視覺、非安全邊界（useDevMode 為 UI-only gating）。
// 三套原型主題（neon-esports / minimal-magazine / retro-arcade）的 CSS 已依使用者
// 裁示移除（設計與截圖見 openspec archive add-standalone-theme-style）。
// 重新啟用時：還原 globals.css theme class + ThemeContext 白名單 + 此清單。
const THEME_OPTIONS: { id: ThemeStyle; label: string; note?: string }[] = [
  { id: "original-baseline", label: "原創基準", note: "曜石暗夜星塵（預設）" },
];

export default function ThemeSwitcher() {
  const { isDeveloper, loading } = useDevMode();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  if (loading || !isDeveloper) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2">
      {open && (
        <div className="glass-panel rounded-2xl p-2 w-56 shadow-xl">
          <p className="px-3 py-1.5 text-[10px] tracking-widest uppercase text-theme-text-faint">
            主題預覽（developer）
          </p>
          {THEME_OPTIONS.map((opt) => {
            const active = theme === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setTheme(opt.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-sm transition-colors ${
                  active
                    ? "bg-theme-accent-brand/15 text-theme-text-strong"
                    : "text-theme-text-soft hover:bg-white/5"
                }`}
              >
                <span>
                  {opt.label}
                  {opt.note && (
                    <span className="block text-[10px] text-theme-text-faint">{opt.note}</span>
                  )}
                </span>
                {active && <Check size={14} className="text-theme-accent-brand shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="主題預覽切換器"
        className="glass-panel rounded-full p-3 text-theme-accent-brand hover:text-theme-text-strong transition-colors shadow-lg"
      >
        <Palette size={18} />
      </button>
    </div>
  );
}
