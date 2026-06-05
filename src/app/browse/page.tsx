"use client";

import { useState } from "react";
import { Search, RotateCcw, Compass, PanelRight, X } from "lucide-react";
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleResetSearch = () => {
    setSearchQuery("");
  };

  if (authLoading) {
    return (
      <div className="brand-portal-shell atmosphere-shell midnight-room-depth max-w-6xl mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[600px] gap-4">
        <div className="w-12 h-12 border-4 border-[#82b7cc] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 text-sm font-bold animate-pulse">正在與名片大廳大門連接中...</p>
      </div>
    );
  }

  return (
    <div 
      className="brand-portal-shell atmosphere-shell midnight-room-depth max-w-6xl mx-auto px-4 py-8 space-y-8 relative min-h-screen overflow-x-hidden pb-32"
    >
      <aside className="brand-composition-rail absolute -left-28 top-28 hidden xl:flex flex-col items-center gap-4 z-20" aria-hidden="true">
        <span className="brand-rail-mark" />
        <span className="brand-rail-title" data-label="AFTER MIDNIGHT" />
        <span className="brand-rail-subtitle" data-label="PLAYER IDENTITY HUB" />
      </aside>

      <div className="atmosphere-content">
        <TopBar />
      </div>

      {/* 🌸 莫蘭迪紙感手稿標頭 - 垂直層級重構 (無背板) */}
      <div className="atmosphere-content text-left space-y-2 relative z-10 animate-[fadeIn_0.5s_ease-out] pb-1 select-none max-w-2xl mx-auto flex justify-between items-start">
        <div className="space-y-2 flex-grow">
          <div className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-[#8c7c6c]/60 flex items-center gap-1.5">
            <span>Lobby Directory</span>
            <span className="w-1.5 h-1.5 rounded-full bg-accent/40" />
            <span>名片廣場</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-foreground leading-none pt-0.5">
            多遊戲玩家招募大廳
          </h1>
          <div className="w-12 h-[1px] bg-gradient-to-r from-[#8c7c6c]/25 to-transparent my-2" />
          <p className="text-muted-foreground font-medium text-[12px] md:text-[13px] leading-relaxed">
            保留你熟悉的廣場節奏，換上全息極光與手稿紙感宇宙。搜尋今天想一起開局的夥伴，或自由瀏覽不同的遊戲分區。
          </p>
        </div>

        {/* 打開抽屜按鈕 */}
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="ml-4 p-2.5 rounded-xl border border-[#8c7c6c]/20 hover:border-purple-500/40 bg-card/40 hover:bg-purple-950/20 text-[#8c7c6c] hover:text-purple-300 transition-all duration-300 cursor-pointer shadow-sm group shrink-0"
          title="開啟沙龍工具箱 (待開發)"
        >
          <PanelRight size={18} className="group-hover:rotate-6 transition-transform" />
        </button>
      </div>

      {/* 獨立搜尋與分區藥丸滑動軌道 - 垂直介電隔離層 */}
      <div className="atmosphere-content flex flex-col gap-6 relative z-10 mb-6 max-w-2xl mx-auto select-none animate-[fadeIn_0.5s_ease-out]">
        {/* 🔍 搜尋太空艙 */}
        <div className="relative w-full">
          <div className="quiet-lounge-surfaces relative w-full bg-card/60 backdrop-blur-xl border border-border rounded-full p-1.5 shadow-[0_20px_50px_rgba(140,124,108,0.04),inset_0_1px_0_rgba(255,255,255,0.95)] focus-within:border-accent/50 transition-all duration-300 flex items-center group/search relative z-10">
            <Search className="ml-3.5 text-muted-foreground transition-colors shrink-0 group-focus-within/search:text-accent" size={18} />
            <Input
              type="text"
              placeholder="搜尋玩家 BattleTag、常用英雄、留言關鍵字或 MBTI..."
              className="w-full bg-transparent border-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-none focus-visible:border-none shadow-none text-foreground text-sm py-4 pl-3 pr-10"
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
        <div className="flex flex-wrap gap-2.5 justify-center w-full">
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
                  <span className="text-[12px] font-black text-foreground">{game.label}</span>
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

      {/* 🚀 子廣場元件常駐 DOM 控制，消除 unmount 詭異 Loading 動畫 */}
      <div className="artifact-gallery atmosphere-content w-full pt-2 relative z-10 animate-[fadeIn_0.5s_ease-out]">
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

      {/* 🌌 可收合面板 (Drawer/Slide-over) placeholder - (待開發) */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 w-80 bg-[#0d111b]/95 backdrop-blur-xl border-l border-purple-500/20 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 h-full flex flex-col justify-between text-left">
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <h3 className="text-xs font-bold tracking-widest text-purple-300 font-mono uppercase">
                LOBBY WIDGETS (待開發)
              </h3>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer border-none bg-transparent"
                title="關閉面板"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="w-12 h-12 rounded-full border border-dashed border-purple-500/30 flex items-center justify-center text-purple-400 animate-pulse">
                ⏳
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-300">側欄組件工具箱</p>
                <p className="text-[10px] text-slate-500">翻牌幸友與揪團活動將收納於此</p>
              </div>
            </div>
          </div>
          <div className="text-[9px] font-mono text-slate-600 text-center uppercase tracking-widest">
            After Midnight Hub V2
          </div>
        </div>
      </div>
    </div>
  );
}
