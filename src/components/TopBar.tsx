"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ElegantCrescentIcon } from "@/components/CosmicParticlesBackground";

/**
 * 🌌 曜石暗夜星河 - 極簡導航欄 (TopBar)
 * 
 * 移除了原本的登入/登出與開發者後台按鈕 (已備份至 AuthShelvedButtons.tsx)。
 * 此 TopBar 僅包含品牌 Logo 與三個純導航連結，將登入控制交給頁面內嵌的 CTA 區塊。
 */
export default function TopBar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full flex items-center justify-between gap-3 z-30 relative h-20 opacity-0" />
    );
  }

  return (
    <header className="sticky top-[var(--dev-banner-height,0px)] z-50 w-full border-b border-white/[0.05] bg-[rgba(5,4,9,0.78)] shadow-[0_10px_30px_rgba(0,0,0,0.16)] backdrop-blur-2xl h-20 flex items-center transition-all duration-300">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 flex items-center justify-between gap-3 min-w-0">
        {/* 左側 Logo 區域 */}
        <Link href="/" className="flex items-center gap-3 select-none hover:opacity-90 transition-opacity group">
          <div className="relative transform group-hover:rotate-[15deg] transition-transform duration-[800ms] ease-out">
            <ElegantCrescentIcon className="w-8 h-8 filter drop-shadow-[0_0_8px_rgba(192,132,252,0.3)] shrink-0" />
          </div>
          <div className="flex flex-col text-left min-w-0">
            <span className="text-xs font-semibold tracking-[0.24em] text-white uppercase group-hover:text-auroraMint transition-colors duration-500 font-mono truncate">
              AFTER MIDNIGHT
            </span>
            <span className="text-[8px] text-zinc-400 tracking-[0.3em] uppercase font-mono mt-1 truncate">
              Slow Player Cosmos
            </span>
          </div>
        </Link>

        {/* 右側 乾淨導航連結 */}
        <nav className="flex items-center space-x-1 sm:space-x-4 shrink-0">
          <Link
            href="/"
            className={`px-4 py-2 rounded-full text-[11px] tracking-wider transition-all duration-500 font-mono ${
              pathname === "/"
                ? "text-auroraMint bg-white/[0.04] border border-white/10"
                : "text-zinc-300 hover:text-white border border-transparent"
            }`}
          >
            INTRO // 前廳
          </Link>
          <Link
            href="/browse"
            className={`px-4 py-2 rounded-full text-[11px] tracking-wider transition-all duration-500 font-mono ${
              pathname === "/browse"
                ? "text-auroraMint bg-white/[0.04] border border-white/10"
                : "text-zinc-300 hover:text-white border border-transparent"
            }`}
          >
            LOBBY // 展示館
          </Link>
          <Link
            href="/profile"
            className={`px-4 py-2 rounded-full text-[11px] tracking-wider transition-all duration-500 font-mono ${
              pathname === "/profile"
                ? "text-auroraMint bg-white/[0.04] border border-white/10"
                : "text-zinc-300 hover:text-white border border-transparent"
            }`}
          >
            STUDIO // 工作室
          </Link>
        </nav>
      </div>
    </header>
  );
}
