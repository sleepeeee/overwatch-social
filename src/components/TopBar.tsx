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
  const navItems = [
    { href: "/", desktopLabel: "INTRO // 前廳", mobileLabel: "前廳" },
    { href: "/browse", desktopLabel: "LOBBY // 展示館", mobileLabel: "展示館" },
    { href: "/profile", desktopLabel: "STUDIO // 工作室", mobileLabel: "工作室" },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full flex items-center justify-between gap-3 z-30 relative h-20 opacity-0" />
    );
  }

  return (
    <header className="sticky top-[var(--dev-banner-height,0px)] z-50 w-full overflow-hidden border-b border-white/[0.05] bg-[rgba(5,4,9,0.78)] shadow-[0_10px_30px_rgba(0,0,0,0.16)] backdrop-blur-2xl h-16 sm:h-20 flex items-center transition-all duration-300">
      <div className="max-w-7xl w-full mx-auto px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-3 min-w-0">
        {/* 左側 Logo 區域 */}
        <Link href="/" className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3 select-none hover:opacity-90 transition-opacity group">
          <div className="relative transform group-hover:rotate-[15deg] transition-transform duration-[800ms] ease-out">
            <ElegantCrescentIcon className="w-7 h-7 sm:w-8 sm:h-8 filter drop-shadow-[0_0_8px_rgba(192,132,252,0.3)] shrink-0" />
          </div>
          <div className="flex flex-col text-left min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold tracking-[0.18em] sm:tracking-[0.24em] text-white uppercase group-hover:text-auroraMint transition-colors duration-500 font-mono truncate">
              AFTER MIDNIGHT
            </span>
            <span className="hidden sm:block text-[8px] text-zinc-400 tracking-[0.3em] uppercase font-mono mt-1 truncate">
              Slow Player Cosmos
            </span>
          </div>
        </Link>

        {/* 右側 乾淨導航連結 */}
        <nav className="flex shrink-0 items-center gap-0.5 sm:gap-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-2 py-2 text-[10px] tracking-[0.06em] transition-all duration-500 font-mono sm:px-4 sm:text-[11px] sm:tracking-wider ${
                pathname === item.href
                  ? "text-auroraMint bg-white/[0.04] border border-white/10"
                  : "text-zinc-300 hover:text-white border border-transparent"
              }`}
            >
              <span className="sm:hidden">{item.mobileLabel}</span>
              <span className="hidden sm:inline">{item.desktopLabel}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
