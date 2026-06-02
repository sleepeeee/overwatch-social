"use client";

import { useState } from "react";
import { Search, RotateCcw } from "lucide-react";
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
    <div 
      data-theme-expert="true"
      className="max-w-6xl mx-auto px-4 py-8 space-y-6 relative min-h-screen"
    >
      <TopBar />

      {/* 💗 Premium 水彩裝飾流體背景 (右上與左下雙層暈染) */}
      <div className="watercolor-mist-bg top-[-10%] right-[-10%] animate-[mistFloatA_20s_infinite_alternate]" />
      <div className="watercolor-mist-bg bottom-[5%] left-[-15%] scale-125 animate-[mistFloatB_25s_infinite_alternate]" />

      {/* 🌸 莫蘭迪紙感手稿標頭 - 垂直層級重構 */}
      <div className="text-left space-y-2 relative z-10 animate-[fadeIn_0.5s_ease-out] pb-1 select-none">
        
        {/* 1. 極簡小副標 (Low-profile Subtitle) */}
        <div className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-[#8c7c6c]/60 flex items-center gap-1.5">
          <span>Lobby Directory</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#82b7cc]/40" />
          <span>名片廣場</span>
        </div>

        {/* 2. 精緻標題 (Elegant Typography without digital icons) */}
        <h1 className="text-xl md:text-2xl font-black tracking-tight text-[#3e2723] leading-none pt-0.5">
          多遊戲玩家招募大廳
        </h1>

        {/* 3. 手稿感細線 (Fine-line Divider) */}
        <div className="w-12 h-[1px] bg-gradient-to-r from-[#8c7c6c]/25 to-transparent my-2" />

        {/* 4. 溫潤引言 (Warm Description) */}
        <p className="text-[#8c7c6c]/90 font-medium text-[12px] md:text-[13px] leading-relaxed max-w-xl">
          保留你熟悉的廣場節奏，換上晨霧紙感宇宙。搜尋今天想一起開局的夥伴，或自由瀏覽不同的遊戲分區。
        </p>
      </div>

      {/* 🔍 獨立太空艙搜尋層 (Capsule Search Box) */}
      <div className="relative w-full max-w-2xl mx-auto bg-white/45 backdrop-blur-2xl border-2 border-white/70 rounded-[24px] p-1.5 shadow-[0_15px_35px_-20px_rgba(140,124,108,0.15),inset_0_1.5px_2.5px_rgba(255,255,255,0.9)] focus-within:border-[#82b7cc]/60 transition-all duration-300 relative z-10 flex items-center group/search">
        <Search className="ml-3.5 text-[#8c7c6c]/70 transition-colors shrink-0 group-focus-within/search:text-[#82b7cc]" size={18} />
        <Input
          type="text"
          placeholder="搜尋玩家 BattleTag、常用英雄、留言關鍵字或 MBTI..."
          className="w-full bg-transparent border-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-none focus-visible:border-none shadow-none text-[#5d4037] text-sm py-4 pl-3 pr-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            onClick={handleResetSearch}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-[#8c7c6c] hover:text-red-500 transition-colors cursor-pointer border-none bg-transparent"
            title="清空搜尋"
          >
            <RotateCcw size={14} />
          </button>
        )}
      </div>

      {/* 🥞 獨立分區 Tab Pills 軌道 */}
      <div className="flex flex-wrap gap-2.5 justify-center md:justify-start relative z-10 w-full animate-[fadeIn_0.5s_ease-out]">
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

      {/* 🚀 子廣場元件常駐 DOM 控制，消除 unmount 詭異 Loading 動畫 */}
      <div className="w-full pt-2 relative z-10 animate-[fadeIn_0.5s_ease-out]">
        <div className={activeGame === "ow" ? "block" : "hidden"}>
          <OverwatchSquare searchQuery={searchQuery} />
        </div>
        <div className={activeGame === "val" ? "block" : "hidden"}>
          <ValorantSquare />
        </div>
        <div className={activeGame === "lol" ? "block" : "hidden"}>
          <LoLSquare />
        </div>
      </div>
    </div>
  );
}
