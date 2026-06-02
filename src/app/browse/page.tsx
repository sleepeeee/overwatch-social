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
      className="max-w-6xl mx-auto px-4 py-8 space-y-6 relative min-h-screen overflow-x-hidden"
    >
      {/* 🗾 Version B 和紙底紋層 */}
      <div className="washi-paper-texture" aria-hidden="true" />

      <TopBar />

      {/* 💗 Premium 水彩裝飾流體背景 (右上與左下雙層暈染) */}
      <div className="watercolor-mist-bg top-[-10%] right-[-10%] animate-[mistFloatA_20s_infinite_alternate]" />
      <div className="watercolor-mist-bg bottom-[5%] left-[-15%] scale-125 animate-[mistFloatB_25s_infinite_alternate]" />

      {/* 🌿 D1 浮動竹葉 - 右側遠景裝飾 */}
      <div
        className="ms-d1-floating-leaf-bamboo ms-float-slow pointer-events-none select-none"
        style={{
          position: 'absolute',
          top: '8%',
          right: '-2%',
          width: '110px',
          height: '180px',
          opacity: 0.55,
          zIndex: 0,
        }}
      />

      {/* 🌿 D1 浮動柳葉 - 左下角裝飾 */}
      <div
        className="ms-d1-floating-leaf-willow ms-float-slow pointer-events-none select-none"
        style={{
          position: 'absolute',
          bottom: '15%',
          left: '-1%',
          width: '80px',
          height: '140px',
          opacity: 0.4,
          zIndex: 0,
          animationDelay: '3s',
        }}
      />

      {/* 🪶 D1 羽毛 - 右上角遠景（版本A獨有） */}
      <div
        className="ms-d1-floating-feather-ink ms-float-slow pointer-events-none select-none"
        style={{
          position: 'absolute',
          top: '3%',
          right: '-3%',
          width: '90px',
          height: '170px',
          opacity: 0.42,
          zIndex: 0,
          animationDelay: '6s',
          willChange: 'transform',
        }}
      />

      {/* 🍃 D1 左中段柳葉（版本A獨有） */}
      <div
        className="ms-d1-floating-leaf-willow ms-float-slow pointer-events-none select-none"
        style={{
          position: 'absolute',
          top: '38%',
          left: '-1.5%',
          width: '65px',
          height: '115px',
          opacity: 0.32,
          zIndex: 0,
          animationDelay: '0s',
          willChange: 'transform',
        }}
      />

      {/* 💧 D2 漣漪光圈 - 右側中段背景裝飾 */}
      <div
        className="ms-d2-circle-ripple-accent ms-ripple-hover pointer-events-none select-none"
        style={{
          position: 'absolute',
          top: '30%',
          right: '5%',
          width: '180px',
          height: '180px',
          opacity: 0.35,
          zIndex: 0,
        }}
      />

      {/* 🌸 莫蘭迪紙感手稿標頭 - 垂直層級重構 */}
      <div className="text-left space-y-2 relative z-10 animate-[fadeIn_0.5s_ease-out] pb-1 select-none">
        
        {/* C2 星火裝飾 - 標題右側角落 */}
        <div
          className="ms-c2-accent-spark-sand pointer-events-none select-none"
          style={{
            position: 'absolute',
            top: '0px',
            right: '160px',
            width: '36px',
            height: '36px',
            opacity: 0.7,
          }}
        />
        {/* C2 小星形裝飾 - 副標旁 */}
        <div
          className="ms-c2-accent-tiny-star-blue pointer-events-none select-none"
          style={{
            position: 'absolute',
            top: '10px',
            right: '120px',
            width: '22px',
            height: '22px',
            opacity: 0.55,
          }}
        />

        {/* 💛 Version B: 金粉菱形大（標題左上） */}
        <div
          className="ms-c2-accent-diamond-sand gold-dust-diamond-lg pointer-events-none select-none"
          style={{
            position: 'absolute',
            top: '-4px',
            left: '0px',
            zIndex: 2,
          }}
        />
        {/* 💛 Version B: 金粉星火中（標題右側） */}
        <div
          className="ms-c2-accent-spark-sand gold-dust-diamond-md pointer-events-none select-none"
          style={{
            position: 'absolute',
            top: '8px',
            right: '180px',
            zIndex: 2,
          }}
        />
        {/* 💛 Version B: 金粉小星（h1 文字右方） */}
        <div
          className="ms-c2-accent-tiny-star-sand gold-dust-diamond-sm pointer-events-none select-none"
          style={{
            position: 'absolute',
            top: '20px',
            left: '230px',
            zIndex: 2,
          }}
        />

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

      {/* ─── Version B 禪境分隔線 ─── */}
      <div className="kasumi-zen-divider relative z-10" />

      {/* 🌊 B1 波浪分隔線（版本A獨有） */}
      <div className="ms-wave-divider-enhanced mt-3 -mx-4" />

      {/* 🔍 獨立太空艙搜尋層 (Capsule Search Box) */}
      <div className="relative w-full max-w-2xl mx-auto z-10">
        {/* 🫧 C1 有機圓形 - 搜尋框左側（版本A獨有） */}
        <div
          className="ms-c1-organic-circle-blue pointer-events-none select-none"
          style={{
            position: 'absolute',
            left: '-18px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '52px',
            height: '52px',
            opacity: 0.55,
            zIndex: 1,
          }}
        />
        {/* 💧 Version B: 大漣漪背景（禪境） */}
        <div
          className="ms-d2-circle-ripple-accent pointer-events-none select-none"
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: '240px',
            height: '240px',
            opacity: 0.10,
            zIndex: 0,
          }}
        />
        <div className="relative w-full bg-white/45 backdrop-blur-2xl border-2 border-white/70 rounded-[24px] p-1.5 shadow-[0_15px_35px_-20px_rgba(140,124,108,0.15),inset_0_1.5px_2.5px_rgba(255,255,255,0.9)] focus-within:border-[#82b7cc]/60 transition-all duration-300 flex items-center group/search">
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

      {/* 🥞 獨立分區 Tab Pills 軌道 */}
      <div className="flex flex-wrap gap-2.5 justify-center md:justify-start relative z-10 w-full animate-[fadeIn_0.5s_ease-out] relative">
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
        {/* 💧 D2 漣漪 - Tab 右端（版本A獨有） */}
        <div
          className="ms-d2-circle-ripple-accent pointer-events-none select-none"
          style={{
            position: 'absolute',
            right: '-8px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '110px',
            height: '110px',
            opacity: 0.22,
            zIndex: 0,
          }}
        />
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
