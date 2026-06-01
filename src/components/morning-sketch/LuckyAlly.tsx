"use client";

import React, { useState } from "react";
import { Sparkles, RefreshCw, Compass } from "lucide-react";

interface LuckyPlayer {
  name: string;
  game: string;
  rank: string;
  mainHero: string;
  discord: string;
  quote: string;
  tags: string[];
}

const luckyGamers: LuckyPlayer[] = [
  {
    name: "Jett醬 (小夏)",
    game: "VALORANT",
    rank: "超凡入聖",
    mainHero: "Jett",
    discord: "xiaoxia_jett#1234",
    quote: "希望找個脾氣溫和的煙位搭檔，今晚衝神話！有麥克風，心態極好。",
    tags: ["歡迎開麥", "拒絕暴躁", "深夜開打"]
  },
  {
    name: "狂暴補師星奈",
    game: "League of Legends",
    rank: "鑽石",
    mainHero: "露璐 / 納米",
    discord: "hoshina_lol#9999",
    quote: "保人流輔助尋找主力射手雙排。AD敢衝我就敢保，絕不丟下你！",
    tags: ["團隊至上", "彈性積分", "語音交流"]
  },
  {
    name: "星辰",
    game: "Overwatch",
    rank: "鑽石",
    mainHero: "安娜",
    discord: "star_ow#7777",
    quote: "熟練睡針與禁療瓶，專注後排抬血，找心態成熟的輸出雙排！",
    tags: ["認真組排", "不開麥OK", "每日上線"]
  },
  {
    name: "空之境界 (阿空)",
    game: "Apex",
    rank: "大師",
    mainHero: "惡靈",
    discord: "sorano_apex#0001",
    quote: "尋找下班後一起開心打派、休閒或RK都可以的夥伴。輕鬆歡樂最重要！",
    tags: ["輕鬆歡樂", "下班上線", "有麥克風"]
  }
];

export default function LuckyAlly() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [player, setPlayer] = useState<LuckyPlayer | null>(null);

  const handleFlip = () => {
    const randomIndex = Math.floor(Math.random() * luckyGamers.length);
    setPlayer(luckyGamers[randomIndex]);
    setIsFlipped(true);
  };

  const handleReset = () => {
    setIsFlipped(false);
    setTimeout(() => {
      handleFlip();
    }, 200);
  };

  return (
    <div 
      className="glass-panel p-6 w-full h-[320px] flex flex-col justify-between transition-all duration-500 relative overflow-hidden text-center"
      style={{
        boxShadow: "0 10px 40px -10px rgba(var(--theme-accent-rgb), 0.08)"
      }}
    >
      {/* 慢速水粉光暈裝飾 */}
      <div 
        className="absolute -right-12 -top-12 w-28 h-28 rounded-full blur-2xl opacity-40 transition-all duration-700 pointer-events-none" 
        style={{
          backgroundColor: isFlipped ? "rgba(var(--theme-accent-rgb), 0.25)" : "rgba(var(--theme-highlight-rgb), 0.2)"
        }}
      />

      {/* 標題區 */}
      <div className="space-y-1.5 z-10 relative shrink-0">
        <h3 className="text-lg font-black text-[#3e2723] uppercase tracking-widest leading-none flex items-center justify-center gap-1.5">
          <Sparkles className="w-5 h-5 text-[#82b7cc]" />
          LUCKY ALLY
        </h3>
        <p className="text-xs font-bold text-[#8c7c6c]/60 uppercase tracking-widest">
          今日幸運隊友翻牌
        </p>
      </div>

      {!isFlipped ? (
        /* 未翻牌狀態：精緻禪意卡背 */
        <div className="my-auto flex flex-col items-center justify-center py-4 space-y-4 z-10 flex-grow">
          <div className="w-16 h-16 rounded-full bg-white/40 flex items-center justify-center border border-white/50 shadow-sm animate-pulse">
            <Compass className="w-7 h-7 text-[#8c7c6c]/70 rotate-45" />
          </div>
          <button
            onClick={handleFlip}
            className="calm-btn-primary font-bold text-xs tracking-widest uppercase px-6 py-3 rounded-xl cursor-pointer hover:scale-102 transition-transform duration-300 shadow-sm"
          >
            🎲 翻開今日靈魂卡
          </button>
        </div>
      ) : (
        /* 已翻牌狀態：精緻卡面 (解決對齊跑版問題，全面對齊卡片) */
        <div className="my-auto flex flex-col justify-between flex-grow animate-[fadeIn_0.4s_ease-out] z-10 pt-3 text-left">
          {/* 第一排：名字 與 聯絡 Discord */}
          <div className="flex justify-between items-center w-full">
            <span className="font-bold text-sm text-[#3e2723]">{player?.name}</span>
            <span className="text-[10px] font-mono text-[#8c7c6c] bg-white/50 px-2 py-0.5 rounded-lg border border-white/50 shrink-0">
              {player?.discord}
            </span>
          </div>

          {/* 第二排：遊戲、段位、主玩的標籤組 (精緻 Badge 水平排版對齊卡片) */}
          <div className="flex items-center gap-2 mt-2 flex-wrap w-full">
            <span className="text-[9px] px-1.5 py-0.2 rounded-md font-bold uppercase tracking-wider text-white bg-[#82b7cc] whitespace-nowrap">
              {player?.game}
            </span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-md font-bold text-[#5d4037] bg-white/40 border border-[#8c7c6c]/15 whitespace-nowrap">
              段位: {player?.rank}
            </span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-md font-bold text-[#5d4037] bg-white/40 border border-[#8c7c6c]/15 whitespace-nowrap">
              主玩: {player?.mainHero}
            </span>
          </div>

          {/* 第三排：手感發言區 */}
          <div className="bg-white/40 border border-white/60 rounded-xl p-2.5 my-2 min-h-[64px] flex items-center shadow-[inset_0_1px_2px_rgba(74,62,61,0.01)] w-full">
            <p className="text-[#3e2723] text-[12.5px] font-normal leading-relaxed italic opacity-95">
              &ldquo;{player?.quote}&rdquo;
            </p>
          </div>

          {/* 第四排：標籤與再次尋找 */}
          <div className="flex justify-between items-center pt-2.5 border-t border-[#8c7c6c]/10 w-full shrink-0">
            <div className="flex gap-1.5">
              {player?.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-[#82b7cc]/10 text-[#5d4037]/80">
                  #{tag}
                </span>
              ))}
            </div>
            <button
              onClick={handleReset}
              className="text-[#8c7c6c] hover:text-[#3e2723] text-[10.5px] font-bold tracking-widest uppercase flex items-center gap-1 transition-colors duration-300 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              再次尋找
            </button>
          </div>
        </div>
      )}

      {/* 禪意小字 */}
      {!isFlipped && (
        <div className="text-xs font-normal italic text-[#8c7c6c]/50 text-center tracking-wider pt-2 border-t border-[#8c7c6c]/10 shrink-0">
          &ldquo;命運會指引那個與你最有默契的靈魂。&rdquo;
        </div>
      )}
    </div>
  );
}
