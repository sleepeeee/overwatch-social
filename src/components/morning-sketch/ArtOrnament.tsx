"use client";

import React from "react";

export default function ArtOrnament() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* 1. Misty Layers: 雲霧般的低飽和光暈 (使用 theme accent 變數 + 大模糊度 + 緩慢呼吸) */}
      <div 
        className="absolute top-[-10%] left-[-10%] w-[55vw] h-[55vw] rounded-full opacity-25 blur-[130px] animate-mist-a"
        style={{
          backgroundColor: "rgba(var(--theme-accent-rgb, 140, 124, 108), 0.8)"
        }}
      />
      <div 
        className="absolute top-[20%] right-[-15%] w-[60vw] h-[60vw] rounded-full opacity-20 blur-[140px] animate-mist-b"
        style={{
          backgroundColor: "rgba(var(--theme-accent-rgb, 130, 183, 204), 0.6)"
        }}
      />
      <div 
        className="absolute bottom-[-10%] left-[15%] w-[50vw] h-[50vw] rounded-full opacity-35 blur-[120px] animate-mist-c"
        style={{
          backgroundColor: "rgba(var(--theme-highlight-rgb, 245, 212, 107), 0.5)"
        }}
      />

      {/* 2. Organic Fluid Lines: 安靜、細緻如風的 SVG 流體貝茲曲線與同心禪意波紋 */}
      <svg 
        className="absolute inset-0 w-full h-full opacity-[0.09] text-[#4a3e3d]" 
        viewBox="0 0 1440 900" 
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 第一條流體線條 */}
        <path 
          d="M -100 200 Q 200 450 600 300 T 1300 650 T 1600 500" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5"
          strokeLinecap="round" 
        />
        
        {/* 第二條流體線條 (平行呼應，製造微風水面感) */}
        <path 
          d="M -50 250 Q 250 480 630 350 T 1350 680 T 1650 530" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.2"
          strokeLinecap="round" 
        />

        {/* 輕微的同心禪意波紋 */}
        <circle cx="200" cy="500" r="120" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 6" />
        <circle cx="200" cy="500" r="80" fill="none" stroke="currentColor" strokeWidth="0.8" />
        <circle cx="200" cy="500" r="40" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="6 3" />
        
        {/* 右上角的簡約半圓裝飾 */}
        <path d="M 1200 100 A 150 150 0 0 0 1350 250" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <path d="M 1220 100 A 130 130 0 0 0 1350 230" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 4" />
      </svg>

      {/* 3. Wave Border (波浪邊界裝飾 - 超淡半透明，將上下區塊溫柔地融合) */}
      <div 
        className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white/30 to-transparent opacity-60"
        style={{
          clipPath: "polygon(0% 100%, 100% 100%, 100% 30%, 80% 60%, 55% 20%, 30% 75%, 0% 40%)"
        }}
      />
    </div>
  );
}
