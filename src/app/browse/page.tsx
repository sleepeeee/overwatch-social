"use client";

import { useState } from "react";
import { Search, RotateCcw, Users, Gamepad2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import TopBar from "@/components/TopBar";
import { useAuth } from "@/context/AuthContext";

// 導入三個獨立子分頁廣場
import OverwatchSquare from "@/components/square/OverwatchSquare";
import ValorantSquare from "@/components/square/ValorantSquare";
import LoLSquare from "@/components/square/LoLSquare";

type GameId = "ow" | "val" | "lol";

const gameTabs: Array<{ id: GameId; label: string; icon: string }> = [
  { id: "ow", label: "鬥陣特工 Overwatch", icon: "🥞" },
  { id: "val", label: "特戰英豪 Valorant (即將推出)", icon: "🎯" },
  { id: "lol", label: "英雄聯盟 League of Legends (即將推出)", icon: "👑" },
];

export default function BrowsePage() {
  const { user, authLoading } = useAuth();
  const isLoggedIn = !!user;
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
      {/* 頂部裝飾標頭 */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-[#8c7c6c]/10 pb-6">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#3e2723] flex items-center justify-center md:justify-start gap-2">
            <Gamepad2 className="text-[#82b7cc] animate-pulse" /> 多遊戲名片社交大廳
          </h1>
          <p className="text-[#8c7c6c] mt-1 font-semibold text-sm">
            跨遊戲與各路特工、英雄異世相逢！切換下方遊戲卡片，開啟專屬交友廣場。
          </p>
        </div>
      </div>

      {/* 遊戲 Tabs 切換區 (動感高定霓虹膠囊 Tabs) */}
      <div className="flex flex-wrap gap-3 justify-center md:justify-start">
        {gameTabs.map((game) => {
          const isSelected = activeGame === game.id;
          return (
            <button
              key={game.id}
              onClick={() => setActiveGame(game.id)}
              className={`text-xs font-black px-5 py-3 rounded-2xl border transition-all duration-300 active:scale-95 cursor-pointer flex items-center gap-2 ${
                isSelected
                  ? "bg-[#82b7cc] border-[#82b7cc] text-white shadow-md shadow-[#82b7cc]/20 scale-102"
                  : "bg-white/50 border-[#8c7c6c]/18 text-[#8c7c6c] hover:bg-[#8c7c6c]/5 hover:border-[#8c7c6c]/40"
              }`}
            >
              <span>{game.icon}</span>
              <span>{game.label}</span>
            </button>
          );
        })}
      </div>

      {/* 全域搜尋列 */}
      <div className="relative w-full max-w-xl mx-auto md:mx-0">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8c7c6c]/70" size={18} />
        <Input
          type="text"
          placeholder="搜尋玩家 BattleTag、常用英雄、留言關鍵字或 MBTI..."
          className="pl-10 pr-10 bg-white/60 border-[#8c7c6c]/20 focus:border-[#82b7cc] focus:ring-1 focus:ring-[#82b7cc]/30 text-[#5d4037] text-sm rounded-xl py-5"
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

      {/* 動態渲染子廣場 (支援 CSS fade-in) */}
      <div className="w-full pt-2">
        {activeGame === "ow" && <OverwatchSquare searchQuery={searchQuery} />}
        {activeGame === "val" && <ValorantSquare />}
        {activeGame === "lol" && <LoLSquare />}
      </div>
    </div>
  );
}
