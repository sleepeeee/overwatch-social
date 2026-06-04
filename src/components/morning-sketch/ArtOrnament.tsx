"use client";

import React from "react";
import { useTheme } from "@/context/ThemeContext";

export default function ArtOrnament() {
  const { theme } = useTheme();

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 transition-colors duration-500">
      {/* 1. Original / Baseline 背景 */}
      {theme === "original-baseline" && (
        <>
          {/* 雲霧光暈 */}
          <div 
            className="art-mist absolute top-[-10%] left-[-10%] w-[55vw] h-[55vw] rounded-full opacity-25 blur-[130px] animate-mist-a"
            style={{
              backgroundColor: "rgba(var(--theme-accent-rgb, 140, 124, 108), 0.8)"
            }}
          />
          <div 
            className="art-mist absolute top-[20%] right-[-15%] w-[60vw] h-[60vw] rounded-full opacity-20 blur-[140px] animate-mist-b"
            style={{
              backgroundColor: "rgba(var(--theme-accent-rgb, 130, 183, 204), 0.6)"
            }}
          />
          <div 
            className="art-mist absolute bottom-[-10%] left-[15%] w-[50vw] h-[50vw] rounded-full opacity-35 blur-[120px] animate-mist-c"
            style={{
              backgroundColor: "rgba(var(--theme-highlight-rgb, 245, 212, 107), 0.5)"
            }}
          />

          {/* SVG 流體貝茲曲線與同心禪意波紋 */}
          <svg 
            className="absolute inset-0 w-full h-full opacity-[0.14] text-border" 
            viewBox="0 0 1440 900" 
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M -100 200 Q 200 450 600 300 T 1300 650 T 1600 500" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5"
              strokeLinecap="round" 
            />
            <path 
              d="M -50 250 Q 250 480 630 350 T 1350 680 T 1650 530" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.2"
              strokeLinecap="round" 
            />
            <circle cx="200" cy="500" r="120" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 6" />
            <circle cx="200" cy="500" r="80" fill="none" stroke="currentColor" strokeWidth="0.8" />
            <circle cx="200" cy="500" r="40" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="6 3" />
            <path d="M 1200 100 A 150 150 0 0 0 1350 250" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <path d="M 1220 100 A 130 130 0 0 0 1350 230" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 4" />
          </svg>

          {/* Wave Border */}
          <div 
            className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white/30 to-transparent opacity-60"
            style={{
              clipPath: "polygon(0% 100%, 100% 100%, 100% 30%, 80% 60%, 55% 20%, 30% 75%, 0% 40%)"
            }}
          />
        </>
      )}

      {/* 2. Soft Midnight Lounge 背景 */}
      {theme === "soft-midnight-lounge" && (
        <>
          {/* 低亮度、深色暗紫/靛青微弱擴散光暈 */}
          <div 
            className="absolute top-[-15%] left-[-15%] w-[70vw] h-[70vw] rounded-full opacity-40 blur-[150px] pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 80%)"
            }}
          />
          <div 
            className="absolute bottom-[-15%] right-[-10%] w-[65vw] h-[65vw] rounded-full opacity-35 blur-[160px] pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(30, 27, 75, 0.15) 0%, transparent 80%)"
            }}
          />
          {/* 非常淡的點格網紋，增加深夜沙龍質感 */}
          <div className="absolute inset-0 opacity-[0.03] cyber-dots bg-repeat pointer-events-none" />
        </>
      )}

      {/* 3. Paper Card Social 背景 */}
      {theme === "paper-card-social" && (
        <>
          {/* 全螢幕滿版橫線紙感紋理 */}
          <div className="absolute inset-0 ms-sketch-lines opacity-[0.25] pointer-events-none" />
          {/* 滿版手繪微小污漬/水彩背景印花質感 */}
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: "var(--ms-a2-dot-grid)" }} />
          {/* 四周隨機的小印花裝飾 */}
          <div className="absolute top-8 left-12 w-24 h-24 ms-c1-organic-circle-sand opacity-30" />
          <div className="absolute bottom-12 right-16 w-32 h-32 ms-c1-organic-circle-rose opacity-20" />
        </>
      )}

      {/* 4. Cyber Matchmaking Hub 背景 */}
      {theme === "cyber-matchmaking-hub" && (
        <>
          {/* 滿版科技對齊網格 */}
          <div className="absolute inset-0 bg-tech-grid opacity-[0.08] pointer-events-none" />
          {/* 雷達掃描點貼紙 */}
          <div className="absolute inset-0 cyber-dots opacity-[0.06] pointer-events-none" />
          {/* 四角技術坐標標記/定位裝飾線 */}
          <div className="absolute top-6 left-6 text-[#58a6ff]/20 font-mono text-[9px] uppercase tracking-wider select-none">
            [SYS_LOC: 45.92.81 // OK]
          </div>
          <div className="absolute bottom-6 right-6 text-[#58a6ff]/20 font-mono text-[9px] uppercase tracking-wider select-none">
            [SYS_STATUS: ACTIVE]
          </div>
        </>
      )}
    </div>
  );
}
