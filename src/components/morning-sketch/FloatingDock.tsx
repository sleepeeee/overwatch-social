"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, User } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function FloatingDock() {
  const pathname = usePathname();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const { theme } = useTheme();

  // 在所有以 /developer 開頭的路徑下全域隱藏全站懸浮導航列，避免阻擋底部視線
  if (pathname && pathname.startsWith("/developer")) {
    return null;
  }

  const navItems = [
    { id: "home", path: "/", label: "首頁", icon: Home },
    { id: "browse", path: "/browse", label: "名片廣場", icon: Compass },
    { id: "profile", path: "/profile", label: "個人檔案", icon: User }
  ];

  // 根據不同主題配置外框 Dock Class
  let dockClass = "relative px-4 sm:px-6 py-1.5 sm:py-2.5 rounded-full flex items-center gap-4 sm:gap-6 bg-white/25 sm:bg-white/35 backdrop-blur-3xl border border-white/40 sm:border-white/50 shadow-[0_8px_32px_rgba(74,62,61,0.02),_0_20px_50px_-10px_rgba(74,62,61,0.05)] h-[48px] sm:h-[58px] transition-all duration-300";
  if (theme === "soft-midnight-lounge") {
    dockClass = "relative px-4 sm:px-6 py-1.5 sm:py-2.5 rounded-full flex items-center gap-4 sm:gap-6 bg-[#161a22]/85 backdrop-blur-3xl border border-white/5 shadow-[0_15px_40px_rgba(0,0,0,0.5)] h-[48px] sm:h-[58px] transition-all duration-300";
  } else if (theme === "paper-card-social") {
    dockClass = "relative px-4 sm:px-6 py-1.5 sm:py-2.5 rounded-md flex items-center gap-4 sm:gap-6 bg-[#FCFAF6] border-2 border-[#4A3E3D] shadow-[3px_3px_0px_#4A3E3D] h-[48px] sm:h-[58px] transition-all duration-300";
  } else if (theme === "cyber-matchmaking-hub") {
    dockClass = "relative px-4 sm:px-6 py-1.5 sm:py-2.5 rounded-none flex items-center gap-4 sm:gap-6 bg-[#0d1117] border border-[#30363d] h-[48px] sm:h-[58px] transition-all duration-300";
  }

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
          
          // 配置各個主題的 Item 樣式與 icon 包裝
          let itemClass = "";
          let wrapperStyle: React.CSSProperties = {};
          
          if (theme === "soft-midnight-lounge") {
            itemClass = `w-8.5 h-8.5 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-400 ${
              isActive 
                ? "bg-[#a78bfa] text-white scale-[1.05] shadow-[0_0_15px_rgba(167,139,250,0.5)]" 
                : "bg-white/5 border border-white/5 text-slate-400 hover:bg-[#a78bfa]/10 hover:text-slate-100 hover:scale-[1.02]"
            }`;
          } else if (theme === "paper-card-social") {
            itemClass = `w-8.5 h-8.5 sm:w-10 sm:h-10 rounded-none flex items-center justify-center transition-all duration-300 ${
              isActive 
                ? "bg-[#E07A5F] text-white border-2 border-[#4A3E3D] scale-[1.05] shadow-[2px_2px_0px_#4A3E3D]" 
                : "bg-white border border-[#4A3E3D] text-[#4A3E3D] hover:bg-[#FAF0D7] hover:scale-[1.02]"
            }`;
          } else if (theme === "cyber-matchmaking-hub") {
            itemClass = `w-8.5 h-8.5 sm:w-10 sm:h-10 rounded-none flex items-center justify-center transition-all duration-200 font-mono ${
              isActive 
                ? "bg-transparent text-[#58a6ff] border border-[#58a6ff] scale-[1.05]" 
                : "bg-[#161b22] border border-[#30363d] text-slate-400 hover:border-[#58a6ff] hover:text-[#58a6ff] hover:scale-[1.02]"
            }`;
          } else {
            // original-baseline
            itemClass = `w-8.5 h-8.5 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-500 ${
              isActive 
                ? "bg-[#82b7cc] text-white scale-[1.05] shadow-[0_4px_12px_-2px_rgba(130,183,204,0.6)]" 
                : "bg-white/10 sm:bg-white/20 border border-white/20 sm:border-white/30 text-[#8c7c6c] hover:bg-[#faf5eb] hover:text-[#3e2723] hover:scale-[1.02]"
            }`;
            if (isActive) {
              wrapperStyle = {
                backgroundColor: "var(--theme-accent, #82b7cc)",
                boxShadow: "0 4px 12px -2px rgba(var(--theme-accent-rgb, 130, 183, 204), 0.6)"
              };
            }
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
                {theme === "cyber-matchmaking-hub" && isActive ? (
                  <span className="flex items-center text-[9px] font-bold tracking-tighter">
                    &gt;
                    <Icon size={12} className="mx-[1px]" />
                    &lt;
                  </span>
                ) : (
                  <Icon size={15} className={`transition-transform duration-300 ${isHovered ? "rotate-2 scale-105" : ""}`} />
                )}
              </div>

              {/* 溫順氣泡提示 */}
              <span className={`absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[8px] font-bold text-white bg-[#4a3e3d]/80 rounded-md backdrop-blur-sm pointer-events-none transition-all duration-300 origin-bottom whitespace-nowrap ${
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
