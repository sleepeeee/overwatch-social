"use client";

import React from "react";
import { Sliders, Palette, Layers } from "lucide-react";

interface StylePickerProps {
  activeStyle: "A" | "B" | "AB";
  setActiveStyle: (style: "A" | "B" | "AB") => void;
}

export default function StylePicker({ activeStyle, setActiveStyle }: StylePickerProps) {
  const stylesList = [
    { id: "A" as const, label: "Style A (Dashboard)", icon: Sliders, color: "hover:text-[#8c7c6c] border-[#8c7c6c]/20" },
    { id: "B" as const, label: "Style B (Watercolor Art)", icon: Palette, color: "hover:text-[#82b7cc] border-[#82b7cc]/20" },
    { id: "AB" as const, label: "Style A+B (Hybrid Fusion)", icon: Layers, color: "hover:text-purple-400 border-purple-400/20" }
  ];

  return (
    <div 
      className="glass-panel px-5 py-3 flex items-center justify-between gap-6 w-full max-w-2xl mx-auto shadow-sm"
      style={{
        boxShadow: "0 8px 30px -10px rgba(var(--theme-accent-rgb), 0.08)"
      }}
    >
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-[#82b7cc] animate-pulse" />
        <span className="text-[10px] font-black text-[#8c7c6c] tracking-widest uppercase">
          視覺風格展示器
        </span>
      </div>

      {/* 風格膠囊按鈕組 */}
      <div className="flex gap-2">
        {stylesList.map((s) => {
          const Icon = s.icon;
          const isActive = activeStyle === s.id;

          return (
            <button
              key={s.id}
              onClick={() => setActiveStyle(s.id)}
              className={`relative px-4 py-2 rounded-xl flex items-center gap-2 text-[10px] font-black tracking-widest uppercase transition-all duration-300 border ${
                isActive 
                  ? "bg-[#faf8f5] text-[#3e2723] border-[#82b7cc] shadow-sm scale-105" 
                  : `bg-white/30 border-transparent text-[#8c7c6c] ${s.color} hover:bg-white/60`
              }`}
            >
              <Icon size={12} className={isActive ? "text-[#82b7cc]" : ""} />
              {s.id}
            </button>
          );
        })}
      </div>
    </div>
  );
}
