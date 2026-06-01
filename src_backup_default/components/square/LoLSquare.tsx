"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Shield, Sparkles } from "lucide-react";

export default function LoLSquare() {
  const MOCK_LOL_PLAYERS = [
    { id: "lol-1", tag: "FakerFan#LOL", msg: "中路專精，喜歡雷茲/阿祈爾，操作拉滿！尋找打野雙排衝大師 🌸", mbti: "INTJ", role: "Mid / carry" },
    { id: "lol-2", tag: "T1Fighting#LOL", msg: "下路 ADC 專精，輔助求保，輸出保證不暴斃 ⚔️", mbti: "ESTJ", role: "ADC / active" },
    { id: "lol-3", tag: "HappySupport#LOL", msg: "主玩貓咪/露璐，插眼勤快，心態無比開朗歡樂 🐈", mbti: "ENFP", role: "Support / chill" },
  ];

  return (
    <div className="space-y-8 w-full filter grayscale opacity-75 animate-[fadeIn_0.4s_ease-out]">
      {/* 頂部即將推出提示 */}
      <div className="ow-glass-panel p-5 border border-dashed border-[#8c7c6c]/25 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#8c7c6c]/10 flex items-center justify-center text-[#8c7c6c]">
            <Shield size={20} className="animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-black text-[#3e2723]">英雄聯盟交友廣場 👑</h3>
            <p className="text-[10px] text-[#8c7c6c] font-semibold mt-0.5">League of Legends Social Square</p>
          </div>
        </div>
        <Badge className="bg-[#8c7c6c]/15 text-[#8c7c6c] border border-[#8c7c6c]/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest animate-pulse">
          微影黃光監控中：即將推出
        </Badge>
      </div>

      {/* 3 欄灰階質感 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">
        {MOCK_LOL_PLAYERS.map((player) => (
          <div
            key={player.id}
            className="w-full max-w-[360px] bg-white/50 border border-[#8c7c6c]/15 rounded-[24px] p-5 flex flex-col justify-between h-[320px] shadow-sm hover:scale-[1.01] transition-transform duration-300"
          >
            <div>
              <div className="flex justify-between items-center border-b border-dashed border-[#8c7c6c]/15 pb-2.5 mb-3">
                <span className="text-[10px] font-black text-[#8c7c6c]/80 tracking-widest uppercase">LEAGUE OF LEGENDS</span>
                <span className="bg-[#8c7c6c]/8 border border-[#8c7c6c]/15 px-2 py-0.5 rounded-full text-[9px] font-black">
                  TW
                </span>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-black text-[#3e2723] flex items-center gap-1.5">
                  <span className="text-[#8c7c6c] font-extrabold text-xs">UID:</span> {player.tag}
                </h4>
                
                {/* 灰階立繪佔位 */}
                <div className="w-full h-24 bg-[#e0e0e0]/20 rounded-xl border border-[#8c7c6c]/8 flex flex-col items-center justify-center text-[#8c7c6c]/30 gap-1 shadow-inner select-none">
                  <Sparkles size={16} className="animate-pulse" />
                  <span className="text-[9px] font-extrabold tracking-widest uppercase">英雄立繪曝光區</span>
                </div>

                <p className="text-xs text-[#8c7c6c] font-semibold leading-relaxed line-clamp-2 px-1">
                  {player.msg}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#8c7c6c]/10 flex justify-between items-center">
              <span className="text-[10px] text-[#8c7c6c] font-bold">定位：{player.role}</span>
              <span className="bg-[#8c7c6c]/8 text-[#8c7c6c] px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase">
                {player.mbti}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
