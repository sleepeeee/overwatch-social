"use client";

import React, { useState } from "react";
import { Users, Calendar } from "lucide-react";
import HomeCaptureHud from "@/components/morning-sketch/HomeCaptureHud";

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

  const isStyleA = styleMode === "A";

  return (
    <div className="space-y-5 w-full">
      {/* 📅 [Lobby Events] 玩家揪團行事曆面板 */}
      <div 
        className="glass-panel p-5 w-full"
        style={{
          boxShadow: "0 10px 40px -10px rgba(var(--theme-accent-rgb), 0.08)"
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="flex items-center gap-1.5 text-[12px] font-black uppercase tracking-widest leading-none text-[#3e2723]">
              <Calendar className="h-4 w-4 text-[#82b7cc]" />
              LOBBY EVENTS
            </h2>
            <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-[#8c7c6c]/60">
              本週玩家揪團行事曆
            </p>
          </div>
          <span className="animate-pulse rounded-full bg-[#82b7cc]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#82b7cc]">
            LIVE ACTIVE
          </span>
        </div>

        {/* 揪團活動列表 (徹底防止折行與擠壓跑版) */}
        <div className="space-y-3">
          {events.map((event) => {
            const isFull = event.currentCount >= event.maxCount;

            return (
              <div 
                key={event.id}
                className="group relative flex w-full min-w-0 items-center justify-between overflow-hidden rounded-2xl border border-[#8c7c6c]/10 bg-white/20 px-3 py-2.5 transition-all duration-300 hover:border-[#82b7cc]/30 hover:bg-white/40 shadow-[0_2px_8px_rgba(0,0,0,0.01)]"
              >
                {/* 漸變底色 */}
                <div className={`absolute inset-0 bg-gradient-to-r ${event.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

                <div className="relative z-10 mr-2 flex flex-grow items-center gap-2.5 min-w-0">
                  {/* 左側日期圓框 (不縮水) */}
                  <div className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-xl border border-[#8c7c6c]/15 bg-white/40 text-[#5d4037] shadow-sm">
                    <span className="font-mono text-[8.5px] font-bold leading-none opacity-60">{event.date.split("/")[0]}</span>
                    <span className="mt-0.5 font-mono text-[11px] font-black leading-none">{event.date.split("/")[1]}</span>
                  </div>

                  {/* 中間資訊 (min-w-0 防止文字溢出跑版) */}
                  <div className="min-w-0 flex-grow">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="whitespace-nowrap rounded-md bg-[#82b7cc]/80 px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wider text-white">
                        {event.game}
                      </span>
                      <span className="flex items-center gap-0.5 whitespace-nowrap text-[9px] font-extrabold tracking-widest text-[#8c7c6c]/70">
                        <Users size={9} />
                        {event.currentCount}/{event.maxCount}
                      </span>
                    </div>
                    <h3 className="mt-1 text-[11px] font-extrabold leading-tight tracking-wider text-[#5d4037] truncate" title={event.title}>
                      {event.title}
                    </h3>
                  </div>
                </div>

                {/* 互動加入按鈕 (固定寬度，絕不被擠壓) */}
                <div className="relative z-10 shrink-0">
                  <button 
                    onClick={() => handleJoin(event.id)}
                    disabled={isFull && !event.joined}
                    className={`flex min-w-[52px] cursor-pointer items-center justify-center gap-0.5 whitespace-nowrap rounded-lg border px-2 py-1 text-[8px] font-black uppercase tracking-widest transition-all duration-300 ${
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

      {/* 🎨 [風格 B/AB 專用] 首頁版縮尺 HUD */}
      {!isStyleA && (
        <HomeCaptureHud />
      )}
    </div>
  );
}
