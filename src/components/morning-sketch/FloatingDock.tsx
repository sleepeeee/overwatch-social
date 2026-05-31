"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, User } from "lucide-react";

export default function FloatingDock() {
  const pathname = usePathname();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const navItems = [
    { id: "home", path: "/", label: "首頁", icon: Home },
    { id: "browse", path: "/browse", label: "名片廣場", icon: Compass },
    { id: "profile", path: "/profile", label: "個人檔案", icon: User }
  ];

  // 模擬 macOS Fisheye 縮放係數
  const getScale = (idx: number) => {
    if (hoveredIdx === null) return "scale-100";
    const distance = Math.abs(hoveredIdx - idx);
    if (distance === 0) return "scale-[1.2] -translate-y-2 z-20 shadow-[0_10px_20px_rgba(140,124,108,0.15)]";
    if (distance === 1) return "scale-[1.08] -translate-y-0.5 z-10";
    return "scale-95 opacity-80";
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-out">
      {/* 半圓毛玻璃 Dock 面板 */}
      <div 
        className="relative px-6 py-3 rounded-full flex items-end gap-5 bg-white/20 backdrop-blur-2xl border border-white/40 shadow-[0_15px_40px_-10px_rgba(140,124,108,0.25)] transition-all duration-300 h-[68px]"
        onMouseLeave={() => setHoveredIdx(null)}
      >
        {/* 精緻裝飾：底部的 MS 水印標誌 */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-0.5 rounded-full bg-[#faf8f5]/90 border border-[#8c7c6c]/15 text-[8px] font-black text-[#8c7c6c] tracking-widest uppercase shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          ms
        </div>

        {navItems.map((item, idx) => {
          const Icon = item.icon;
          // 精確判斷當前路由是否選中
          const isActive = pathname === item.path;
          
          return (
            <Link
              key={item.id}
              href={item.path}
              onMouseEnter={() => setHoveredIdx(idx)}
              className={`relative flex flex-col items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] group ${getScale(idx)}`}
            >
              {/* 圖標背景 */}
              <div 
                className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors duration-300 ${
                  isActive 
                    ? "bg-[#82b7cc] text-white shadow-[0_4px_12px_rgba(130,183,204,0.3)]" 
                    : "bg-white/40 border border-[#8c7c6c]/10 text-[#8c7c6c] hover:bg-white hover:text-[#3e2723]"
                }`}
              >
                <Icon size={18} className="transition-transform group-hover:rotate-6 duration-300" />
              </div>

              {/* 懸浮文字氣泡提示 */}
              <span className="absolute -bottom-7 scale-0 group-hover:scale-100 px-2.5 py-0.5 text-[8px] font-black text-white bg-slate-800/80 rounded-md backdrop-blur-sm pointer-events-none transition-transform origin-top duration-200 whitespace-nowrap shadow-sm">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
