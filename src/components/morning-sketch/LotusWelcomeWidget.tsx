"use client";

import React, { useState } from "react";

export default function LotusWelcomeWidget() {
  const [activeStep, setActiveStep] = useState(1);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  const steps = [
    { num: "01", label: "templates" },
    { num: "02", label: "resources" },
    { num: "03", label: "colorings" },
    { num: "04", label: "and more" }
  ];

  return (
    <div 
      className="relative flex flex-col items-center justify-between p-6 glass-panel w-full h-[320px] text-center"
      style={{
        boxShadow: "0 10px 40px -10px rgba(var(--theme-accent-rgb), 0.1)"
      }}
    >
      {/* 水彩風格背景發光環 */}
      <div className="absolute top-[20%] w-[180px] h-[180px] rounded-full bg-gradient-to-tr from-[#82b7cc]/10 to-[#f5d46b]/10 blur-2xl pointer-events-none z-0" />

      {/* 精緻自繪多層漸變蓮花 SVG */}
      <div className="relative z-10 w-44 h-44 flex items-center justify-center pt-2">
        <svg viewBox="0 0 100 100" className="w-full h-full transform hover:scale-105 active:scale-98 transition-transform duration-500 cursor-pointer drop-shadow-[0_4px_12px_rgba(130,183,204,0.25)]">
          <defs>
            {/* 蓮花花瓣的主體漸層 */}
            <linearGradient id="lotus-petal" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#82b7cc" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#f5d46b" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#f3e0a7" stopOpacity="0.9" />
            </linearGradient>
            
            {/* 側瓣漸層 */}
            <linearGradient id="lotus-side" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#82b7cc" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#f5d46b" stopOpacity="0.7" />
            </linearGradient>
          </defs>

          {/* 底部綠葉座 */}
          <path d="M 50,78 C 36,78 28,70 28,70 C 40,73 50,78 50,78 C 50,78 60,73 72,70 C 72,70 64,78 50,78 Z" fill="#a0a29f" opacity="0.4" />

          {/* 後層花瓣 */}
          <path d="M 50,72 C 30,62 32,45 50,22 C 68,45 70,62 50,72 Z" fill="url(#lotus-petal)" opacity="0.65" />
          
          {/* 中後側瓣 */}
          <path d="M 50,72 C 24,65 18,48 35,32 C 45,46 50,60 50,72 Z" fill="url(#lotus-side)" opacity="0.55" />
          <path d="M 50,72 C 76,65 82,48 65,32 C 55,46 50,60 50,72 Z" fill="url(#lotus-side)" opacity="0.55" />

          {/* 中前側瓣 */}
          <path d="M 50,72 C 26,72 22,58 40,42 C 46,55 50,66 50,72 Z" fill="url(#lotus-petal)" opacity="0.8" />
          <path d="M 50,72 C 74,72 78,58 60,42 C 54,55 50,66 50,72 Z" fill="url(#lotus-petal)" opacity="0.8" />

          {/* 最前層花瓣 */}
          <path d="M 50,72 C 36,65 38,52 50,30 C 62,52 64,65 50,72 Z" fill="url(#lotus-petal)" />
          
          {/* 蓮蓬核心發光點 */}
          <circle cx="50" cy="56" r="3" fill="#faf8f5" opacity="0.9" className="animate-pulse" />
        </svg>
      </div>

      {/* 歡迎文字與標籤說明 */}
      <div className="relative z-10 space-y-1.5 pt-2">
        <h2 className="text-xl font-extrabold text-[#3e2723] uppercase tracking-widest leading-none">
          WELCOME TO LOTUS
        </h2>
        <div className="flex justify-center items-center gap-1.5 text-[9px] font-black text-[#8c7c6c]/60 uppercase tracking-widest">
          {steps.map((s, idx) => (
            <React.Fragment key={s.label}>
              <span className={activeStep === idx + 1 ? "text-[#82b7cc]" : ""}>{s.label}</span>
              {idx < steps.length - 1 && <span className="opacity-40">|</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* 01-04 步進圓形水波紋按鈕組 */}
      <div className="relative z-10 flex gap-4 pb-2">
        {steps.map((s, idx) => {
          const stepNum = idx + 1;
          const isActive = activeStep === stepNum;
          const isHovered = hoveredStep === stepNum;

          return (
            <button
              key={s.num}
              onClick={() => setActiveStep(stepNum)}
              onMouseEnter={() => setHoveredStep(stepNum)}
              onMouseLeave={() => setHoveredStep(null)}
              className="relative w-8 h-8 flex items-center justify-center text-[10px] font-black tracking-tighter text-[#8c7c6c] hover:text-[#3e2723] transition-all duration-300 rounded-full"
            >
              {/* 按鈕本體背景與多層邊框 */}
              <div 
                className={`absolute inset-0 rounded-full border transition-all duration-500 flex items-center justify-center ${
                  isActive 
                    ? "bg-[#faf8f5] border-[#82b7cc]/60 shadow-[0_2px_10px_rgba(130,183,204,0.25)] scale-110" 
                    : "bg-white/30 border-[#8c7c6c]/15 hover:border-[#8c7c6c]/40 hover:bg-white/50"
                }`}
              />

              {/* 核心文字 */}
              <span className="relative z-10 font-mono tracking-tighter">{s.num}</span>

              {/* 水波紋擴散（Ripple Effect） */}
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
