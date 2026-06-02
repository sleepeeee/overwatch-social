"use client";

import React, { useState, useRef } from "react";
import { Users, Calendar, Copy, Check, Plus } from "lucide-react";

interface LobbyEvent {
  id: string;
  date: string;
  game: string;
  title: string;
  currentCount: number;
  maxCount: number;
  joined: boolean;
  color: string;
}

interface FeaturedArtistsProps {
  styleMode: "A" | "B" | "AB";
}

export default function FeaturedArtists({ styleMode }: FeaturedArtistsProps) {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // 模擬揪團資料
  const [events, setEvents] = useState<LobbyEvent[]>([
    { 
      id: "ev-1", 
      date: "06/03", 
      game: "VALORANT", 
      title: "深夜歡樂十人內戰團", 
      currentCount: 6, 
      maxCount: 10, 
      joined: false, 
      color: "from-[#82b7cc]/15 to-transparent" 
    },
    { 
      id: "ev-2", 
      date: "06/05", 
      game: "LoL", 
      title: "彈性積分缺一雙人路", 
      currentCount: 4, 
      maxCount: 5, 
      joined: false, 
      color: "from-[#f5d46b]/15 to-transparent" 
    },
    { 
      id: "ev-3", 
      date: "06/07", 
      game: "Overwatch", 
      title: "自訂工坊趣味娛樂房", 
      currentCount: 7, 
      maxCount: 8, 
      joined: false, 
      color: "from-rose-400/10 to-transparent" 
    }
  ]);

  const paletteColors = [
    { hex: "#8c7c6c", name: "暖灰沙" },
    { hex: "#a0a29f", name: "中灰水泥" },
    { hex: "#82b7cc", name: "莫蘭迪柔藍" },
    { hex: "#f5d46b", name: "薑黃" }
  ];

  const handleJoin = (id: string) => {
    setEvents(prev => 
      prev.map(ev => {
        if (ev.id === id) {
          if (ev.joined) {
            // 退團
            return { ...ev, joined: false, currentCount: ev.currentCount - 1 };
          } else {
            // 入團
            if (ev.currentCount < ev.maxCount) {
              return { ...ev, joined: true, currentCount: ev.currentCount + 1 };
            }
          }
        }
        return ev;
      })
    );
  };

  const handleCopyColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopiedColor(null), 1500);
  };

  const isStyleA = styleMode === "A";

  return (
    <div className="space-y-6 w-full">
      {/* 📅 [Lobby Events] 玩家揪團行事曆面板 */}
      <div 
        className="glass-panel p-6 w-full"
        style={{
          boxShadow: "0 10px 40px -10px rgba(var(--theme-accent-rgb), 0.08)"
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-sm font-black text-[#3e2723] uppercase tracking-widest leading-none flex items-center gap-1.5">
              <Calendar className="w-5 h-5 text-[#82b7cc]" />
              LOBBY EVENTS
            </h2>
            <p className="text-xs font-black text-[#8c7c6c]/60 uppercase tracking-widest mt-1">
              本週玩家揪團行事曆
            </p>
          </div>
          <span className="text-[10px] font-bold text-[#82b7cc] bg-[#82b7cc]/10 px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse">
            LIVE ACTIVE
          </span>
        </div>

        {/* 揪團活動列表 (徹底防止折行與擠壓跑版) */}
        <div className="space-y-4">
          {events.map((event) => {
            const isFull = event.currentCount >= event.maxCount;

            return (
              <div 
                key={event.id}
                className="relative overflow-hidden rounded-2xl border border-[#8c7c6c]/10 bg-white/20 p-3 flex items-center justify-between transition-all duration-300 hover:border-[#82b7cc]/30 hover:bg-white/40 group shadow-[0_2px_8px_rgba(0,0,0,0.01)] w-full min-w-0"
              >
                {/* 漸變底色 */}
                <div className={`absolute inset-0 bg-gradient-to-r ${event.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

                <div className="relative z-10 flex items-center gap-3 min-w-0 flex-grow mr-2">
                  {/* 左側日期圓框 (不縮水) */}
                  <div className="w-9.5 h-9.5 rounded-xl bg-white/40 border border-[#8c7c6c]/15 flex flex-col items-center justify-center text-[#5d4037] shadow-sm shrink-0">
                    <span className="text-[9px] font-mono font-bold opacity-60 leading-none">{event.date.split("/")[0]}</span>
                    <span className="text-xs font-mono font-black leading-none mt-0.5">{event.date.split("/")[1]}</span>
                  </div>

                  {/* 中間資訊 (min-w-0 防止文字溢出跑版) */}
                  <div className="min-w-0 flex-grow">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md uppercase tracking-wider text-white bg-[#82b7cc]/80 whitespace-nowrap">
                        {event.game}
                      </span>
                      <span className="text-[10px] font-extrabold text-[#8c7c6c]/70 tracking-widest flex items-center gap-0.5 whitespace-nowrap">
                        <Users size={10} />
                        {event.currentCount}/{event.maxCount}
                      </span>
                    </div>
                    <h3 className="text-xs font-extrabold text-[#5d4037] tracking-wider mt-1.5 leading-tight truncate" title={event.title}>
                      {event.title}
                    </h3>
                  </div>
                </div>

                {/* 互動加入按鈕 (固定寬度，絕不被擠壓) */}
                <div className="relative z-10 shrink-0">
                  <button 
                    onClick={() => handleJoin(event.id)}
                    disabled={isFull && !event.joined}
                    className={`flex items-center justify-center gap-0.5 px-2 py-1 rounded-lg border text-[8.5px] font-black tracking-widest uppercase transition-all duration-300 cursor-pointer whitespace-nowrap min-w-[58px] ${
                      event.joined 
                        ? "bg-[#82b7cc]/20 border-[#82b7cc]/40 text-[#2a454d] font-bold" 
                        : isFull 
                          ? "bg-gray-100/50 border-gray-200 text-gray-400 cursor-not-allowed" 
                          : "bg-white/40 border-[#8c7c6c]/15 text-[#8c7c6c] hover:border-[#8c7c6c]/40 hover:bg-white"
                    }`}
                  >
                    {event.joined ? "已加入" : isFull ? "已滿" : "加入"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 🎨 [風格 B/AB 專用] 實體色譜色塊展示卡片 */}
      {!isStyleA && (
        <div 
          className="glass-panel p-6 w-full relative overflow-hidden"
          style={{
            boxShadow: "0 10px 40px -10px rgba(var(--theme-accent-rgb), 0.08)"
          }}
        >
          <div className="space-y-1 mb-4">
            <h2 className="text-sm font-black text-[#3e2723] uppercase tracking-widest leading-none">
              Today&apos;s Palette
            </h2>
            <p className="text-[9px] font-black text-[#8c7c6c]/60 uppercase tracking-widest">
              點擊色塊複製 Hex 色碼
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2.5">
            {paletteColors.map((color) => {
              const isCopied = copiedColor === color.hex;

              return (
                <button
                  key={color.hex}
                  onClick={() => handleCopyColor(color.hex)}
                  className="flex flex-col items-center gap-1.5 focus:outline-none group cursor-pointer"
                >
                  <div 
                    className="w-full h-11 rounded-xl shadow-sm border border-[#8c7c6c]/10 relative flex items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md group-hover:scale-105"
                    style={{ backgroundColor: color.hex }}
                  >
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center text-white">
                      {isCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={12} />}
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-[8px] font-black text-[#3e2723] truncate w-[48px] tracking-wider leading-none">
                      {color.name}
                    </p>
                    <p className="text-[7.5px] font-mono font-bold text-[#8c7c6c]/80 uppercase mt-0.5 tracking-tighter">
                      {color.hex}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {copiedColor && (
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-slate-900/80 text-white text-[9px] font-black tracking-wider uppercase backdrop-blur-sm border border-white/10 shadow-md animate-bounce">
              色碼 {copiedColor} 已複製！
            </div>
          )}
        </div>
      )}
    </div>
  );
}
