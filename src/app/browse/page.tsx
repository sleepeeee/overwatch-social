"use client";

import { useState } from "react";
import { Search, RotateCcw, Gamepad2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import TopBar from "@/components/TopBar";
import { useAuth } from "@/context/AuthContext";

// 導入三個獨立子分頁廣場
import OverwatchSquare from "@/components/square/OverwatchSquare";
import ValorantSquare from "@/components/square/ValorantSquare";
import LoLSquare from "@/components/square/LoLSquare";

type GameId = "ow" | "val" | "lol";

const gameTabs: Array<{ id: GameId; label: string; subtitle: string; icon: string; status?: string }> = [
  { id: "ow", label: "Overwatch", subtitle: "鬥陣特工分區", icon: "🥞" },
  { id: "val", label: "Valorant", subtitle: "特戰英豪分區", icon: "🎯", status: "即將開放" },
  { id: "lol", label: "LoL", subtitle: "英雄聯盟分區", icon: "👑", status: "即將開放" },
];

export default function BrowsePage() {
  const { authLoading } = useAuth();
  const [activeGame, setActiveGame] = useState<GameId>("ow");
  const [searchQuery, setSearchQuery] = useState("");

  const handleResetSearch = () => {
    setSearchQuery("");
  };

  if (authLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[600px] gap-4">
        <div className="w-12 h-12 border-4 border-[#82b7cc] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 text-sm font-bold animate-pulse">正在與名片大廳大門連接中...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <TopBar />
      <div className="ow-glass-panel p-4 md:px-5 md:py-4 space-y-4">
        <div className="text-left space-y-3">
          <span className="soft-home-badge uppercase">名片廣場</span>

          <div className="flex flex-col gap-2 md:grid md:grid-cols-[auto,1fr] md:items-start md:gap-x-4">
            <div className="min-w-0">
              <h1 className="text-[1.7rem] md:text-[1.95rem] font-extrabold tracking-tight text-[#3e2723] flex items-center gap-2 leading-none">
                <Gamepad2 className="text-[#82b7cc]" size={24} />
                多遊戲玩家招募大廳
              </h1>
            </div>

            <p className="text-[#8c7c6c] font-semibold text-[13px] md:text-[14px] leading-relaxed md:pt-1 md:max-w-none">
              保留你熟悉的廣場節奏，換上和首頁同一個晨霧紙感宇宙。搜尋今天想一起開局的人，或先逛逛不同遊戲分區。
            </p>
          </div>
        </div>

        <div className="relative w-full max-w-2xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8c7c6c]/70" size={18} />
          <Input
            type="text"
            placeholder="搜尋玩家 BattleTag、常用英雄、留言關鍵字或 MBTI..."
            className="pl-10 pr-10 bg-white/60 border-[#8c7c6c]/18 focus:border-[#82b7cc] focus:ring-1 focus:ring-[#82b7cc]/30 text-[#5d4037] text-sm rounded-2xl py-5 shadow-[0_10px_30px_-22px_rgba(140,124,108,0.22)]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={handleResetSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#8c7c6c] hover:text-red-500 transition-colors cursor-pointer border-none bg-transparent"
              title="清空搜尋"
            >
              <RotateCcw size={14} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2.5 justify-center md:justify-start">
        {gameTabs.map((game) => {
          const isSelected = activeGame === game.id;
          return (
            <button
              key={game.id}
              onClick={() => setActiveGame(game.id)}
              className={`browse-tab active:scale-95 cursor-pointer min-w-[156px] ${isSelected ? "browse-tab-active" : ""}`}
            >
              <div className="flex items-center gap-2">
                <span className="text-[15px] leading-none">{game.icon}</span>
                <span className="text-[13px] font-black text-[#3e2723]">{game.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold text-[#8c7c6c]">{game.subtitle}</span>
                {game.status && <span className="browse-tab-status text-[#8c7c6c]">{game.status}</span>}
              </div>
            </button>
          );
        })}
        </div>
      </div>

      <div className="w-full pt-2">
        {activeGame === "ow" && <OverwatchSquare searchQuery={searchQuery} />}
        {activeGame === "val" && <ValorantSquare />}
        {activeGame === "lol" && <LoLSquare />}
      </div>
    </div>
  );
}
