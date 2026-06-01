"use client";

import React, { useState } from "react";
import { MessageSquare, Coffee, Settings, Send } from "lucide-react";

export default function LotusWelcomeWidget() {
  const [activeStep, setActiveStep] = useState(1);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  const announcements = [
    {
      num: "01",
      tag: "ADMIN'S COLUMN",
      title: "站長隨筆手札 ✍️",
      icon: MessageSquare,
      color: "rgba(130, 183, 204, 0.85)", // #82b7cc
      message: "給深夜還在線上的硬派玩家。在這裡，我們用名片點亮孤單的星空，幫助你找到能在耳麥裡分享勝負的靈魂伴侶。"
    },
    {
      num: "02",
      tag: "CHANGELOG",
      title: "最新改版日誌 🚀",
      icon: Settings,
      color: "rgba(245, 212, 107, 0.85)", // #f5d46b
      message: "v0.12.0 大改版：首頁全面解耦鬥陣特攻，支持跨遊戲大廳！新增『每日幸友翻牌』與『揪團活動行事曆』。"
    },
    {
      num: "03",
      tag: "CONTACT US",
      title: "加入玩家語音 ✉️",
      icon: Send,
      color: "rgba(235, 220, 216, 0.85)", // #ebdcd8
      message: "Discord 全局官方語音群已就緒！點擊頭像即可前往，與各路特工、召喚師與休閒大師一同暢聊開黑。"
    },
    {
      num: "04",
      tag: "SUPPORT US",
      title: "請站長喝杯咖啡 ☕",
      icon: Coffee,
      color: "rgba(140, 124, 108, 0.85)", // #8c7c6c
      message: "如果這個禪意手帳風的小站溫暖了你，歡迎買杯咖啡支持本站。我們將持續開發更多有趣、精美的遊戲社群小工具！"
    }
  ];

  const current = announcements[activeStep - 1];

  return (
    <div 
      className="relative flex flex-col items-center justify-center p-6 glass-panel w-full h-[320px] text-center gap-4.5"
      style={{
        boxShadow: "0 10px 40px -10px rgba(var(--theme-accent-rgb), 0.1)"
      }}
    >
      {/* 水彩風格背景發光環 */}
      <div className="absolute top-[15%] w-[180px] h-[180px] rounded-full bg-gradient-to-tr from-[#82b7cc]/10 to-[#f5d46b]/10 blur-2xl pointer-events-none z-0" />

      {/* 精緻自繪多層漸變蓮花 SVG */}
      <div className="relative z-10 w-28 h-28 flex items-center justify-center pt-2">
        <svg viewBox="0 0 100 100" className="w-full h-full transform hover:scale-105 active:scale-98 transition-transform duration-500 cursor-pointer drop-shadow-[0_4px_12px_rgba(130,183,204,0.2)]">
          <defs>
            <linearGradient id="lotus-petal" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#82b7cc" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#f5d46b" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#f3e0a7" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="lotus-side" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#82b7cc" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#f5d46b" stopOpacity="0.7" />
            </linearGradient>
          </defs>
          <path d="M 50,78 C 36,78 28,70 28,70 C 40,73 50,78 50,78 C 50,78 60,73 72,70 C 72,70 64,78 50,78 Z" fill="#a0a29f" opacity="0.4" />
          <path d="M 50,72 C 30,62 32,45 50,22 C 68,45 70,62 50,72 Z" fill="url(#lotus-petal)" opacity="0.65" />
          <path d="M 50,72 C 24,65 18,48 35,32 C 45,46 50,60 50,72 Z" fill="url(#lotus-side)" opacity="0.55" />
          <path d="M 50,72 C 76,65 82,48 65,32 C 55,46 50,60 50,72 Z" fill="url(#lotus-side)" opacity="0.55" />
          <path d="M 50,72 C 26,72 22,58 40,42 C 46,55 50,66 50,72 Z" fill="url(#lotus-petal)" opacity="0.8" />
          <path d="M 50,72 C 74,72 78,58 60,42 C 54,55 50,66 50,72 Z" fill="url(#lotus-petal)" opacity="0.8" />
          <path d="M 50,72 C 36,65 38,52 50,30 C 62,52 64,65 50,72 Z" fill="url(#lotus-petal)" />
          <circle cx="50" cy="56" r="3" fill="#faf8f5" opacity="0.9" className="animate-pulse" />
        </svg>
      </div>

      {/* 動態公告內容區 (放大字體) */}
      <div 
        key={activeStep} 
        className="relative z-10 space-y-2.5 px-4 animate-[fadeIn_0.5s_ease-out] flex-grow flex flex-col justify-center"
      >
        <span 
          className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full inline-block mx-auto border"
          style={{ 
            color: current.color, 
            borderColor: current.color,
            backgroundColor: `${current.color.replace("0.85", "0.08")}` 
          }}
        >
          {current.tag}
        </span>
        <h4 className="text-lg font-extrabold text-[#3e2723] tracking-wide">
          {current.title}
        </h4>
        <p className="text-[#8c7c6c] text-xs md:text-sm leading-relaxed italic px-2">
          &ldquo;{current.message}&rdquo;
        </p>
      </div>

      {/* 01-04 步進圓形按鈕組 */}
      <div className="relative z-10 flex gap-4 pb-2">
        {announcements.map((s, idx) => {
          const stepNum = idx + 1;
          const isActive = activeStep === stepNum;
          const isHovered = hoveredStep === stepNum;

          return (
            <button
              key={s.num}
              onClick={() => setActiveStep(stepNum)}
              onMouseEnter={() => setHoveredStep(stepNum)}
              onMouseLeave={() => setHoveredStep(null)}
              className="relative w-8 h-8 flex items-center justify-center text-[10px] font-black tracking-tighter text-[#8c7c6c] hover:text-[#3e2723] transition-all duration-300 rounded-full cursor-pointer"
            >
              <div 
                className={`absolute inset-0 rounded-full border transition-all duration-500 flex items-center justify-center ${
                  isActive 
                    ? "bg-[#faf8f5] border-[#82b7cc]/60 shadow-[0_2px_10px_rgba(130,183,204,0.25)] scale-110" 
                    : "bg-white/30 border-[#8c7c6c]/15 hover:border-[#8c7c6c]/40 hover:bg-white/50"
                }`}
              />
              <span className="relative z-10 font-mono tracking-tighter text-[10px]">{s.num}</span>

              {(isActive || isHovered) && (
                <div 
                  className={`absolute rounded-full border pointer-events-none ${
                    isActive 
                      ? "animate-[ping_2s_infinite] border-[#82b7cc]/25 w-[140%] h-[140%]" 
                      : "animate-[ping_1.5s_1] border-[#8c7c6c]/15 w-[130%] h-[130%]"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
