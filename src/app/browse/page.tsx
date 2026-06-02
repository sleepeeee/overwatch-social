"use client";

import { useState } from "react";
import { Search, RotateCcw, Compass } from "lucide-react";
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

// 🧭 天體星盤元件 (Astrolabe SVG)
const CelestialAstrolabe = () => (
  <svg 
    viewBox="0 0 100 100" 
    className="w-10 h-10 text-[#8c7c6c]/70 stroke-[1.2] shrink-0 animate-[spin_120s_linear_infinite]"
    fill="none" 
    stroke="currentColor"
  >
    {/* 外層天體軌道 */}
    <circle cx="50" cy="50" r="46" strokeDasharray="3 3" opacity="0.5" />
    <circle cx="50" cy="50" r="40" />
    <circle cx="50" cy="50" r="32" strokeDasharray="8 4" opacity="0.7" />
    
    {/* 八向刻度線 */}
    <line x1="50" y1="4" x2="50" y2="96" opacity="0.4" />
    <line x1="4" y1="50" x2="96" y2="50" opacity="0.4" />
    <line x1="17.5" y1="17.5" x2="82.5" y2="82.5" strokeDasharray="2 4" opacity="0.3" />
    <line x1="17.5" y1="82.5" x2="82.5" y2="17.5" strokeDasharray="2 4" opacity="0.3" />
    
    {/* 核心北極星四角星芒 */}
    <path 
      d="M50 12 L54 46 L88 50 L54 54 L50 88 L46 54 L12 50 L46 46 Z" 
      fill="currentColor" 
      fillOpacity="0.08" 
    />
    
    {/* 內層裝飾環與中心天體 */}
    <circle cx="50" cy="50" r="10" strokeDasharray="3 1" />
    <circle cx="50" cy="50" r="3" fill="currentColor" />
    
    {/* 漂浮的小星點 */}
    <circle cx="28" cy="28" r="1.5" fill="currentColor" opacity="0.8" />
    <circle cx="72" cy="72" r="1.5" fill="currentColor" opacity="0.8" />
  </svg>
);

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
      className="max-w-6xl mx-auto px-4 py-8 space-y-6 relative min-h-screen overflow-x-hidden pb-12"
    >


      <TopBar />

      {/* 🥞 視覺總監指定：首頁同款 Soft UI + Organic Shapes 背景裝飾層 (只用 ms-blob 類別，不新增漸變色與 icon) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none">
        <div 
          className="ms-blob ms-blob-sand absolute top-[-5%] right-[-5%] w-[60vw] h-[60vw] max-w-[650px] max-h-[650px] opacity-[0.25] animate-mist-a" 
          aria-hidden="true"
        />
        <div 
          className="ms-blob ms-blob-yellow absolute bottom-[10%] left-[-8%] w-[65vw] h-[65vw] max-w-[700px] max-h-[700px] opacity-[0.22] animate-mist-b" 
          aria-hidden="true"
        />
        <div 
          className="ms-blob ms-blob-rose absolute top-[35%] left-[20%] w-[50vw] h-[50vw] max-w-[500px] max-h-[500px] opacity-[0.16] animate-mist-c" 
          aria-hidden="true"
        />
      </div>

      {/* Layout A: 雙欄雜誌排版 (4:8) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-center relative z-10 mb-10 select-none">
        {/* 左側：精緻標頭 (md:col-span-4) */}
        <div className="md:col-span-4 space-y-4 animate-[fadeIn_0.5s_ease-out]">
          {/* 星盤徽章與標籤融合 */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-[#82b7cc]/8 border border-[#82b7cc]/20 backdrop-blur-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]">
              <CelestialAstrolabe />
            </div>
            <div className="space-y-0.5">
              <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#8c7c6c]/60">
                Lobby Directory
              </div>
              <div className="text-[10px] font-bold text-[#82b7cc]">
                名片廣場
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-[#3e2723] leading-none pt-0.5">
              多遊戲玩家招募大廳
            </h1>
            <div className="w-12 h-[1px] bg-gradient-to-r from-[#8c7c6c]/25 to-transparent my-2" />
            <p className="text-[#8c7c6c]/90 font-medium text-[12px] md:text-[13px] leading-relaxed">
              保留你熟悉的廣場節奏，換上晨霧紙感宇宙。搜尋今天想一起開局的夥伴。
            </p>
          </div>
        </div>

        {/* 右側：搜尋太空艙與分區選取器 (md:col-span-8) */}
        <div className="md:col-span-8 flex flex-col gap-4 animate-[fadeIn_0.5s_ease-out]">
          {/* 🔍 搜尋太空艙 */}
          <div className="relative w-full">
            <div className="relative w-full bg-[#fefcf8]/90 border border-[#8c7c6c]/18 rounded-full p-1.5 shadow-[0_20px_50px_rgba(140,124,108,0.04),inset_0_1px_0_rgba(255,255,255,0.95)] focus-within:border-[#82b7cc]/50 transition-all duration-300 flex items-center group/search relative z-10">
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
          </div>

          {/* 🥞 分區 Tab */}
          <div className="flex flex-wrap gap-2.5 justify-center md:justify-start w-full">
            {gameTabs.map((game) => {
              const isSelected = activeGame === game.id;
              return (
                <button
                  key={game.id}
                  onClick={() => setActiveGame(game.id)}
                  className={`browse-tab active:scale-95 cursor-pointer min-w-[130px] sm:min-w-[156px] ${isSelected ? "browse-tab-active" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] leading-none">{game.icon}</span>
                    <span className="text-[12px] font-black text-[#3e2723]">{game.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-semibold text-[#8c7c6c]">{game.subtitle}</span>
                    {game.status && <span className="browse-tab-status text-[#8c7c6c] text-[8px]">{game.status}</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
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
