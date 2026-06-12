"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Sparkles, RefreshCw, Compass } from "lucide-react";

interface LuckyPlayer {
  name: string;
  game: string;
  rank: string;
  mainHero: string;
  discord: string;
  quote: string;
  tags: string[];
  avatarUrl: string;
}

const luckyGamers: LuckyPlayer[] = [
  {
    name: "Jett醬 (小夏)",
    game: "VALORANT",
    rank: "超凡入聖",
    mainHero: "Jett",
    discord: "xiaoxia_jett#1234",
    quote: "希望找個脾氣溫和的煙位搭檔，今晚衝神話！有麥克風，心態極好。",
    tags: ["歡迎開麥", "拒絕暴躁", "深夜開打"],
    avatarUrl: "/images/avatars/avatar_female_cheerful_square.png"
  },
  {
    name: "狂暴補師星奈",
    game: "League of Legends",
    rank: "鑽石",
    mainHero: "露璐 / 納米",
    discord: "hoshina_lol#9999",
    quote: "保人流輔助尋找主力射手雙排。AD敢衝我就敢保，絕不丟下你！",
    tags: ["團隊至上", "彈性積分", "語音交流"],
    avatarUrl: "/images/avatars/avatar_female_elegant_square.png"
  },
  {
    name: "星辰",
    game: "Overwatch",
    rank: "鑽石",
    mainHero: "安娜",
    discord: "star_ow#7777",
    quote: "熟練睡針與禁療瓶，專注後排抬血，找心態成熟的輸出雙排！",
    tags: ["認真組排", "不開麥OK", "每日上線"],
    avatarUrl: "/images/avatars/avatar_male_calm_square.png"
  },
  {
    name: "空之境界 (阿空)",
    game: "Apex",
    rank: "大師",
    mainHero: "惡靈",
    discord: "sorano_apex#0001",
    quote: "尋找下班後一起開心打派、休閒或RK都可以的夥伴。輕鬆歡樂最重要！",
    tags: ["輕鬆歡樂", "下班上線", "有麥克風"],
    avatarUrl: "/images/avatars/avatar_male_sunny_square.png"
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
        /* 已翻牌狀態：玩家身份卡片骨架 */
        <div className="my-auto flex flex-col justify-between flex-grow animate-[fadeIn_0.4s_ease-out] z-10 pt-3 text-left gap-2.5">
          <div className="flex items-start gap-3 w-full min-w-0">
            <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-white/60 bg-white/45 shadow-sm shrink-0">
              {player?.avatarUrl && (
                <Image
                  src={player.avatarUrl}
                  alt={`${player.name} 頭貼`}
                  fill
                  sizes="48px"
                  className="object-cover"
                  draggable={false}
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2 min-w-0">
                <span className="font-extrabold text-sm text-[#3e2723] leading-snug truncate">{player?.name}</span>
                <span className="text-[10px] font-mono text-[#8c7c6c] bg-white/50 px-2.5 py-1 rounded-full border border-white/60 shrink-0 max-w-[132px] truncate">
                  {player?.discord}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-2 flex-wrap w-full">
                <span className="soft-home-badge bg-[#82b7cc]/85 text-white border-[#82b7cc]/40">
                  {player?.game}
                </span>
                <span className="soft-home-badge soft-home-badge-muted">
                  段位：{player?.rank}
                </span>
                <span className="soft-home-badge soft-home-badge-sand">
                  主玩：{player?.mainHero}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white/40 border border-white/60 rounded-2xl p-3 min-h-[66px] flex items-center shadow-[inset_0_1px_2px_rgba(74,62,61,0.01)] w-full">
            <p className="text-[#3e2723] text-[12.5px] font-medium leading-relaxed italic opacity-95 line-clamp-2">
              &ldquo;{player?.quote}&rdquo;
            </p>
          </div>

          <div className="flex justify-between items-center gap-3 pt-2.5 border-t border-[#8c7c6c]/10 w-full shrink-0">
            <div className="flex flex-wrap gap-1.5 min-w-0">
              {player?.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="soft-home-badge">
                  #{tag.replace(/^#+/, '')}
                </span>
              ))}
            </div>
            <button
              onClick={handleReset}
              className="text-[#8c7c6c] hover:text-[#3e2723] text-[10.5px] font-bold tracking-widest uppercase flex items-center gap-1 transition-colors duration-300 cursor-pointer shrink-0"
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
