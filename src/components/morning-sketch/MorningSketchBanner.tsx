"use client";

import React, { useEffect, useState } from "react";
import { Search, Mail, Bookmark } from "lucide-react";

interface BannerProps {
  styleMode: "A" | "B" | "AB";
}

const InstagramIcon = ({ size = 14, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);


export default function MorningSketchBanner({ styleMode }: BannerProps) {
  const [animatedProgress, setAnimatedProgress] = useState({ p1: 0, p2: 0, p3: 0 });

  useEffect(() => {
    // 進入時的進度條描邊動態效果
    const timer = setTimeout(() => {
      setAnimatedProgress({ p1: 32, p2: 64, p3: 78 });
    }, 150);
    return () => clearTimeout(timer);
  }, [styleMode]);

  const isStyleA = styleMode === "A";
  const isStyleB = styleMode === "B";
  const isStyleAB = styleMode === "AB";

  // 背景圖路徑
  const bgImg = isStyleA 
    ? "/images/morning_sketch_banner_a.png" 
    : "/images/morning_sketch_banner_b.png";

  // 圓環 progress 繪製
  const renderCircle = (percent: number, colorClass: string, label: string) => {
    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percent / 100) * circumference;

    return (
      <div className="flex flex-col items-center gap-1.5 transition-all duration-300">
        <div className="relative w-11 h-11">
          <svg className="w-full h-full transform -rotate-90">
            {/* 背景底圓 */}
            <circle
              cx="22"
              cy="22"
              r={radius}
              className="stroke-white/10"
              strokeWidth="2.5"
              fill="transparent"
            />
            {/* 進度圓弧 */}
            <circle
              cx="22"
              cy="22"
              r={radius}
              className={`transition-all duration-1000 ease-out ${colorClass}`}
              strokeWidth="2.5"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white/90">
            {percent}%
          </span>
        </div>
        <span className="text-[9px] font-extrabold tracking-wider text-white/60 uppercase">{label}</span>
      </div>
    );
  };

  return (
    <div 
      className="relative w-full h-[220px] rounded-3xl overflow-hidden glass-panel flex flex-row items-center justify-between p-8"
      style={{
        boxShadow: "0 10px 40px -10px rgba(var(--theme-accent-rgb), 0.12)"
      }}
    >
      {/* 曲線切割的背景圖片裝飾層 */}
      <div 
        className="absolute top-0 right-0 w-[55%] h-full bg-cover bg-center transition-all duration-500"
        style={{
          backgroundImage: `url(${bgImg})`,
          clipPath: "url(#banner-curve)"
        }}
      />
      
      {/* 遮罩漸變層，確保左側文字清晰 */}
      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none z-0" />

      {/* 橫幅內容區域 */}
      <div className="relative z-10 flex flex-col justify-between h-full max-w-[50%]">
        <div className="space-y-2.5">
          <span className="text-[10px] font-black tracking-widest text-[#8c7c6c]/70 uppercase">
            {isStyleA ? "FEB. 07TH" : "MAY 20, 2026"}
          </span>
          
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wider text-[#3e2723] uppercase">
            {isStyleA ? "MORNING SKETCH" : "GOOD MORNING"}
          </h1>
          
          <p className="text-[#8c7c6c]/90 text-xs sm:text-sm font-semibold tracking-wide flex items-center gap-1.5">
            {isStyleA ? "朝のスケッチ — 每天清晨，都是一塊全新的畫布。" : "Thanks for following my page. 感謝特工們的關注。"}
          </p>
        </div>

        {/* 底部互動社群 Icon */}
        <div className="flex items-center gap-4 text-[#8c7c6c]/80 pt-2">
          {isStyleA ? (
            <>
              <button className="relative group overflow-hidden px-4.5 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-white bg-[#8b5cf6] rounded-full transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm">
                Explore More
              </button>
              <div className="flex gap-3 text-[#8c7c6c]/50">
                <InstagramIcon size={14} className="hover:text-[#c084fc] cursor-pointer transition-colors" />
                <Search size={14} className="hover:text-[#c084fc] cursor-pointer transition-colors" />
                <Mail size={14} className="hover:text-[#c084fc] cursor-pointer transition-colors" />
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4 text-[#8c7c6c]/50">
              <div className="flex gap-3">
                <InstagramIcon size={14} className="hover:text-[#c084fc] cursor-pointer transition-colors" />
                <Search size={14} className="hover:text-[#c084fc] cursor-pointer transition-colors" />
                <Mail size={14} className="hover:text-[#c084fc] cursor-pointer transition-colors" />
                <Bookmark size={14} className="hover:text-[#c084fc] cursor-pointer transition-colors" />
              </div>
              <span className="text-[10px] font-bold text-[#8c7c6c]/60">@morning.sketch</span>
            </div>
          )}
        </div>
      </div>

      {/* 風格 B / AB 時的進度圓環區 */}
      {!isStyleA && (
        <div className="relative z-10 flex gap-4 pr-4 drop-shadow-[0_4px_10px_rgba(0,0,0,0.15)] bg-theme-surface-deep/40 p-4.5 rounded-2xl backdrop-blur-md border border-white/10 self-start mt-2">
          {renderCircle(animatedProgress.p1, "stroke-[var(--brand-aurora-2)]", "lines")}
          {renderCircle(animatedProgress.p2, "stroke-[var(--brand-aurora-3)]", "colors")}
          {renderCircle(animatedProgress.p3, "stroke-theme-success-soft", "details")}
        </div>
      )}
    </div>
  );
}
