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

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      {/* 鵝卵石圓潤磨砂玻璃 Dock */}
      <div 
        className="relative px-6 py-2.5 rounded-full flex items-center gap-6 bg-white/35 backdrop-blur-3xl border border-white/50 shadow-[0_8px_32px_rgba(74,62,61,0.03),_0_20px_50px_-10px_rgba(74,62,61,0.06)] h-[58px]"
        onMouseLeave={() => setHoveredIdx(null)}
      >

        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          const isHovered = hoveredIdx === idx;
          
          return (
            <Link
              key={item.id}
              href={item.path}
              onMouseEnter={() => setHoveredIdx(idx)}
              className="relative flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]"
            >
              {/* 圖標按鈕背景：選中時展現水粉暈染效果，滑過時微微圓滑擴大 */}
              <div 
                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                  isActive 
                    ? "bg-[#82b7cc] text-white scale-[1.05] shadow-[0_4px_12px_-2px_rgba(130,183,204,0.6)]" 
                    : "bg-white/20 border border-white/30 text-[#8c7c6c] hover:bg-[#faf5eb] hover:text-[#3e2723] hover:scale-[1.02]"
                }`}
                style={{
                  backgroundColor: isActive ? "var(--theme-accent, #82b7cc)" : undefined,
                  boxShadow: isActive ? "0 4px 12px -2px rgba(var(--theme-accent-rgb), 0.6)" : undefined
                }}
              >
                <Icon size={16} className={`transition-transform duration-300 ${isHovered ? "rotate-3 scale-110" : ""}`} />
              </div>

              {/* 溫順氣泡提示 */}
              <span className={`absolute -top-8 px-2 py-0.5 text-[8px] font-bold text-white bg-[#4a3e3d]/80 rounded-md backdrop-blur-sm pointer-events-none transition-all duration-300 origin-bottom ${
                isHovered ? "scale-100 opacity-100 translate-y-0" : "scale-75 opacity-0 translate-y-2"
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
