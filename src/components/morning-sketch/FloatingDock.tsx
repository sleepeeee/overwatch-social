"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, User } from "lucide-react";

export default function FloatingDock() {
  const pathname = usePathname();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // 在所有以 /developer 開頭的路徑下全域隱藏全站懸浮導航列，避免阻擋底部視線
  if (pathname && pathname.startsWith("/developer")) {
    return null;
  }

  const navItems = [
    { id: "home", path: "/", label: "首頁", icon: Home },
    { id: "browse", path: "/browse", label: "名片廣場", icon: Compass },
    { id: "profile", path: "/profile", label: "個人檔案", icon: User }
  ];

  // 採用曜石暗色磨砂玻璃的 Dock 容器
  let dockClass = "relative px-4 sm:px-6 py-1.5 sm:py-2.5 rounded-full flex items-center gap-4 sm:gap-6 bg-black/60 backdrop-blur-3xl border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.6)] h-[48px] sm:h-[58px] transition-all duration-300";

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300">
      <div 
        className={dockClass}
        onMouseLeave={() => setHoveredIdx(null)}
      >
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          const isHovered = hoveredIdx === idx;
          
          let itemClass = `w-8.5 h-8.5 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-500 ${
            isActive 
              ? "text-white scale-[1.05]" 
              : "bg-white/5 border border-white/5 text-zinc-400 hover:bg-white/10 hover:text-white hover:scale-[1.02]"
          }`;
          
          let wrapperStyle: React.CSSProperties = {};
          if (isActive) {
            wrapperStyle = {
              backgroundColor: "#8b5cf6", // auroraTeal
              boxShadow: "0 0 15px rgba(139, 92, 246, 0.45)"
            };
          }

          return (
            <Link
              key={item.id}
              href={item.path}
              onMouseEnter={() => setHoveredIdx(idx)}
              className="relative flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]"
            >
              <div 
                className={itemClass}
                style={wrapperStyle}
              >
                <Icon size={15} className={`transition-transform duration-300 ${isHovered ? "rotate-2 scale-105" : ""}`} />
              </div>

              {/* 溫順氣泡提示 - 暗黑風格 */}
              <span className={`absolute -top-8 left-1/2 -translate-x-1/2 px-2.5 py-1 text-[8px] font-bold text-zinc-200 bg-obsidian border border-white/5 rounded-md backdrop-blur-sm pointer-events-none transition-all duration-300 origin-bottom whitespace-nowrap shadow-xl ${
                isHovered ? "scale-100 opacity-100 translate-y-0 -translate-x-1/2" : "scale-75 opacity-0 translate-y-2 -translate-x-1/2"
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
