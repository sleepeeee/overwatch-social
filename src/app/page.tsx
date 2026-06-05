"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, Compass, Users, Moon, Heart, Shield, Layers, 
  Calendar, RefreshCw, X, BookOpen, Terminal, Activity, Info
} from "lucide-react";
import TopBar from "@/components/TopBar";
import { useTheme } from "@/context/ThemeContext";

// 匯入 Morning Sketch 風格組件
import FluidClipPath from "@/components/morning-sketch/FluidClipPath";
import LotusWelcomeWidget from "@/components/morning-sketch/LotusWelcomeWidget";
import FeaturedArtists from "@/components/morning-sketch/FeaturedArtists";
import LuckyAlly from "@/components/morning-sketch/LuckyAlly";

interface PlayerCard {
  id: string;
  name: string;
  game: string;
  rank: string;
  hero: string;
  tags: string[];
  message: string;
  avatarUrl: string;
}

// 靜態粒子資料，避免在 render 期間呼叫 Math.random 違反 purity 規範
const STARRY_PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  size: Math.random() * 2 + 1,
  top: Math.random() * 100,
  left: Math.random() * 100,
  delay: Math.random() * 5,
  duration: Math.random() * 4 + 4,
}));

const ZEN_PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  size: Math.random() * 2.5 + 1,
  top: Math.random() * 100,
  left: Math.random() * 100,
  delay: Math.random() * 5,
  duration: Math.random() * 5 + 5,
}));

// 預設三個核心玩家資料
const initialProfiles: PlayerCard[] = [
  { id: "p-1", name: "星辰", game: "Overwatch", rank: "鑽石", hero: "安娜", tags: ["認真組排", "不開麥OK"], message: "熟練睡針與禁療瓶，專注後排抬血，找心態成熟的輸出雙排！", avatarUrl: "/images/avatars/avatar_male_calm_square.png" },
  { id: "p-2", name: "Jett醬 (小夏)", game: "VALORANT", rank: "超凡入聖", hero: "Jett", tags: ["歡迎開麥", "拒絕暴躁"], message: "希望找個脾氣溫和的煙位搭檔，今晚衝神話！有麥克風，心態極好。", avatarUrl: "/images/avatars/avatar_female_cheerful_square.png" },
  { id: "p-3", name: "狂暴補師星奈", game: "LoL", rank: "鑽石", hero: "露璐", tags: ["團隊至上", "彈性積分"], message: "保人流輔助尋找主力射手雙排。AD敢衝我就敢保，絕不丟下你！", avatarUrl: "/images/avatars/avatar_female_elegant_square.png" },
];

// 用於動態生成模擬新加入玩家的池子
const gamePool = ["Overwatch", "VALORANT", "LoL", "Apex"];
const rankPool = ["黃金", "白金", "鑽石", "超凡入聖", "大師"];
const namesPool = ["星野小櫻", "瓦羅大師", "疾風之劍", "雷電將軍", "不服來戰", "快樂輔助星", "卡西迪傳奇", "夜露本露", "萌新求帶"];
const heroesPool: Record<string, string[]> = {
  Overwatch: ["安娜", "萊因哈特", "源氏", "慈悲", "半藏"],
  VALORANT: ["Jett", "Sage", "Reyna", "Omen", "Sova"],
  LoL: ["露璐", "阿里", "亞菲利歐", "犽宿", "李星"],
  Apex: ["惡靈", "尋血犬", "直布羅陀", "辛烷", "探路者"]
};
const messagesPool = [
  "今晚有缺人的車隊嗎？主玩輔助/煙位，語音暢通心態好！",
  "下班找休閒雙排夥伴，RK或NG都可以，歡樂為主不暴躁。",
  "來個實力相當的輸出搭檔，專精主坦，保人拉滿，盾牌極厚！",
  "尋找能一起進步的長久固定隊友，有麥克風，今晚直接開衝！",
  "只打歡樂休閒，輸贏無所謂，尋求能一邊聊天一邊玩的老司機~"
];
const tagsPool = ["快樂排位", "語音交流", "拒絕暴躁", "下班上線", "歡迎新手", "團隊至上"];

export default function Home() {
  const { theme } = useTheme();
  const [profiles, setProfiles] = useState<PlayerCard[]>(initialProfiles);
  
  // Lounge 主題 (樣式2) 的專用 Modal 狀態
  const [isJillModalOpen, setIsJillModalOpen] = useState(false);
  const [isLuckyAllyModalOpen, setIsLuckyAllyModalOpen] = useState(false);
  const [isEventsModalOpen, setIsEventsModalOpen] = useState(false);

  // 實作「有新卡片加入就替換掉最舊的卡片 (維持3張)」的動態模擬器
  useEffect(() => {
    const avatarPool = [
      "/images/avatars/avatar_female_elegant_square.png",
      "/images/avatars/avatar_female_cheerful_square.png",
      "/images/avatars/avatar_male_calm_square.png",
      "/images/avatars/avatar_male_sunny_square.png",
    ];

    const interval = setInterval(() => {
      const randomGame = gamePool[Math.floor(Math.random() * gamePool.length)];
      const gameHeroes = heroesPool[randomGame];
      const randomHero = gameHeroes[Math.floor(Math.random() * gameHeroes.length)];
      const randomName = namesPool[Math.floor(Math.random() * namesPool.length)];
      const randomRank = rankPool[Math.floor(Math.random() * rankPool.length)];
      const randomMessage = messagesPool[Math.floor(Math.random() * messagesPool.length)];
      const randomAvatar = avatarPool[Math.floor(Math.random() * avatarPool.length)];
      
      const shuffledTags = [...tagsPool].sort(() => 0.5 - Math.random());
      const randomTags = shuffledTags.slice(0, 2);

      const newPlayer: PlayerCard = {
        id: `p-${Date.now()}`,
        name: randomName,
        game: randomGame,
        rank: randomRank,
        hero: randomHero,
        tags: randomTags,
        message: randomMessage,
        avatarUrl: randomAvatar
      };

      // 新卡插最前，保留前兩張的 key，讓 React 只 remount 真正新的那張
      setProfiles(prev => [newPlayer, ...prev.slice(0, 2)]);
    }, 7000); // 每 7 秒模擬一次玩家新上線

    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = -(y - centerY) / 12;
    const rotateY = (x - centerX) / 12;
    
    card.style.setProperty("--mouse-x", `${(x / rect.width) * 100}%`);
    card.style.setProperty("--mouse-y", `${(y / rect.height) * 100}%`);
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    card.style.boxShadow = `0 25px 55px rgba(192, 132, 252, 0.15), 0 0 30px rgba(0, 0, 0, 0.6)`;
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    card.style.boxShadow = ``;
  };

  return (
    <div className="atmosphere-shell midnight-room-depth min-h-screen relative pb-32 transition-colors duration-500">
      {theme === "starry-midnight" && (
        <div className="starry-bg-container">
          <div className="starry-dust" />
          <div className="aurora-cloud-1" />
          <div className="aurora-cloud-2" />
        </div>
      )}
      <FluidClipPath />

      <main className="brand-portal-shell atmosphere-content transition-all duration-500 ease-out p-6 md:p-8 min-h-screen w-full max-w-7xl mx-auto px-4 md:px-8 pt-6">
        <aside className="brand-composition-rail absolute -left-20 top-28 hidden xl:flex flex-col items-center gap-4 z-20" aria-hidden="true">
          <span className="brand-rail-mark" />
          <span className="brand-rail-title" data-label="AFTER MIDNIGHT" />
          <span className="brand-rail-subtitle" data-label="PLAYER IDENTITY HUB" />
        </aside>
        
        <TopBar />

        {/* 根據不同主題，渲染完全不同的首頁骨架，徹底解決 UI 堆疊擁擠、缺乏主題性的問題 */}
        {theme === "starry-midnight" ? (
          /* =========================================================================
             🌌 樣式 5：星空漫步 (Constellation Odyssey) - 奢華、深邃、物理微動態
             ========================================================================= */
          <div className="space-y-12 max-w-7xl mx-auto z-10 relative">
            
            {/* 橫幅 (靜謐繁星深夜 雙欄) */}
            <div 
              className="relative overflow-hidden w-full rounded-[32px] border border-purple-500/10 p-6 sm:p-8 md:p-12 min-h-[460px] flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-12 shadow-[0_25px_60px_rgba(0,0,0,0.7)] animate-[fadeInUp_0.8s_ease-out] bg-[#0a0a12]/40"
            >
              {/* 背景圖片與遮罩，去霓虹格線 */}
              <div 
                className="absolute inset-0 z-0 bg-cover bg-center opacity-30 pointer-events-none"
                style={{ backgroundImage: "url('/images/banners/starry_midnight_banner.png')" }}
              />
              
              {/* 星塵粒子層 */}
              <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                {STARRY_PARTICLES.map((p) => (
                  <div
                    key={p.id}
                    className="starry-dust-particle"
                    style={{
                      width: `${p.size}px`,
                      height: `${p.size}px`,
                      top: `${p.top}%`,
                      left: `${p.left}%`,
                      animationDelay: `${p.delay}s`,
                      animationDuration: `${p.duration}s`
                    }}
                  />
                ))}
              </div>
              
              {/* 左側標語與導覽 */}
              <div className="relative z-10 space-y-6 max-w-xl text-center lg:text-left flex-grow">
                <div className="flex items-center justify-center lg:justify-start gap-2 text-purple-300/90 select-none">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                  <span className="text-[10px] font-bold tracking-[0.25em] uppercase font-mono">AFTER MIDNIGHT</span>
                  <span className="text-[10px] opacity-40">|</span>
                  <span className="text-[9px] font-bold tracking-[0.25em] uppercase text-purple-400 font-mono">CONSTELLATION ODYSSEY</span>
                </div>
                
                <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-medium leading-[1.3] text-white text-left font-serif-tc">
                  永遠都發生在<br />
                  <span className="text-purple-300 font-bold tracking-widest drop-shadow-[0_0_12px_rgba(192,132,252,0.4)]">
                    午夜之後。
                  </span>
                </h2>
                
                <p className="text-slate-300 text-xs md:text-sm leading-relaxed font-normal max-w-lg mx-auto lg:mx-0 text-left font-serif-tc opacity-90">
                  當指針越過子夜，喧囂散去。在這裡，我們用星軌相連，用名片點亮孤單的星空，幫助你找到能在耳麥裡分享勝負的靈魂伴侶。
                </p>

                <div className="flex flex-col sm:flex-row gap-3.5 pt-2 justify-center lg:justify-start">
                  <Link href="/browse">
                    <Button className="w-full sm:w-auto bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs tracking-widest uppercase px-6 py-5 rounded-full cursor-pointer hover:scale-102 transition-transform shadow-[0_4px_20px_rgba(192,132,252,0.4)] border border-purple-400/20">
                      探索星群
                    </Button>
                  </Link>
                  
                  <Link href="/profile">
                    <Button variant="outline" className="w-full sm:w-auto border-purple-500/20 text-purple-200 hover:text-white bg-purple-950/20 hover:bg-purple-900/30 font-bold text-xs tracking-widest uppercase px-6 py-5 rounded-full transition-all duration-300 cursor-pointer hover:scale-102">
                      登錄星軌
                    </Button>
                  </Link>
                </div>
              </div>

              {/* 右側：星夜磨砂手札卡片 */}
              <div 
                onClick={() => setIsJillModalOpen(true)}
                className="relative z-10 w-full lg:w-[320px] rounded-[24px] border border-purple-500/25 bg-slate-950/45 p-6 shadow-xl backdrop-blur-md cursor-pointer hover:border-purple-400/40 hover:shadow-[0_0_20px_rgba(192,132,252,0.1)] transition-all duration-500 text-left"
              >
                <div className="flex justify-between items-center pb-2 border-b border-purple-500/10 mb-4 font-mono text-xs text-purple-300">
                  <span>✍️ JILL&apos;S JOURNAL</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                </div>
                <div className="space-y-4">
                  <h4 className="font-extrabold text-white text-sm font-serif-tc">站長隨筆手札</h4>
                  <p className="text-slate-300 text-xs leading-relaxed font-light font-mono line-clamp-6">
                    歡迎來到 AFTER MIDNIGHT 的深夜沙龍。這個小小平台的誕生，是為了給在充滿排位高壓、爭執毒素的遊戲環境中感到倦怠的玩家，提供一個溫慢的避風港。在這裡，我們用名片點亮深夜的夜空。
                  </p>
                  <span className="text-[9px] font-mono text-purple-400 block pt-1 hover:underline">&gt; CLICK TO READ FULL LOG</span>
                </div>
              </div>
            </div>

            {/* 三欄 Widgets Row (與原創/手作版骨架相同，互動裝置下移) */}
            <div className="border border-purple-500/15 bg-black/40 backdrop-blur-xl p-6 rounded-[32px] shadow-sm relative overflow-hidden text-left">
              <div className="text-left mb-6 border-b border-purple-500/10 pb-3 z-10 relative flex justify-between items-center">
                <h3 className="text-xs font-bold tracking-widest text-purple-300 uppercase flex items-center gap-1.5 font-mono">
                  [ SYSTEM.WIDGET_LOBBY ]
                </h3>
                <span className="text-[9px] font-mono text-purple-400/50 uppercase animate-pulse">[ ORBIT CALIBRATED ]</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 z-10 relative">
                <div className="border border-purple-500/10 bg-slate-950/45 p-5 rounded-2xl shadow-sm">
                  <LuckyAlly />
                </div>
                
                {/* 行星公轉 SVG 互動裝置 */}
                <div className="border border-purple-500/10 bg-slate-950/45 p-5 rounded-2xl shadow-sm flex flex-col justify-between h-[320px]">
                  <div className="flex justify-between items-center border-b border-purple-500/10 pb-2 mb-2 font-mono text-xs text-purple-300">
                    <span>[ ORBITAL.DEVICE ]</span>
                    <span>[ INTERACTIVE ]</span>
                  </div>
                  <div className="relative w-full h-[220px] flex items-center justify-center">
                    <svg viewBox="0 0 800 640" className="w-full h-[180px] pointer-events-none drop-shadow-[0_0_30px_rgba(192,132,252,0.25)]">
                      <defs>
                        <linearGradient id="themeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#c084fc"/>
                            <stop offset="100%" stopColor="#a78bfa"/>
                        </linearGradient>
                        <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="8" result="blur"/>
                            <feMerge>
                                <feMergeNode in="blur"/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                        </filter>
                        <style>{`
                          .planetary-orbit-1 {
                              animation: orbitRotation 22s linear infinite;
                              transform-origin: 400px 330px;
                          }
                          .planetary-orbit-2 {
                              animation: orbitRotation 36s linear infinite reverse;
                              transform-origin: 400px 330px;
                          }
                          .fluffy-cloud {
                              fill: #09090e;
                              stroke: url(#themeGrad);
                              stroke-width: 1.2;
                              opacity: 0.85;
                              filter: drop-shadow(0 4px 10px rgba(0,0,0,0.5));
                              animation: driftCloud 8s ease-in-out infinite alternate;
                          }
                          .cosmic-crescent {
                              filter: drop-shadow(0 0 15px rgba(139, 92, 246, 0.45));
                              transform-origin: 400px 330px;
                              animation: moonFloat 6s ease-in-out infinite alternate;
                          }
                          @keyframes driftCloud {
                              0% { transform: translate(-8px, 5px); opacity: 0.6; }
                              100% { transform: translate(12px, -3px); opacity: 0.85; }
                          }
                          @keyframes moonFloat {
                              0% { transform: translateY(0px) rotate(0deg); }
                              100% { transform: translateY(-8px) rotate(1.5deg); }
                          }
                        `}</style>
                      </defs>
                      <g transform="translate(0, 10)">
                          <ellipse className="orbit-path" cx="400" cy="330" rx="195" ry="50" transform="rotate(-15 400 330)" fill="none" stroke="url(#themeGrad)" strokeWidth="1.8" />
                          <ellipse className="orbit-path" cx="400" cy="330" rx="210" ry="70" transform="rotate(-40 400 330)" fill="none" stroke="url(#themeGrad)" strokeWidth="1" strokeDasharray="10 8" />

                          <g className="planetary-orbit-1">
                              <g transform="translate(195, 0)">
                                  <circle cx="400" cy="330" r="6" fill="url(#themeGrad)" filter="url(#softGlow)"/>
                                  <circle cx="400" cy="330" r="10" fill="none" stroke="#c084fc" strokeWidth="0.5" opacity="0.5"/>
                              </g>
                          </g>
                          
                          <g className="planetary-orbit-2">
                              <g transform="translate(-210, 20)">
                                  <circle cx="400" cy="330" r="4.5" fill="#a78bfa" filter="url(#softGlow)"/>
                              </g>
                          </g>

                          <g className="cosmic-crescent">
                              <path d="M 400,170 A 150,150 0 0,1 400,470 A 136,143 0 0,0 400,170 Z" fill="url(#themeGrad)"/>
                          </g>

                          <g className="fluffy-cloud" transform="translate(0, 10)">
                              <path d="M 330,385 C 310,385 295,365 310,345 C 305,325 325,305 345,315 C 355,300 380,305 385,320 C 405,320 415,335 405,355 C 415,375 390,390 375,380 C 360,395 340,395 330,385 Z"/>
                              <path d="M 315,350 C 325,335 350,330 365,345" stroke="#c084fc" strokeWidth="0.6" fill="none" opacity="0.3"/>
                              <path d="M 335,370 C 350,360 380,362 390,372" stroke="#a78bfa" strokeWidth="0.6" fill="none" opacity="0.3"/>
                          </g>

                          <g className="main-star" transform="translate(0, -10)">
                              <circle cx="400" cy="170" r="10" fill="#c084fc" opacity="0.1" filter="url(#softGlow)"/>
                              <path d="M 400,155 C 400,165 405,170 415,170 C 405,170 400,185 C 400,175 395,170 385,170 C 395,170 400,165 400,155 Z" fill="url(#themeGrad)"/>
                          </g>

                          <g className="twinkling-star" transform="translate(100, 150)">
                              <path d="M 400,155 C 400,160 402,162 407,162 C 402,162 400,164 400,169 C 400,164 398,162 393,162 C 398,162 400,160 400,155 Z" fill="#a78bfa" opacity="0.8"/>
                          </g>
                      </g>
                    </svg>
                  </div>
                </div>

                <div className="border border-purple-500/10 bg-slate-950/45 p-5 rounded-2xl shadow-sm">
                  <FeaturedArtists styleMode="B" />
                </div>
              </div>
            </div>

            {/* 最新在大廳啟航的玩家 */}
            <section className="space-y-6 w-full pt-4">
              <div className="flex justify-between items-center px-1">
                <h3 className="text-sm font-bold text-purple-200 tracking-widest uppercase flex items-center gap-2 font-serif-tc">
                  <Users size={16} className="text-purple-400" />
                  🌌 星軌最新啟航玩家
                </h3>
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping inline-block" />
                  ORBIT ACTIVE
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-1 max-w-7xl mx-auto">
                {profiles.map((p, idx) => {
                  const isNew = idx === 0;
                  return (
                    <div 
                      key={p.id} 
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                      className={`glass-panel p-6 border border-purple-500/15 bg-[#0a0a12]/50 hover:bg-[#0c0c16]/75 shadow-lg flex flex-col justify-between h-[240px] transition-all duration-500 starry-glow-card ${
                        isNew ? "animate-card-slide" : ""
                      }`}
                      style={{
                        boxShadow: "0 15px 35px rgba(0, 0, 0, 0.4)"
                      }}
                    >
                      <div className="flex justify-between items-start gap-2 w-full">
                        <div className="flex items-center gap-3 min-w-0 flex-grow">
                          <div className="w-10 h-10 rounded-2xl overflow-hidden border border-purple-500/20 bg-slate-950/40 shrink-0">
                            <Image
                              src={p.avatarUrl} 
                              alt={p.name} 
                              width={40}
                              height={40}
                              sizes="40px"
                              className="w-full h-full object-cover"
                              draggable={false}
                            />
                          </div>
                          <div className="min-w-0 flex-grow text-left">
                            <h4 className="font-extrabold text-slate-200 text-sm truncate">{p.name}</h4>
                            <p className="text-[10px] font-bold text-purple-400/80 truncate">尋找今日固定隊友</p>
                          </div>
                        </div>
                        <div className="shrink-0 ml-1">
                          <Badge className="bg-purple-950/60 border border-purple-500/20 text-purple-300 text-xs font-bold px-2.5 py-0.5 rounded-lg shadow-sm whitespace-nowrap">
                            {p.rank}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 w-full min-w-0">
                        <span className="soft-home-badge bg-purple-600/25 border border-purple-500/20 text-purple-300 shrink-0 text-[10px]">
                          {p.game}
                        </span>
                        <span className="soft-home-badge bg-slate-800/50 text-slate-300 border-none min-w-0 truncate justify-start text-[10px]">
                          {p.hero}
                        </span>
                      </div>

                      <div className="bg-slate-950/40 border border-purple-500/10 rounded-2xl p-3 min-h-[58px] flex items-center w-full overflow-hidden shrink-0 my-1">
                        <p className="text-slate-300 text-[12.5px] font-normal leading-relaxed italic opacity-95 line-clamp-2">
                          &ldquo;{p.message}&rdquo;
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/5 mt-1 shrink-0 w-full">
                        {p.tags.map((tag) => (
                          <span key={tag} className="soft-home-badge bg-transparent border-purple-500/10 text-slate-400 text-[9.5px]">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Modals for starry-midnight */}
            {isJillModalOpen && (
              <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-[fadeIn_0.25s_ease-out]">
                <div className="bg-[#0a0a12] border border-purple-500/20 rounded-[32px] w-full max-w-md p-7 shadow-2xl relative space-y-5 text-left">
                  <button 
                    onClick={() => setIsJillModalOpen(false)}
                    className="absolute top-5.5 right-5.5 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold tracking-widest text-purple-400 uppercase">Jill&apos;s Letter</span>
                    <h3 className="text-lg font-bold text-slate-200">站長隨筆手札 詳細記錄 ✍️</h3>
                  </div>
                  <div className="border-t border-white/5" />
                  <p className="text-slate-300 text-xs md:text-sm leading-relaxed whitespace-pre-line font-light">
                    {`歡迎來到 AFTER MIDNIGHT 的深夜沙龍。這個小小平台的誕生，是為了給在充滿排位高壓、爭執毒素的遊戲環境中感到倦怠的玩家，提供一個溫暖的避風港。

在這裡，我們用名片點亮深夜的夜空。你不需要向任何人證明你的段位，也不需要強迫自己保持隨時待命的社交。

只需靜靜展示你的遊戲節奏、喜好的角色與社交溫度。如果有相同的電波，就在遊戲內加個好友，安靜地一同排位吧。

願這裡能成為你溫暖的停泊角落。`}
                  </p>
                  <div className="flex gap-3 pt-2">
                    <Button 
                      onClick={() => setIsJillModalOpen(false)}
                      className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs tracking-widest uppercase py-4 rounded-xl"
                    >
                      回到沙龍
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {isLuckyAllyModalOpen && (
              <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-[fadeIn_0.25s_ease-out]">
                <div className="bg-[#0a0a12] border border-purple-500/20 rounded-[32px] w-full max-w-sm p-6 shadow-2xl relative">
                  <button 
                    onClick={() => setIsLuckyAllyModalOpen(false)}
                    className="absolute top-5 right-5 text-slate-400 hover:text-white cursor-pointer z-50"
                  >
                    <X size={16} />
                  </button>
                  <LuckyAlly />
                </div>
              </div>
            )}

            {isEventsModalOpen && (
              <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-[fadeIn_0.25s_ease-out]">
                <div className="bg-[#0a0a12] border border-purple-500/20 rounded-[32px] w-full max-w-lg p-6 shadow-2xl relative">
                  <button 
                    onClick={() => setIsEventsModalOpen(false)}
                    className="absolute top-5 right-5 text-slate-400 hover:text-white cursor-pointer z-50"
                  >
                    <X size={16} />
                  </button>
                  <FeaturedArtists styleMode="B" />
                </div>
              </div>
            )}

          </div>

        ) : theme === "paper-card-social" ? (
          /* =========================================================================
             🍂 樣式 3：手作紙卡 (Paper Card Social) - 手作、溫馨、拼貼佈局
             ========================================================================= */
          <div className="space-y-12 max-w-7xl mx-auto z-10 relative">
            
            {/* 橫幅：大紙板風格 */}
            <div 
              className="relative overflow-hidden w-full rounded-[24px] border-2 border-[#4A3E3D] p-6 sm:p-8 md:p-12 bg-[#FCFAF6] shadow-[6px_6px_0px_#4A3E3D] flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 animate-[fadeInUp_0.8s_ease-out]"
            >
              <div className="space-y-5 max-w-lg text-center md:text-left flex-grow">
                <div className="inline-flex items-center gap-1.5 text-[#E07A5F] border border-[#4A3E3D] bg-white px-3 py-1 rounded-sm text-[10px] font-bold tracking-widest uppercase shadow-[1px_1px_0px_#4A3E3D] w-fit mx-auto md:mx-0">
                  <Sparkles size={11} />
                  紙質名片收集冊
                </div>
                
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-wider leading-tight text-[#4A3E3D] text-balance text-left">
                  寫下你的遊戲人格，<br />
                  <span className="text-[#E07A5F]">在此交換彼此的溫度。</span>
                </h2>
                
                <p className="text-[#7C6D6C] text-xs md:text-sm leading-relaxed font-normal text-left">
                  哈囉！這是我們的手作紙卡小本本。在這裡，沒有冷冰冰的網格，每一頁都是玩家親手書寫的小紙條。希望你也能在這裡，安靜地收集到知心玩伴。
                </p>

                <div className="flex flex-col sm:flex-row gap-3 pt-1.5 justify-center md:justify-start">
                  <Link href="/browse">
                    <Button className="w-full sm:w-auto bg-[#E07A5F] hover:bg-[#D16B50] text-white border-2 border-[#4A3E3D] font-bold text-xs tracking-widest uppercase px-6 py-4.5 rounded-sm cursor-pointer shadow-[3px_3px_0px_#4A3E3D] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_#4A3E3D] transition-all">
                      翻閱玩家卡片
                    </Button>
                  </Link>
                  
                  <Link href="/profile">
                    <Button className="w-full sm:w-auto bg-white hover:bg-stone-50 text-[#4A3E3D] border-2 border-[#4A3E3D] font-bold text-xs tracking-widest uppercase px-6 py-4.5 rounded-sm cursor-pointer shadow-[3px_3px_0px_#4A3E3D] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_#4A3E3D] transition-all">
                      貼上我的紙條
                    </Button>
                  </Link>
                </div>
              </div>

              {/* 右側：拍立得照片質感卡片 */}
              <div className="relative w-72 rounded-sm border-2 border-[#4A3E3D] bg-white p-5 shadow-[4px_4px_0px_#4A3E3D] shrink-0 rotate-2">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-[#eae4d3]/80 border border-[#4A3E3D]/30 rotate-[-2deg] shadow-sm flex items-center justify-center text-[9px] font-bold text-[#7C6D6C]">膠帶固定</div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="relative w-12 h-12 rounded-sm border border-[#4A3E3D] bg-[#FCFAF6] shrink-0">
                    <Image
                      src="/images/avatars/avatar_male_calm_square.png"
                      alt="紙卡推薦"
                      fill
                      sizes="48px"
                      className="object-cover p-0.5"
                    />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-[9px] font-bold uppercase text-[#E07A5F]">RECOMMENDED</p>
                    <p className="text-xs font-black text-[#4A3E3D]">站長 Jill 的記事</p>
                  </div>
                </div>
                <div className="mt-4 rounded-sm border border-[#4A3E3D] bg-[#FCFAF6] p-3 text-left">
                  <p className="text-[11.5px] leading-relaxed text-[#4A3E3D] italic">
                    “今晚有空的朋友，歡迎一起來開麥語音，彈性或一般都OK，心態好就行。”
                  </p>
                </div>
              </div>
            </div>

            {/* 紙質公告板 (Bulletin Board) */}
            <div className="border-2 border-[#4A3E3D] bg-[#FAF3E0] rounded-[24px] p-6 shadow-[4px_4px_0px_#4A3E3D] relative overflow-hidden">
              <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full border-2 border-[#4A3E3D]/25 bg-amber-200/10 pointer-events-none" />
              <div className="text-left mb-6 border-b-2 border-[#4A3E3D]/10 pb-3">
                <h3 className="text-xs font-black tracking-widest text-[#4A3E3D] uppercase flex items-center gap-1.5">
                  📌 公告欄貼紙
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="rotate-[-0.5deg]">
                  <LuckyAlly />
                </div>
                <div className="rotate-[0.8deg]">
                  <LotusWelcomeWidget />
                </div>
                <div className="rotate-[-0.3deg]">
                  <FeaturedArtists styleMode="B" />
                </div>
              </div>
            </div>

            {/* 卡片列表 */}
            <section className="space-y-6 w-full">
              <h3 className="text-sm font-extrabold text-[#4A3E3D] tracking-widest uppercase flex items-center gap-1.5 text-left">
                📦 今日最新掛上牆壁的紙條
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-7 py-1 w-full">
                {profiles.map((p, idx) => {
                  const isNew = idx === 0;
                  const rot = idx === 0 ? "rotate-[-0.8deg]" : idx === 1 ? "rotate-[0.5deg]" : "rotate-[-0.4deg]";
                  return (
                    <div 
                      key={p.id} 
                      className={`glass-panel p-5 border-2 border-[#4A3E3D] bg-[#FCFAF6] hover:bg-white flex flex-col justify-between h-[240px] transition-all duration-300 hover:shadow-[5px_5px_0px_#4A3E3D] shadow-[3px_3px_0px_#4A3E3D] ${rot} ${
                        isNew ? "animate-card-slide" : ""
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2 w-full">
                        <div className="flex items-center gap-2.5 min-w-0 flex-grow">
                          <div className="w-9 h-9 rounded-sm overflow-hidden border border-[#4A3E3D] bg-white shrink-0">
                            <Image
                              src={p.avatarUrl} 
                              alt={p.name} 
                              width={36}
                              height={36}
                              sizes="36px"
                              className="w-full h-full object-cover"
                              draggable={false}
                            />
                          </div>
                          <div className="min-w-0 flex-grow text-left">
                            <h4 className="font-extrabold text-[#4A3E3D] text-sm truncate">{p.name}</h4>
                            <p className="text-[10px] font-bold text-[#7C6D6C] truncate">尋找今日固定隊友</p>
                          </div>
                        </div>
                        <div className="shrink-0 ml-1">
                          <Badge className="bg-[#FAF0D7] border border-[#4A3E3D] text-[#4A3E3D] text-xs font-bold px-2 py-0.5 rounded-sm">
                            {p.rank}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 w-full min-w-0">
                        <span className="soft-home-badge bg-[#E07A5F] text-white border border-[#4A3E3D] rounded-sm text-[9px]">
                          {p.game}
                        </span>
                        <span className="soft-home-badge bg-white text-[#4A3E3D] border border-[#4A3E3D] rounded-sm min-w-0 truncate justify-start text-[9px]">
                          {p.hero}
                        </span>
                      </div>

                      <div className="bg-[#FAF6EF] border border-[#4A3E3D]/50 rounded-sm p-3 min-h-[58px] flex items-center w-full overflow-hidden shrink-0 my-1">
                        <p className="text-[#4A3E3D] text-[12.5px] font-normal leading-relaxed italic opacity-95 line-clamp-2">
                          &ldquo;{p.message}&rdquo;
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#4A3E3D]/10 mt-1 shrink-0 w-full">
                        {p.tags.map((tag) => (
                          <span key={tag} className="soft-home-badge bg-white border border-[#4A3E3D] rounded-sm text-[9px]">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

          </div>
        ) : theme === "cyber-matchmaking-hub" ? (
          /* =========================================================================
             💻 樣式 4：和風禪意 (Washi Zen Wabi-sabi) - 留白、禪意、金色點綴
             ========================================================================= */
          <div className="space-y-12 max-w-7xl mx-auto z-10 relative">
            
            {/* 橫幅：和紙侘寂 */}
            <div 
              className="relative overflow-hidden w-full rounded-[28px] border border-[#f5d46b]/20 p-6 sm:p-8 md:p-12 min-h-[440px] flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 bg-white/60 backdrop-blur-md shadow-sm animate-[fadeInUp_0.8s_ease-out]"
            >
              {/* 背景圖片與遮罩，去霓虹格線 */}
              <div 
                className="absolute inset-0 z-0 bg-cover bg-center opacity-40 pointer-events-none"
                style={{ backgroundImage: "url('/images/banners/zen_paper_banner.png')" }}
              />
              
              {/* 禪風金粉粒子層 */}
              <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                {ZEN_PARTICLES.map((p) => (
                  <div
                    key={p.id}
                    className="zen-gold-particle"
                    style={{
                      width: `${p.size}px`,
                      height: `${p.size}px`,
                      top: `${p.top}%`,
                      left: `${p.left}%`,
                      animationDelay: `${p.delay}s`,
                      animationDuration: `${p.duration}s`
                    }}
                  />
                ))}
              </div>
              
              <div className="space-y-6 max-w-xl text-center md:text-left flex-grow relative z-10">
                <div className="inline-flex items-center gap-1.5 border border-[#f5d46b]/40 bg-white/50 px-3 py-1 text-[9.5px] font-bold tracking-[0.2em] text-[#8C7B70] rounded-full shadow-sm w-fit mx-auto md:mx-0">
                  <Sparkles size={11} className="text-[#f5d46b] animate-[pulse_2s_infinite]" />
                  WABI-SABI ZEN SPACE
                </div>
                
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-wider leading-tight text-[#4A3C31] text-balance text-left">
                  在晨霧霞紋之間，<br />
                  <span className="text-[#8C7B70]">遇見志趣相投的伴侶。</span>
                </h2>
                
                <p className="text-[#8C7B70] text-xs md:text-sm leading-relaxed font-normal text-left max-w-lg">
                  這是一個和風禪意角落。沒有催促，沒有強迫，只有和紙的厚度與安靜的流動。在這裡，放鬆地瀏覽，遇見與你呼吸同頻的玩家。
                </p>

                <div className="flex flex-col sm:flex-row gap-3.5 pt-2 justify-center md:justify-start">
                  <Link href="/browse">
                    <Button className="w-full sm:w-auto bg-[#FAF8F5] hover:bg-white text-[#4A3C31] border border-[#f5d46b]/40 font-bold text-xs tracking-widest uppercase px-6 py-5 rounded-2xl cursor-pointer shadow-sm transition-all hover:border-[#f5d46b] hover:scale-102">
                      漫步玩家廣場
                    </Button>
                  </Link>
                  
                  <Link href="/profile">
                    <Button variant="outline" className="w-full sm:w-auto border-[#f5d46b]/30 text-[#8C7B70] hover:text-[#4A3C31] hover:bg-[#FAF8F5]/50 font-bold text-xs tracking-widest uppercase px-6 py-5 rounded-2xl transition-all duration-300 cursor-pointer hover:scale-102">
                      留白個人名片
                    </Button>
                  </Link>
                </div>

                {/* 四大特色圖示 */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-5 gap-y-2.5 pt-4 text-[#8C7B70] text-[10.5px] font-bold tracking-wider">
                  <span className="flex items-center gap-1.5"><Heart size={12} className="text-[#f5d46b]" /> 侘寂留白</span>
                  <span className="flex items-center gap-1.5"><Shield size={12} className="text-[#f5d46b]" /> 無壓匹配</span>
                  <span className="flex items-center gap-1.5"><Users size={12} className="text-[#f5d46b]" /> 溫和對話</span>
                  <span className="flex items-center gap-1.5"><Layers size={12} className="text-[#f5d46b]" /> 安靜陪伴</span>
                </div>
              </div>

              {/* 右側：和紙隨記 */}
              <div className="relative w-80 rounded-2xl border border-[#f5d46b]/25 bg-white/75 backdrop-blur-md p-6 shadow-sm shrink-0 text-left relative z-10 rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-[#FAF8F5] border border-[#f5d46b]/15 rotate-[-1deg] shadow-sm flex items-center justify-center text-[9px] font-bold text-[#8C7B70]">霞紋便簽</div>
                <div className="flex justify-between items-center text-[9px] text-[#8C7B70] mb-3 border-b border-[#f5d46b]/10 pb-2">
                  <span>WABI_SABI_LOG</span>
                  <span>● 靜夜</span>
                </div>
                <p className="text-[12px] leading-relaxed text-[#4A3C31] italic">
                  “水波微漾，星子在夜空裡安睡。不急著開口，先在和紙上寫下你的名字。當電波交織，晨霧自會散去。”
                </p>
                <div className="border-t border-[#f5d46b]/10 my-3 pb-1" />
                <div className="text-[10px] text-[#8C7B70] font-bold tracking-wide">— 站長 Jill</div>
              </div>
            </div>

            {/* 禪風藝廊展示面板 */}
            <div className="border border-[#f5d46b]/15 bg-white/40 backdrop-blur-sm rounded-[32px] p-6 shadow-sm relative overflow-hidden">
              <div className="text-left mb-6 border-b border-[#f5d46b]/10 pb-3 flex justify-between items-center">
                <span className="text-xs font-black tracking-widest text-[#4A3C31] uppercase">
                  🌿 禪意大廳單元
                </span>
                <span className="text-[9px] text-[#8C7B70] uppercase tracking-widest flex items-center gap-1.5">
                  <Activity size={10} className="text-[#f5d46b] animate-pulse" />
                  靜水流深
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <LuckyAlly />
                </div>
                <div>
                  <LotusWelcomeWidget />
                </div>
                <div>
                  <FeaturedArtists styleMode="B" />
                </div>
              </div>
            </div>

            {/* 啟航玩家卡片 */}
            <section className="space-y-6 w-full text-left">
              <h3 className="text-sm font-extrabold text-[#4A3C31] tracking-wider uppercase flex items-center gap-2">
                🍵 最新在大廳啟航的玩家
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-7 py-1 w-full">
                {profiles.map((p, idx) => {
                  const isNew = idx === 0;
                  return (
                    <div 
                      key={p.id} 
                      className={`p-5 border border-[#f5d46b]/20 bg-white/60 hover:bg-white backdrop-blur-sm hover:border-[#f5d46b]/50 hover:shadow-md flex flex-col justify-between h-[240px] transition-all duration-300 rounded-[20px] ${
                        isNew ? "animate-card-slide" : ""
                      }`}
                      style={{
                        boxShadow: "0 8px 24px rgba(140, 123, 112, 0.03)"
                      }}
                    >
                      <div className="flex justify-between items-start gap-2 w-full">
                        <div className="flex items-center gap-3 min-w-0 flex-grow">
                          <div className="w-9 h-9 rounded-xl overflow-hidden border border-[#f5d46b]/15 bg-white shrink-0">
                            <Image
                              src={p.avatarUrl} 
                              alt={p.name} 
                              width={36}
                              height={36}
                              sizes="36px"
                              className="w-full h-full object-cover"
                              draggable={false}
                            />
                          </div>
                          <div className="min-w-0 flex-grow text-left">
                            <h4 className="font-extrabold text-[#4A3C31] text-sm truncate">{p.name}</h4>
                            <p className="text-[10px] text-[#8C7B70] truncate">尋找今日固定隊友</p>
                          </div>
                        </div>
                        <div className="shrink-0 ml-1">
                          <Badge className="bg-[#FAF8F5] border border-[#f5d46b]/20 text-[#8C7B70] text-xs font-bold px-2.5 py-0.5 rounded-lg shadow-sm whitespace-nowrap">
                            {p.rank}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 w-full min-w-0">
                        <span className="soft-home-badge bg-[#f5d46b]/15 border border-[#f5d46b]/30 text-[#8C7B70] text-[9.5px]">
                          {p.game}
                        </span>
                        <span className="soft-home-badge bg-[#FAF8F5] text-[#8C7B70] border border-[#f5d46b]/10 min-w-0 truncate justify-start text-[9.5px]">
                          {p.hero}
                        </span>
                      </div>

                      <div className="bg-white/40 border border-[#f5d46b]/10 rounded-2xl p-3 min-h-[58px] flex items-center w-full overflow-hidden shrink-0 my-1">
                        <p className="text-[#4A3C31] text-[12.5px] font-normal leading-relaxed italic opacity-95 line-clamp-2">
                          &ldquo;{p.message}&rdquo;
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#f5d46b]/10 mt-1 shrink-0 w-full">
                        {p.tags.map((tag) => (
                          <span key={tag} className="soft-home-badge bg-transparent border border-[#f5d46b]/15 text-[#8C7B70] text-[9px]">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

          </div>
        ) : (
          /* =========================================================================
             🔴 樣式 1：原創基準 (Original / Baseline) - 保留原功能作為對照組
             ========================================================================= */
          <div className="space-y-8 max-w-7xl mx-auto z-10 relative">

            {/* 🔴 [Hero Area] */}
            <div
              className="midnight-hero-stage monitor-glow-artifacts relative overflow-hidden p-6 sm:p-8 md:p-12 glass-panel organic-corners animate-[fadeInUp_0.8s_ease-out] w-full flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 min-h-[300px]"
            >
              <div className="midnight-hero-copy space-y-4.5 min-w-0 text-center md:text-left relative z-10">
                <Badge className="bg-accent/15 text-foreground border border-accent/35 px-3 py-1 text-[10.5px] font-bold tracking-widest uppercase rounded-full flex items-center gap-1.5 shadow-[0_1px_8px_rgba(130,183,204,0.05)] w-fit mx-auto md:mx-0">
                  <Moon size={11} className="shrink-0 text-foreground fill-foreground/10" />
                  所有遊戲玩家的靈魂避風港
                </Badge>
                
                <h2 className="text-3xl sm:text-4xl font-bold tracking-wider leading-tight text-foreground break-words text-balance text-left">
                  尋找心靈契合的 <span className="text-accent">最佳遊戲搭檔</span>
                </h2>
                
                <p className="text-muted-foreground text-xs md:text-sm leading-relaxed font-normal text-left">
                  不僅僅是戰友，更是心靈相通的夥伴。在這裡，建立專屬的磨砂玻璃遊戲名片，展示你的遊戲靈魂，秒速遇到懂你的排位與日常搭檔！
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-wrap gap-3 pt-2 justify-center md:justify-start">
                  <Link href="/profile">
                    <Button className="w-full calm-btn-primary font-bold text-xs tracking-widest uppercase px-5 py-4.5 rounded-2xl cursor-pointer hover:scale-102 transition-transform shadow-md">
                      建立遊戲名片
                    </Button>
                  </Link>
                  
                  <Link href="/browse">
                    <Button variant="outline" className="w-full border-border text-muted-foreground hover:text-foreground bg-card/40 hover:bg-card/70 font-bold text-[10px] tracking-widest uppercase px-5 py-4.5 rounded-2xl shadow-sm transition-all duration-300 cursor-pointer hover:scale-102">
                      漫步玩家廣場
                    </Button>
                  </Link>
                </div>
              </div>

              {/* 右側遊戲名片預覽 */}
              <div className="hidden md:flex relative z-10 pr-2 lg:pr-8">
                <div className="midnight-hero-pass midnight-player-artifact relative w-72 rounded-[28px] border border-border bg-card/35 p-5 shadow-card backdrop-blur-xl rotate-2 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center gap-3">
                    <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-accent/25 bg-card/60 shrink-0">
                      <Image
                        src="/images/avatars/avatar_female_cheerful_square.png"
                        alt="玩家名片預覽頭像"
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black tracking-widest uppercase text-accent">ALLY CARD</p>
                      <p className="text-sm font-black text-foreground truncate">深夜補位夥伴</p>
                      <p className="text-[10px] font-bold text-muted-foreground truncate">Overwatch · 安娜</p>
                    </div>
                  </div>
                  <div className="mt-4 rounded-2xl border border-border bg-card/35 p-3">
                    <p className="line-clamp-2 text-[11px] leading-relaxed text-foreground">
                      “今晚找溫和雙排，會補位、有麥、心態穩。”
                    </p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="pastel-tag-blue rounded-full px-2 py-0.5 text-[9px] font-black">#語音交流</span>
                    <span className="pastel-tag-sand rounded-full px-2 py-0.5 text-[9px] font-black">#拒絕暴躁</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Widget 展示區 */}
            <div className="space-y-8">
              
              {/* 三欄等高 Widget Row */}
              <div className="quiet-lounge-surfaces rounded-[28px] p-1 grid grid-cols-1 md:grid-cols-3 gap-8 animate-[fadeInUp_0.9s_ease-out]">
                
                {/* 🔵 LUCKY ALLY */}
                <div className="flex">
                  <LuckyAlly />
                </div>

                {/* 🟣 站長隨筆手札 */}
                <div className="flex">
                  <LotusWelcomeWidget />
                </div>

                {/* 🟢 LOBBY EVENTS */}
                <div className="flex animate-[fadeInUp_1s_ease-out]">
                  <FeaturedArtists styleMode="B" />
                </div>

              </div>

              {/* 最新在大廳啟航的玩家 */}
              <section className="artifact-gallery space-y-5 w-full">
                  <div className="flex justify-between items-center px-1">
                    <h3 className="artifact-section-heading text-sm font-bold text-[#3e2723] tracking-widest uppercase flex items-center gap-1.5 text-left">
                      <Users size={16} className="text-[#82b7cc]" style={{ color: "rgba(var(--theme-accent-rgb), 0.85)" }} />
                      🎉 最新在大廳啟航的玩家
                    </h3>
                    <span className="text-xs font-bold text-[#8c7c6c]/60 uppercase tracking-widest flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                      即時連線更新中
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-7 overflow-hidden py-1 px-0.5 w-full">
                    {profiles.map((p, idx) => {
                      const isNew = idx === 0;

                      return (
                        <div 
                          key={p.id} 
                          className={`midnight-player-artifact glass-panel p-5 border border-white/40 flex flex-col justify-between h-[232px] transition-all duration-500 hover:border-accent/40 hover:shadow-md ${
                            isNew ? "animate-card-slide" : ""
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2 w-full">
                            <div className="flex items-center gap-2.5 min-w-0 flex-grow">
                              <div className="w-8.5 h-8.5 rounded-xl overflow-hidden border border-[#8c7c6c]/15 shadow-sm shrink-0">
                                <Image
                                  src={p.avatarUrl} 
                                  alt={p.name} 
                                  width={34}
                                  height={34}
                                  sizes="34px"
                                  className="w-full h-full object-cover"
                                  draggable={false}
                                />
                              </div>
                              <div className="min-w-0 flex-grow text-left">
                                <h4 className="font-bold text-[#3e2723] text-sm truncate">{p.name}</h4>
                                <p className="text-[10px] font-semibold text-[#8c7c6c]/80 truncate">尋找今日固定隊友</p>
                              </div>
                            </div>
                            <div className="shrink-0 ml-1">
                              <Badge className="bg-[#ebdcd8]/50 border-none text-[#735954] text-xs font-bold px-2.5 py-0.5 rounded-lg shadow-sm whitespace-nowrap">
                                {p.rank}
                              </Badge>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 w-full min-w-0">
                            <span className="soft-home-badge soft-home-badge-compact bg-accent/85 text-white border-accent/40 shrink-0">
                              {p.game}
                            </span>
                            <span className="soft-home-badge soft-home-badge-compact soft-home-badge-muted min-w-0 truncate justify-start">
                              {p.hero}
                            </span>
                          </div>

                          <div className="bg-white/30 border border-white/60 rounded-2xl p-3 min-h-[58px] flex items-center shadow-[inset_0_1px_2px_rgba(74,62,61,0.01)] text-left w-full overflow-hidden shrink-0 my-1">
                            <p className="text-[#3e2723] text-[12.5px] font-normal leading-relaxed italic opacity-95 line-clamp-2">
                              &ldquo;{p.message}&rdquo;
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#8c7c6c]/10 mt-1 shrink-0 w-full">
                            {p.tags.map((tag) => (
                              <span key={tag} className="soft-home-badge soft-home-badge-compact">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
