"use client";

import React from "react";
import { Shield, Sparkles } from "lucide-react";

export default function LoLSquare({ isPremiumStyle = true }: { isPremiumStyle?: boolean }) {
  const MOCK_LOL_PLAYERS = [
    { id: "lol-1", tag: "FakerFan#LOL", msg: "中路專精，喜歡雷茲/阿祈爾，操作拉滿！尋找打野雙排衝大師 🌸", mbti: "INTJ", role: "Mid / carry" },
    { id: "lol-2", tag: "T1Fighting#LOL", msg: "下路 ADC 專精，輔助求保，輸出保證不暴斃 ⚔️", mbti: "ESTJ", role: "ADC / active" },
    { id: "lol-3", tag: "HappySupport#LOL", msg: "主玩貓咪/露璐，插眼勤快，心態無比開朗歡樂 🐈", mbti: "ENFP", role: "Support / chill" },
  ];

  return (
    <div className="space-y-8 w-full animate-[fadeIn_0.4s_ease-out]">
      <div className="ow-glass-panel p-5 border border-dashed border-[#8c7c6c]/25 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#d8a070]/12 flex items-center justify-center text-[#d8a070]">
            <Shield size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-[#3e2723]">英雄聯盟交友廣場 👑</h3>
            <p className="text-[10px] text-[#8c7c6c] font-semibold mt-0.5">Preview Gallery</p>
          </div>
        </div>
        <span className="soft-home-badge soft-home-badge-sand text-[10px] uppercase">即將開放</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">
        {MOCK_LOL_PLAYERS.map((player) => (
          <div
            key={player.id}
            className="browse-preview-card relative w-full max-w-[360px] p-5 flex flex-col justify-between h-[320px] opacity-70 pointer-events-none select-none"
          >
            <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-center gap-1 bg-amber-400/90 text-amber-900 text-[9px] font-black py-0.5 tracking-widest rounded-t-2xl">
              ⚠ 示範資料 — 非真實玩家
            </div>
            <div>
              <div className="flex justify-between items-center border-b border-dashed border-[#8c7c6c]/15 pb-2.5 mb-3">
                <span className="text-[10px] font-black text-[#8c7c6c]/80 tracking-widest uppercase">LEAGUE OF LEGENDS</span>
                <span className="soft-home-badge soft-home-badge-compact soft-home-badge-sand">
                  TW
                </span>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-black text-[#3e2723] flex items-center gap-1.5">
                  <span className="text-[#8c7c6c] font-extrabold text-xs">UID:</span> {player.tag}
                </h4>
                
                <div className="w-full h-24 rounded-2xl border border-[#d8a070]/16 bg-[linear-gradient(135deg,rgba(216,160,112,0.18),rgba(255,255,255,0.42),rgba(130,183,204,0.12))] flex flex-col items-center justify-center text-[#7b7368] gap-1 shadow-[inset_0_1px_6px_rgba(140,124,108,0.06)] select-none">
                  <Sparkles size={16} />
                  <span className="text-[9px] font-extrabold tracking-widest uppercase">英雄展館預告區</span>
                </div>

                <p className="text-xs text-[#8c7c6c] font-semibold leading-relaxed line-clamp-2 px-1">
                  {player.msg}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#8c7c6c]/10 flex justify-between items-center">
              <span className="text-[10px] text-[#8c7c6c] font-bold">定位：{player.role}</span>
              <span className="soft-home-badge soft-home-badge-compact soft-home-badge-sand text-[9px] uppercase">
                {player.mbti}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
