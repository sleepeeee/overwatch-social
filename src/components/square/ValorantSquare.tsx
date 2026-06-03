"use client";

import React from "react";
import { Target, Sparkles } from "lucide-react";

export default function ValorantSquare({ isPremiumStyle = true }: { isPremiumStyle?: boolean }) {
  const MOCK_VAL_PLAYERS = [
    { id: "val-1", tag: "JettGod#VAL", msg: "專精決鬥者捷特，專門繞後，心態穩定！求先鋒保我 🎯", mbti: "ESTP", weapon: "Vandal / Jett" },
    { id: "val-2", tag: "SageHealMe#VAL", msg: "主玩聖祈/賢者，溫柔且有麥克風，快樂排位不氣餒 🌸", mbti: "ISFJ", weapon: "Phantom / Sage" },
    { id: "val-3", tag: "FadeOut#VAL", msg: "專職控場 Fade / Omen，喜歡打戰術配合，歡迎組隊！", mbti: "INTJ", weapon: "Sheriff / Omen" },
  ];

  return (
    <div className="space-y-8 w-full animate-[fadeIn_0.4s_ease-out]">
      <div className="ow-glass-panel p-5 border border-dashed border-[#8c7c6c]/25 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#82b7cc]/12 flex items-center justify-center text-[#82b7cc]">
            <Target size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-[#3e2723]">特戰英豪交友廣場 🎯</h3>
            <p className="text-[10px] text-[#8c7c6c] font-semibold mt-0.5">Preview Gallery</p>
          </div>
        </div>
        <span className="soft-home-badge text-[10px] uppercase">即將開放</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">
        {MOCK_VAL_PLAYERS.map((player) => (
          <div
            key={player.id}
            className="browse-preview-card relative w-full max-w-[360px] p-5 flex flex-col justify-between h-[320px] opacity-70 pointer-events-none select-none"
          >
            <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-center gap-1 bg-amber-400/90 text-amber-900 text-[9px] font-black py-0.5 tracking-widest rounded-t-2xl">
              ⚠ 示範資料 — 非真實玩家
            </div>
            <div>
              <div className="flex justify-between items-center border-b border-dashed border-[#8c7c6c]/15 pb-2.5 mb-3">
                <span className="text-[10px] font-black text-[#8c7c6c]/80 tracking-widest uppercase">VALORANT</span>
                <span className="soft-home-badge soft-home-badge-compact">
                  Asia
                </span>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-black text-[#3e2723] flex items-center gap-1.5">
                  <span className="text-[#8c7c6c] font-extrabold text-xs">UID:</span> {player.tag}
                </h4>

                <div className="w-full h-24 rounded-2xl border border-[#82b7cc]/15 bg-[linear-gradient(135deg,rgba(130,183,204,0.18),rgba(255,255,255,0.4),rgba(216,160,112,0.12))] flex flex-col items-center justify-center text-[#7b7368] gap-1 shadow-[inset_0_1px_6px_rgba(140,124,108,0.06)] select-none">
                  <Sparkles size={16} />
                  <span className="text-[9px] font-extrabold tracking-widest uppercase">特務展館預告區</span>
                </div>

                <p className="text-xs text-[#8c7c6c] font-semibold leading-relaxed line-clamp-2 px-1">
                  {player.msg}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#8c7c6c]/10 flex justify-between items-center">
              <span className="text-[10px] text-[#8c7c6c] font-bold">偏好：{player.weapon}</span>
              <span className="soft-home-badge soft-home-badge-compact text-[9px] uppercase">
                {player.mbti}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
