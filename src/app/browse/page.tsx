"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

// 導入三個獨立子分頁廣場
import OverwatchDirectory from "@/components/browse/overwatch/OverwatchDirectory";
import ValorantSquare from "@/components/square/ValorantSquare";
import LoLSquare from "@/components/square/LoLSquare";

type GameId = "ow" | "val" | "lol";

const gameTabs: Array<{ id: GameId; label: string; optionLabel: string }> = [
  { id: "ow", label: "Overwatch", optionLabel: "Overwatch" },
  { id: "val", label: "Valorant", optionLabel: "Valorant" },
  { id: "lol", label: "League of Legends", optionLabel: "League of Legends" },
];

export default function BrowsePage() {
  const [activeGame, setActiveGame] = useState<GameId>("ow");

  return (
    <div className="relative min-h-screen z-10 selection:bg-auroraMint/30 text-zinc-100 max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* 全螢幕無縫大氣漸層 */}
      <div className="fixed inset-0 ambient-space-glows pointer-events-none z-0"></div>

      <section className="space-y-8 animate-fade-in relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/[0.04] pb-6">
          <div className="space-y-2">
            <h1 className="font-sans font-bold text-3xl text-white tracking-[0.05em] flex flex-wrap items-baseline gap-3">
              玩家展示館
              <span className="font-cinzel font-light text-xs tracking-[0.2em] text-auroraMint uppercase">
                Lobby Directory
              </span>
            </h1>
            <p className="text-xs text-zinc-300 font-light leading-relaxed max-w-3xl">
              請安靜瀏覽下方玩家的遊戲人格。複製他們的金鑰（UID），並在適當的夜晚，於遊戲世界中展開您的微光旅程。
            </p>
          </div>
          <Link
            href="/profile"
            className="px-4 py-2.5 rounded-lg border border-white/10 hover:border-auroraMint/30 bg-white/[0.01] hover:bg-auroraMint/5 text-xs text-zinc-300 hover:text-white transition-all duration-300 font-mono tracking-wider flex items-center justify-center space-x-2"
          >
            <span>管理我的特工帳戶</span>
            <span>✦</span>
          </Link>
        </div>

        {/* Game Select Panel */}
        <div className="glass-card p-6 rounded-xl space-y-4">
          <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">
            選擇遊戲星系 // Game Directory
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-4 items-center">
            <div className="flex items-center space-x-2 max-w-md">
              <span className="text-[11px] text-zinc-400 whitespace-nowrap font-mono">星系:</span>
              <div className="relative w-full">
                <select
                  value={activeGame}
                  onChange={(e) => setActiveGame(e.target.value as GameId)}
                  className="h-11 w-full appearance-none rounded-lg border border-white/[0.08] bg-black/40 pl-3 pr-10 text-xs font-semibold text-zinc-200 transition-all duration-300 focus:border-auroraMint/50 focus:outline-none"
                >
                  {gameTabs.map((game) => (
                    <option key={game.id} value={game.id} className="bg-obsidian text-zinc-300">
                      {game.optionLabel}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
              </div>
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              先選擇遊戲，再使用該遊戲專區內的搜尋、伺服器與遊玩習慣篩選。
            </p>
          </div>
        </div>

        {/* 子廣場元件常駐 DOM 控制 */}
        <div className="artifact-gallery atmosphere-content w-full pt-2 relative z-10">
          <div className={activeGame === "ow" ? "block" : "hidden"}>
            <OverwatchDirectory />
          </div>
          <div className={activeGame === "val" ? "block" : "hidden"}>
            <ValorantSquare />
          </div>
          <div className={activeGame === "lol" ? "block" : "hidden"}>
            <LoLSquare />
          </div>
        </div>
      </section>
    </div>
  );
}
