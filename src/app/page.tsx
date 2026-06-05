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

  // 星空漫步 (樣式5) 的專用互動與動畫狀態
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [hoveredPlayer, setHoveredPlayer] = useState<PlayerCard | null>(null);
  const [bubblePosition, setBubblePosition] = useState<{ x: number; y: number } | null>(null);
  const [clickedPlayerId, setClickedPlayerId] = useState<string | null>(null);
  const [isZooming, setIsZooming] = useState(false);

  // 樣式 5 (街機廳) 的專用互動狀態與動作
  const [arcadeActive, setArcadeActive] = useState(false);
  const [joystickActive, setJoystickActive] = useState(false);

  const triggerArcadeScreen = () => {
    setArcadeActive(true);
    setTimeout(() => setArcadeActive(false), 1200);
  };

  const handleJoystickClick = () => {
    setJoystickActive(true);
    triggerArcadeScreen();
    setTimeout(() => setJoystickActive(false), 300);
  };

  const handleArcadeAction = () => {
    triggerArcadeScreen();
  };

  // 樣式 2 (包浩斯) 的專用幾何旋轉狀態
  const [bauhausRotate, setBauhausRotate] = useState(0);
  const handleBauhausClick = () => {
    setBauhausRotate(prev => prev + 1);
  };

  // 樣式 4 (蒸汽龐克) 的專用齒輪加速狀態
  const [gearFast, setGearFast] = useState(false);
  const handleGearClick = () => {
    setGearFast(true);
    setTimeout(() => setGearFast(false), 1500);
  };


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
    card.style.transform = "";
    card.style.boxShadow = "";
  };

  const handleCometEnter = (e: React.MouseEvent, player: PlayerCard) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredPlayer(player);
    setBubblePosition({ x: rect.left + rect.width / 2, y: rect.top });
  };

  const handleCometLeave = () => {
    setHoveredPlayer(null);
    setBubblePosition(null);
  };

  const handleCometClick = (id: string) => {
    setClickedPlayerId(id);
    setIsZooming(true);
    setTimeout(() => {
      setIsZooming(false);
      setClickedPlayerId(null);
    }, 1500);
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

        {theme === "starry-midnight" ? (
          /* =========================================================================
             🕹️ 樣式 5：1980s 賽博街機廳 (Retro Synthwave Arcade)
             ========================================================================= */
          <div className="space-y-24 max-w-7xl mx-auto z-10 relative font-mono text-[#00f0ff] py-10">
            
            <style>{`
              .synthwave-glow {
                text-shadow: 0 0 8px #ff007f, 0 0 20px rgba(255, 0, 127, 0.5);
              }
              .synthwave-glow-cyan {
                text-shadow: 0 0 8px #00f0ff, 0 0 20px rgba(0, 240, 255, 0.5);
              }
              .crt-scanlines {
                background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.3) 50%);
                background-size: 100% 4px;
              }
              .joystick-shake {
                animation: joystick-wiggle 0.3s ease-in-out;
              }
              @keyframes joystick-wiggle {
                0%, 100% { transform: rotate(0deg); }
                25% { transform: rotate(-15deg); }
                75% { transform: rotate(15deg); }
              }
              .pixel-meteor {
                animation: pixel-meteor-move 0.8s steps(10) forwards;
              }
              @keyframes pixel-meteor-move {
                0% { transform: translate(0, 0) scale(1); opacity: 1; fill: #ffd700; }
                50% { fill: #ff007f; }
                100% { transform: translate(-100px, 80px) scale(0.5); opacity: 0; fill: #00f0ff; }
              }
              .coin-btn {
                clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);
              }
            `}</style>

            {/* 50/50 雙欄霓虹橫幅 */}
            <div className="relative overflow-hidden w-full border-2 border-[#ff007f] p-8 sm:p-10 md:p-12 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-12 bg-black shadow-[0_0_30px_rgba(255,0,127,0.35)]">
              {/* 背景網格線 */}
              <div className="absolute inset-0 opacity-10 pointer-events-none z-0" 
                style={{ 
                  backgroundImage: 'linear-gradient(#ff007f 1px, transparent 1px), linear-gradient(90deg, #ff007f 1px, transparent 1px)',
                  backgroundSize: '25px 25px',
                  transform: 'perspective(400px) rotateX(60deg) translateY(-80px) scale(2.5)'
                }} 
              />
              
              {/* 左側產品展示 (50% 產品) */}
              <div className="relative z-10 space-y-6 max-w-xl text-left flex-grow">
                <div className="flex items-center gap-2 text-[#ffd700] select-none font-bold text-xs tracking-wider">
                  <span>[ SYSTEM.STATUS: ONLINE ]</span>
                  <span>|</span>
                  <span className="text-[#ff007f] animate-pulse">&gt; RETRO ARCADE LOBBY</span>
                </div>
                
                <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-black tracking-widest leading-none text-white text-left uppercase synthwave-glow">
                  PLAY TO INFINITY.<br />
                  <span className="text-[#00f0ff] font-extrabold synthwave-glow-cyan text-xl sm:text-2xl lg:text-[34px] tracking-wide block mt-2">
                    用名片點亮 8-BIT 深夜。
                  </span>
                </h2>
                
                <p className="text-slate-300 text-xs md:text-sm leading-relaxed font-normal text-left max-w-lg">
                  歡迎來到 1980s 賽博街機廳。這裡不需要配對演算法或即時交友壓力。插入金幣，展示你最真實的遊戲人格。安靜探索，在夜空軌道與電波之間遇見你的同好夥伴。
                </p>

                {/* 8-bit 產品特色 */}
                <div className="grid grid-cols-2 gap-4 pt-2 text-[#ffd700] text-[11px] tracking-wider uppercase font-bold">
                  <span className="flex items-center gap-1.5">&gt; 1. DE-PILL GRID</span>
                  <span className="flex items-center gap-1.5">&gt; 2. CALM EXPLORE</span>
                  <span className="flex items-center gap-1.5">&gt; 3. DUAL IDENTITY</span>
                  <span className="flex items-center gap-1.5">&gt; 4. NO CHAT CLUTTER</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-3 justify-start">
                  <Link href="/profile">
                    <button className="coin-btn relative border border-[#ff007f] hover:border-[#ffd700] bg-black text-[#ff007f] hover:text-[#ffd700] px-7 py-3.5 tracking-[0.2em] font-bold text-xs hover:shadow-[0_0_15px_rgba(255,0,127,0.5)] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2">
                      <span className="w-2 h-2 bg-[#ff007f] rounded-full animate-ping" />
                      [ INSERT COIN TO JOIN ]
                    </button>
                  </Link>
                  
                  <Link href="/browse">
                    <button className="coin-btn border border-[#00f0ff] hover:border-[#ffd700] bg-black text-[#00f0ff] hover:text-[#ffd700] px-7 py-3.5 tracking-[0.2em] font-bold text-xs hover:shadow-[0_0_15px_rgba(0,240,255,0.5)] transition-all duration-200 cursor-pointer">
                      [ SCAN PLAYER LIST ]
                    </button>
                  </Link>
                </div>
              </div>

              {/* 右側街機櫃 SVG 互動裝置 (50% 品牌) */}
              <div className="relative z-10 w-[300px] h-[340px] flex items-center justify-center shrink-0 mx-auto lg:mx-0">
                <style>{`
                  .joystick-ball { transition: transform 0.1s ease; }
                  .btn-click { transform-origin: center; transition: transform 0.05s ease; }
                  .btn-click:active { transform: scale(0.85); }
                `}</style>
                <svg viewBox="0 0 400 450" className="w-full h-full select-none" onClick={() => handleArcadeAction()}>
                  {/* 街機櫃主體結構 */}
                  <path d="M 50 420 L 50 150 L 80 50 L 320 50 L 350 150 L 350 420 Z" fill="#080816" stroke="#ff007f" strokeWidth="3" />
                  
                  {/* 頂部霓虹看板 */}
                  <rect x="75" y="65" width="250" height="40" fill="#000000" stroke="#00f0ff" strokeWidth="2" />
                  <text x="200" y="90" fill="#ffd700" fontSize="16" fontWeight="bold" textAnchor="middle" letterSpacing="4" filter="drop-shadow(0 0 3px #ffd700)">
                    AFTER MIDNIGHT
                  </text>
                  
                  {/* 街機螢幕邊框 */}
                  <path d="M 70 120 L 330 120 L 330 260 L 70 260 Z" fill="#121225" stroke="#ff007f" strokeWidth="2" />
                  
                  {/* 街機小螢幕 (CRT 效果) */}
                  <rect x="80" y="130" width="240" height="120" fill="#000" rx="8" ry="8" />
                  
                  {/* 螢幕像素流星波 (動態渲染) */}
                  <g className="crt-scanlines pointer-events-none">
                    {/* 掃描線遮罩層 */}
                    <rect x="80" y="130" width="240" height="120" fill="transparent" />
                  </g>
                  
                  {/* CRT 螢幕光暈 */}
                  <rect x="80" y="130" width="240" height="120" fill="#00f0ff" opacity="0.05" className="pointer-events-none" />

                  {/* 螢幕 8-bit 文字與像素流星波 */}
                  <text x="200" y="180" fill="#00f0ff" fontSize="10" fontFamily="monospace" textAnchor="middle" opacity="0.8">
                    {arcadeActive ? "[ PIXEL RUSH ACTIVE ]" : "READY PLAYER ONE"}
                  </text>
                  <text x="200" y="205" fill="#ff007f" fontSize="9" fontFamily="monospace" textAnchor="middle" opacity="0.6">
                    {arcadeActive ? "METEORS DETECTED" : "CLICK JOYSTICK / BUTTONS"}
                  </text>

                  {/* 像素流星 (當 arcadeActive 時，繪製幾組像素方塊粒子) */}
                  {arcadeActive && (
                    <g fill="#ffd700">
                      <rect x="120" y="150" width="6" height="6" className="pixel-meteor" style={{ animationDelay: '0s' }} />
                      <rect x="180" y="140" width="8" height="8" className="pixel-meteor" style={{ animationDelay: '0.2s' }} />
                      <rect x="250" y="160" width="5" height="5" className="pixel-meteor" style={{ animationDelay: '0.1s' }} />
                      <rect x="150" y="180" width="7" height="7" className="pixel-meteor" style={{ animationDelay: '0.4s' }} />
                    </g>
                  )}

                  {/* 控制面板 (斜切面) */}
                  <path d="M 50 300 L 350 300 L 330 350 L 70 350 Z" fill="#0c0d22" stroke="#ff007f" strokeWidth="2" />
                  
                  {/* 搖桿部分 */}
                  <g 
                    className={`cursor-pointer ${joystickActive ? "joystick-shake" : ""}`}
                    onClick={(e) => { e.stopPropagation(); handleJoystickClick(); }}
                  >
                    {/* 搖桿底座 */}
                    <ellipse cx="140" cy="335" rx="15" ry="8" fill="#ff007f" opacity="0.7" />
                    {/* 搖桿金屬棒 */}
                    <line x1="140" y1="335" x2="140" y2="305" stroke="#ccc" strokeWidth="4" strokeLinecap="round" />
                    {/* 搖桿紅色圓球 */}
                    <circle cx="140" cy="305" r="10" fill="#ff007f" className="joystick-ball" filter="drop-shadow(0 0 4px #ff007f)" />
                  </g>

                  {/* 8-bit 控制按鈕 3 個 (鉻黃、螢光粉、極光青) */}
                  <circle cx="230" cy="325" r="10" fill="#ffd700" stroke="#000" strokeWidth="1.5" className="btn-click cursor-pointer" onClick={(e) => { e.stopPropagation(); triggerArcadeScreen(); }} />
                  <circle cx="260" cy="325" r="10" fill="#ff007f" stroke="#000" strokeWidth="1.5" className="btn-click cursor-pointer" onClick={(e) => { e.stopPropagation(); triggerArcadeScreen(); }} />
                  <circle cx="290" cy="325" r="10" fill="#00f0ff" stroke="#000" strokeWidth="1.5" className="btn-click cursor-pointer" onClick={(e) => { e.stopPropagation(); triggerArcadeScreen(); }} />

                  <text x="260" y="345" fill="#888" fontSize="8" textAnchor="middle" fontWeight="bold">FIRE BUTTONS</text>

                  {/* 機身裝飾條紋 */}
                  <line x1="55" y1="380" x2="345" y2="380" stroke="#00f0ff" strokeWidth="1" strokeDasharray="5 5" />
                  <line x1="55" y1="395" x2="345" y2="395" stroke="#ff007f" strokeWidth="1" />
                  
                  {/* 斜切投幣口 */}
                  <rect x="175" y="405" width="50" height="25" fill="#05050b" stroke="#ffd700" strokeWidth="1" />
                  <rect x="198" y="409" width="4" height="10" fill="#ffd700" />
                  <text x="200" y="426" fill="#ffd700" fontSize="6" textAnchor="middle">25¢ INSERT</text>
                </svg>
              </div>
            </div>

            {/* 啟航玩家卡片 */}
            <section className="space-y-6 w-full text-left pt-4">
              <div className="flex justify-between items-center px-1">
                <h3 className="text-sm font-bold text-[#ffd700] tracking-widest uppercase flex items-center gap-2">
                  <span>[ SYSTEM.ACTIVE_PLAYERS ]</span>
                </h3>
                <span className="text-[10px] font-bold text-[#ff007f] uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#ff007f] animate-ping inline-block" />
                  [ FEED ONLINE ]
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-7 py-1 w-full">
                {profiles.map((p, idx) => {
                  const isNew = idx === 0;
                  return (
                    <div 
                      key={p.id} 
                      className={`p-5 border border-[#00f0ff]/30 bg-black hover:bg-[#080812] hover:border-[#ff007f] flex flex-col justify-between h-[250px] transition-all duration-200 rounded-none relative overflow-hidden ${
                        isNew ? "animate-card-slide" : ""
                      }`}
                      style={{
                        boxShadow: "0 0 10px rgba(0, 240, 255, 0.08)"
                      }}
                    >
                      {/* 機戰網格線裝飾 */}
                      <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-[#ff007f]/40 pointer-events-none" />
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-[#ff007f]/40 pointer-events-none" />

                      <div className="flex justify-between items-start gap-2 w-full z-10">
                        <div className="flex items-center gap-3 min-w-0 flex-grow text-left">
                          <div className="w-9 h-9 rounded-none overflow-hidden border border-[#00f0ff]/50 bg-black shrink-0">
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
                          <div className="min-w-0 flex-grow">
                            <h4 className="font-extrabold text-[#00f0ff] text-sm truncate">{p.name}</h4>
                            <p className="text-[9px] font-bold text-slate-400 truncate">&gt; SEARCHING CO-OP</p>
                          </div>
                        </div>
                        <div className="shrink-0 ml-1">
                          <Badge className="bg-black border border-[#ffd700] text-[#ffd700] text-[10px] font-bold px-2 py-0.5 rounded-none shadow-sm whitespace-nowrap">
                            {p.rank}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full min-w-0 z-10">
                        <span className="bg-black border border-[#00f0ff] text-[#00f0ff] text-[9px] rounded-none px-2 py-0.5 whitespace-nowrap">
                          {p.game}
                        </span>
                        <span className="bg-black border border-[#ff007f] text-[#ff007f] text-[9px] rounded-none px-2 py-0.5 min-w-0 truncate">
                          {p.hero}
                        </span>
                      </div>

                      <div className="bg-black border border-[#00f0ff]/20 rounded-none p-3 min-h-[58px] flex items-center w-full overflow-hidden shrink-0 my-1 z-10">
                        <p className="text-slate-300 text-[12px] font-normal leading-relaxed italic line-clamp-2">
                          &ldquo;{p.message}&rdquo;
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#00f0ff]/10 mt-1 shrink-0 w-full z-10">
                        {p.tags.map((tag) => (
                          <span key={tag} className="text-[#ff007f] text-[9px] font-bold tracking-tight">
                            #[{tag}]
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        ) : theme === "soft-midnight-lounge" ? (
          /* =========================================================================
             📐 樣式 2：德式現代主義 / 包浩斯排版 (Bauhaus / Swiss Grid)
             ========================================================================= */
          <div className="space-y-24 max-w-7xl mx-auto z-10 relative font-sans text-black py-12">
            
            {/* 橫幅：不對稱包浩斯網格佈局 */}
            <div 
              className="relative overflow-hidden w-full border-2 border-black p-8 sm:p-10 md:p-12 lg:p-16 flex flex-col lg:flex-row items-stretch justify-between gap-12 bg-white animate-[fadeInUp_0.8s_ease-out]"
            >
              {/* 左側產品引導 (50% 產品) */}
              <div className="relative z-10 space-y-8 max-w-xl text-left flex flex-col justify-between flex-grow">
                <div className="space-y-4">
                  <div className="inline-block border border-black bg-red-600 px-3 py-1 text-[10px] font-black tracking-widest text-white uppercase rounded-none">
                    BAUHAUS GRID SYSTEM
                  </div>
                  
                  <h2 className="text-4xl sm:text-5xl lg:text-[64px] font-black tracking-tighter leading-none text-black text-left uppercase">
                    LEAVE YOUR MARK.<br />
                    <span className="text-red-600 block mt-2 text-2xl sm:text-3xl lg:text-[40px] font-bold tracking-tight">
                      留下你的遊戲人格。
                    </span>
                  </h2>
                  
                  <p className="text-[#555] text-xs md:text-sm leading-relaxed font-light text-left max-w-md pt-2">
                    AFTER MIDNIGHT 遵守極度冷靜與理性的「低侵入社交」原則。這裡沒有多餘的裝飾與焦慮配對。純粹的 1px 黑線，記錄並展現你的深夜玩家卡片。
                  </p>
                </div>

                <div className="space-y-6">
                  {/* 極簡特色小項目 */}
                  <div className="flex flex-col gap-2.5 text-xs font-bold tracking-wider text-black font-mono">
                    <span className="flex items-center gap-2">■ [ 01 / LOW INTENSITY SOCIAL ]</span>
                    <span className="flex items-center gap-2">■ [ 02 / DE-PILL STRUCTURAL ]</span>
                    <span className="flex items-center gap-2">■ [ 03 / HYBRID SKELETON ]</span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-start">
                    <Link href="/browse">
                      <button className="border-2 border-black bg-black text-white hover:bg-red-600 hover:border-red-600 px-8 py-3.5 tracking-widest font-black text-xs transition-colors rounded-none duration-150 cursor-pointer">
                        EXPLORE CARDS / 探索卡片
                      </button>
                    </Link>
                    
                    <Link href="/profile">
                      <button className="border-2 border-black bg-transparent text-black hover:bg-black hover:text-white px-8 py-3.5 tracking-widest font-black text-xs transition-colors rounded-none duration-150 cursor-pointer">
                        CREATE PROFILE / 建立名片
                      </button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* 右側：包浩斯互動幾何裝置 (50% 品牌) */}
              <div className="relative z-10 w-full lg:w-[380px] h-[340px] lg:h-auto border-t lg:border-t-0 lg:border-l border-black pt-8 lg:pt-0 lg:pl-12 flex items-center justify-center shrink-0">
                <div className="w-[300px] h-[300px]">
                  <svg viewBox="0 0 400 400" className="w-full h-full cursor-pointer select-none" onClick={handleBauhausClick}>
                    {/* 不對稱網格線 */}
                    <line x1="0" y1="200" x2="400" y2="200" stroke="#000" strokeWidth="4" />
                    <line x1="200" y1="0" x2="200" y2="400" stroke="#000" strokeWidth="2" />
                    <line x1="100" y1="0" x2="100" y2="400" stroke="#000" strokeWidth="1" />
                    <line x1="0" y1="300" x2="400" y2="300" stroke="#000" strokeWidth="1" />

                    {/* 圓形 (純紅) */}
                    <g style={{ 
                      transform: `rotate(${bauhausRotate * 90}deg)`, 
                      transformOrigin: '100px 100px',
                      transition: 'transform 150ms steps(3, end)'
                    }}>
                      <circle cx="100" cy="100" r="45" fill="#ff0000" />
                      <line x1="100" y1="55" x2="100" y2="145" stroke="#000000" strokeWidth="6" />
                    </g>

                    {/* 三角形 (純黑) */}
                    <g style={{ 
                      transform: `rotate(${-bauhausRotate * 120}deg)`, 
                      transformOrigin: '300px 100px',
                      transition: 'transform 150ms steps(3, end)'
                    }}>
                      <polygon points="300,50 350,150 250,150" fill="#000000" />
                    </g>

                    {/* 正方形 (黑色實線) */}
                    <g style={{ 
                      transform: `rotate(${bauhausRotate * 45}deg)`, 
                      transformOrigin: '100px 300px',
                      transition: 'transform 150ms steps(3, end)'
                    }}>
                      <rect x="55" y="255" width="90" height="90" fill="none" stroke="#000000" strokeWidth="8" />
                      <rect x="75" y="275" width="50" height="50" fill="#ff0000" opacity="0.15" />
                    </g>

                    {/* 複合疊加幾何 (紅加黑) */}
                    <g style={{ 
                      transform: `rotate(${bauhausRotate * 180}deg)`, 
                      transformOrigin: '300px 300px',
                      transition: 'transform 150ms steps(3, end)'
                    }}>
                      <circle cx="300" cy="300" r="35" fill="none" stroke="#000000" strokeWidth="3" />
                      <rect x="285" y="285" width="30" height="30" fill="#ff0000" />
                    </g>

                    {/* 提示點擊文字 */}
                    <text x="200" y="390" fill="#000" fontSize="9" fontWeight="black" textAnchor="middle" letterSpacing="1">
                      [ CLICK TO ROTATE / 點擊旋轉裝置 ]
                    </text>
                  </svg>
                </div>
              </div>
            </div>

            {/* 沙龍公告欄 (德式現代控制條，無陰影，1px 實線) */}
            <div className="flex flex-col sm:flex-row items-center justify-between border-2 border-black bg-white p-4 max-w-4xl mx-auto rounded-none">
              <span className="text-black text-xs font-black tracking-widest flex items-center gap-2 uppercase font-mono mb-2 sm:mb-0">
                ■ SYSTEM BULLETIN / 公告欄
              </span>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <button 
                  onClick={() => setIsLuckyAllyModalOpen(true)}
                  className="px-5 py-2.5 border border-black bg-white hover:bg-black hover:text-white text-black transition-colors rounded-none text-[11px] font-bold uppercase tracking-widest cursor-pointer"
                >
                  🎲 Lucky Ally / 幸友翻牌
                </button>
                <button 
                  onClick={() => setIsEventsModalOpen(true)}
                  className="px-5 py-2.5 border border-black bg-white hover:bg-black hover:text-white text-black transition-colors rounded-none text-[11px] font-bold uppercase tracking-widest cursor-pointer"
                >
                  📅 Events / 揪團日誌
                </button>
              </div>
            </div>

            {/* 最新啟航玩家區 (無陰影與底色，純 1px 黑色實線分割，無圓角，標籤文字底線) */}
            <section className="space-y-8 w-full pt-4">
              <div className="flex justify-between items-center px-1 border-b-2 border-black pb-2">
                <h3 className="text-sm font-black text-black tracking-widest uppercase">
                  ■ ACTIVE PLAYERS / 最新在大廳啟航的玩家
                </h3>
                <span className="text-[10px] font-black text-red-600 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-red-600 inline-block" />
                  REALTIME FEED
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-1 max-w-7xl mx-auto">
                {profiles.slice(0, 3).map((p, idx) => {
                  const isNew = idx === 0;
                  return (
                    <div 
                      key={p.id} 
                      className={`p-6 border border-black bg-white hover:bg-neutral-50 flex flex-col justify-between h-[250px] transition-all rounded-none duration-150 ${
                        isNew ? "border-l-4 border-l-red-600 animate-card-slide" : ""
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2 w-full">
                        <div className="flex items-center gap-3 min-w-0 flex-grow text-left">
                          <div className="w-10 h-10 rounded-none overflow-hidden border border-black bg-neutral-100 shrink-0">
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
                          <div className="min-w-0 flex-grow">
                            <h4 className="font-black text-black text-sm truncate uppercase">{p.name}</h4>
                            <p className="text-[9px] font-bold text-neutral-500 truncate">&gt; STATUS: CO-OP</p>
                          </div>
                        </div>
                        <div className="shrink-0 ml-1">
                          <span className="border border-black text-black text-[10px] font-black px-2 py-0.5 rounded-none uppercase">
                            {p.rank}
                          </span>
                        </div>
                      </div>

                      {/* 標籤為純文字底線，無 Badge 背景 */}
                      <div className="flex items-center gap-3 w-full min-w-0 font-bold text-[10px] text-black">
                        <span className="underline decoration-red-600 decoration-2 whitespace-nowrap">
                          {p.game}
                        </span>
                        <span className="underline decoration-black whitespace-nowrap min-w-0 truncate">
                          {p.hero}
                        </span>
                      </div>

                      <div className="border-t border-b border-black py-3 min-h-[58px] flex items-center w-full overflow-hidden shrink-0 my-1">
                        <p className="text-black text-[12px] font-light leading-relaxed italic line-clamp-2">
                          &ldquo;{p.message}&rdquo;
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-3 pt-1 shrink-0 w-full text-[9px] font-bold text-neutral-600">
                        {p.tags.map((tag) => (
                          <span key={tag} className="underline">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 底部站長手札：淡入展示 */}
            <div className="pt-8 border-t-2 border-black flex justify-center animate-[fadeIn_1s_ease-out]">
              <LotusWelcomeWidget />
            </div>

            {/* Bauhaus Modals */}
            {isLuckyAllyModalOpen && (
              <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                <div className="bg-white border-2 border-black w-full max-w-sm p-6 relative rounded-none">
                  <button 
                    onClick={() => setIsLuckyAllyModalOpen(false)}
                    className="absolute top-5 right-5 text-black hover:text-red-600 cursor-pointer z-50 font-black"
                  >
                    [X]
                  </button>
                  <LuckyAlly />
                </div>
              </div>
            )}

            {isEventsModalOpen && (
              <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                <div className="bg-white border-2 border-black w-full max-w-lg p-6 relative rounded-none">
                  <button 
                    onClick={() => setIsEventsModalOpen(false)}
                    className="absolute top-5 right-5 text-black hover:text-red-600 cursor-pointer z-50 font-black"
                  >
                    [X]
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
             ⚙️ 樣式 4：蒸汽龐克發明家手稿 (Clockwork Inventor Journal)
             ========================================================================= */
          <div className="space-y-24 max-w-7xl mx-auto z-10 relative font-serif text-[#3e2723] py-12">
            
            {/* 50/50 雙欄橫幅 */}
            <div 
              className="relative overflow-hidden w-full border-double border-4 border-[#8d6e63] p-8 sm:p-10 md:p-12 lg:p-16 min-h-[440px] flex flex-col lg:flex-row items-center justify-between gap-12 bg-[#faf6ef] shadow-[4px_4px_16px_rgba(141,110,99,0.15)] animate-[fadeInUp_0.8s_ease-out]"
            >
              {/* 紙張紋理效果 */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" 
                style={{ 
                  backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
                  backgroundSize: '15px 15px'
                }} 
              />
              
              {/* 橫幅左側 (50% 產品)：手寫口號與黃銅壓印按鈕 */}
              <div className="space-y-6 max-w-xl text-left flex-grow relative z-10">
                <div className="inline-flex items-center gap-1.5 border border-[#8d6e63] bg-[#f4ead4] px-2.5 py-0.5 text-[10px] font-bold tracking-[0.2em] text-[#8d6e63] font-mono rounded-none">
                  ★ CLOCKWORK JOURNAL SYSTEM
                </div>
                
                <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-black tracking-wider leading-[1.3] text-[#3e2723] text-left italic">
                  用名片，<br />
                  <span className="text-[#b18f4d] not-italic">
                    連接深夜的齒輪。
                  </span>
                </h2>
                
                <p className="text-[#6d4c41] text-xs md:text-sm leading-relaxed font-normal text-left max-w-lg">
                  「深夜時分，機械的心臟在低語。不要急躁，放慢呼吸。在此處留下你的手稿名片，在微光與銅綠間，讓發條指引遇見同樣安靜探索的同伴。」
                </p>

                {/* 發明手稿特色 */}
                <div className="grid grid-cols-2 gap-4 pt-2 text-[#8d6e63] text-[11px] font-mono uppercase font-bold italic">
                  <span># 01. WABI-SABI LAYOUT</span>
                  <span># 02. DOUBLE-BORDER CARDS</span>
                  <span># 03. CHRONO ROTATOR</span>
                  <span># 04. LOW-INTRUSIVE CO-OP</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-3.5 justify-start">
                  <Link href="/browse">
                    <button className="border border-[#8d6e63] bg-[#faf6ef] text-[#3e2723] hover:bg-[#b18f4d] hover:text-white px-7 py-3 font-black italic rounded-none tracking-widest shadow-[2px_2px_0px_#8d6e63] hover:shadow-[1px_1px_0px_#8d6e63] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer">
                      [ READ FILES / 翻閱手稿 ]
                    </button>
                  </Link>
                  
                  <Link href="/profile">
                    <button className="border border-[#8d6e63] bg-transparent text-[#6d4c41] hover:text-[#3e2723] px-7 py-3 font-black rounded-none tracking-widest hover:bg-[#f4ead4]/30 transition-all cursor-pointer">
                      [ WRITE CARD / 登錄檔案 ]
                    </button>
                  </Link>
                </div>
              </div>
 
              {/* 橫幅右側 (50% 品牌)：精緻的發條天球儀 / 機械齒輪心臟 SVG */}
              <div className="relative z-10 w-full lg:w-[350px] h-[340px] flex items-center justify-center shrink-0 mx-auto lg:mx-0">
                <div className="w-[300px] h-[300px]">
                  <svg viewBox="0 0 400 400" className="w-full h-full cursor-pointer select-none" onClick={handleGearClick}>
                    {/* 機械底盤背景 */}
                    <circle cx="200" cy="200" r="160" fill="none" stroke="#8d6e63" strokeWidth="2" strokeDasharray="5 3" opacity="0.4" />
                    <circle cx="200" cy="200" r="120" fill="none" stroke="#8d6e63" strokeWidth="1" opacity="0.3" />
                    <line x1="200" y1="40" x2="200" y2="360" stroke="#8d6e63" strokeWidth="0.5" opacity="0.3" />
                    <line x1="40" y1="200" x2="360" y2="200" stroke="#8d6e63" strokeWidth="0.5" opacity="0.3" />

                    {/* 齒輪 A (中央大齒輪，黃銅色) */}
                    <g 
                      style={{ transformOrigin: '200px 200px' }}
                      className={gearFast ? "animate-[spin_2s_linear_infinite]" : "animate-[spin_12s_linear_infinite]"}
                    >
                      <circle cx="200" cy="200" r="50" fill="none" stroke="#b18f4d" strokeWidth="12" />
                      <circle cx="200" cy="200" r="30" fill="none" stroke="#8d6e63" strokeWidth="2" />
                      {/* 齒輪牙齒 */}
                      {[...Array(12)].map((_, i) => (
                        <rect 
                          key={i} 
                          x="193" y="140" width="14" height="20" fill="#b18f4d" rx="2"
                          style={{ transform: `rotate(${i * 30}deg)`, transformOrigin: '200px 200px' }} 
                        />
                      ))}
                      {/* 輻條 */}
                      {[...Array(4)].map((_, i) => (
                        <line 
                          key={i} x1="200" y1="150" x2="200" y2="250" stroke="#b18f4d" strokeWidth="6"
                          style={{ transform: `rotate(${i * 45}deg)`, transformOrigin: '200px 200px' }} 
                        />
                      ))}
                      <circle cx="200" cy="200" r="10" fill="#8d6e63" />
                    </g>

                    {/* 齒輪 B (左上方中齒輪，銅鏽色，逆時針) */}
                    <g 
                      style={{ transformOrigin: '125px 125px' }}
                      className={gearFast ? "animate-[spin_1.5s_linear_infinite_reverse]" : "animate-[spin_9s_linear_infinite_reverse]"}
                    >
                      <circle cx="125" cy="125" r="35" fill="none" stroke="#8d6e63" strokeWidth="8" />
                      {/* 齒輪牙齒 */}
                      {[...Array(8)].map((_, i) => (
                        <rect 
                          key={i} 
                          x="120" y="82" width="10" height="15" fill="#8d6e63" rx="1.5"
                          style={{ transform: `rotate(${i * 45}deg)`, transformOrigin: '125px 125px' }} 
                        />
                      ))}
                      <line x1="125" y1="90" x2="125" y2="160" stroke="#8d6e63" strokeWidth="3" />
                      <line x1="90" y1="125" x2="160" y2="125" stroke="#8d6e63" strokeWidth="3" />
                      <circle cx="125" cy="125" r="6" fill="#b18f4d" />
                    </g>

                    {/* 齒輪 C (右下方小齒輪，黃金黃，順時針) */}
                    <g 
                      style={{ transformOrigin: '275px 275px' }}
                      className={gearFast ? "animate-[spin_1s_linear_infinite]" : "animate-[spin_6s_linear_infinite]"}
                    >
                      <circle cx="275" cy="275" r="25" fill="none" stroke="#d84315" strokeWidth="6" />
                      {/* 齒輪牙齒 */}
                      {[...Array(6)].map((_, i) => (
                        <rect 
                          key={i} 
                          x="271" y="244" width="8" height="12" fill="#d84315" rx="1"
                          style={{ transform: `rotate(${i * 60}deg)`, transformOrigin: '275px 275px' }} 
                        />
                      ))}
                      <circle cx="275" cy="275" r="4" fill="#b18f4d" />
                    </g>

                    {/* 連桿 */}
                    <g 
                      style={{ transformOrigin: '200px 200px' }}
                      className="animate-[pulse_4s_ease-in-out_infinite]"
                    >
                      <line x1="200" y1="200" x2="125" y2="125" stroke="#8d6e63" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
                    </g>

                    {/* 發條手柄 */}
                    <path d="M 330 180 L 370 180 A 10 10 0 0 1 380 190 L 380 210 A 10 10 0 0 1 370 220 L 330 220 Z" fill="none" stroke="#b18f4d" strokeWidth="3" />
                    <circle cx="355" cy="200" r="12" fill="none" stroke="#b18f4d" strokeWidth="2" />

                    {/* 提示點擊文字 */}
                    <text x="200" y="385" fill="#3e2723" fontSize="10" fontFamily="serif" fontStyle="italic" fontWeight="bold" textAnchor="middle" letterSpacing="1">
                      [ Click to wind up / 點擊發條加速 ]
                    </text>
                  </svg>
                </div>
              </div>
            </div>

            {/* 沙龍公告貼紙 (去重解耦：僅以手稿貼條形式呈現 Lucky Ally，不重複堆疊 FeaturedArtists) */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 border border-[#8d6e63] bg-[#faf6ef] p-4 max-w-2xl mx-auto rounded-none shadow-[2px_2px_0px_#8d6e63]">
              <span className="text-[#3e2723] text-xs font-bold tracking-widest flex items-center gap-1.5 uppercase font-mono">
                ★ CO-OP BOARD / 告示：
              </span>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsLuckyAllyModalOpen(true)}
                  className="px-4 py-2 border border-[#8d6e63] bg-transparent hover:bg-[#f4ead4] text-[#3e2723] transition-all rounded-none text-[11px] font-bold uppercase tracking-widest cursor-pointer"
                >
                  🎲 Lucky Ally / 幸友翻牌
                </button>
                <button 
                  onClick={() => setIsEventsModalOpen(true)}
                  className="px-4 py-2 border border-[#8d6e63] bg-transparent hover:bg-[#f4ead4] text-[#3e2723] transition-all rounded-none text-[11px] font-bold uppercase tracking-widest cursor-pointer"
                >
                  📅 Events / 揪團活動
                </button>
              </div>
            </div>

            {/* 啟航玩家卡片 */}
            <section className="space-y-6 w-full text-left">
              <h3 className="text-sm font-bold text-[#3e2723] tracking-widest uppercase flex items-center gap-2">
                ★ [ ARCHIVE: ACTIVE PLAYERS / 登錄中的深夜手稿 ]
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-7 py-1 w-full">
                {profiles.map((p, idx) => {
                  const isNew = idx === 0;
                  return (
                    <div 
                      key={p.id} 
                      className={`p-5 border-double border-4 border-[#8d6e63] bg-[#faf6ef] hover:bg-[#fffbf5] flex flex-col justify-between h-[240px] transition-all duration-300 rounded-none shadow-[2px_2px_0px_#8d6e63] hover:shadow-[4px_4px_0px_#8d6e63] ${
                        isNew ? "animate-card-slide" : ""
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2 w-full">
                        <div className="flex items-center gap-3 min-w-0 flex-grow text-left">
                          <div className="w-9 h-9 rounded-none overflow-hidden border border-[#8d6e63] bg-[#faf6ef] shrink-0">
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
                          <div className="min-w-0 flex-grow">
                            <h4 className="font-bold text-[#3e2723] text-sm truncate italic">{p.name}</h4>
                            <p className="text-[10px] font-mono text-[#8d6e63] truncate">&gt; INDEXED CARD</p>
                          </div>
                        </div>
                        <div className="shrink-0 ml-1">
                          <Badge className="bg-[#f4ead4] border border-[#8d6e63] text-[#3e2723] text-xs font-bold px-2.5 py-0.5 rounded-none shadow-sm whitespace-nowrap">
                            {p.rank}
                          </Badge>
                        </div>
                      </div>

                      {/* 像是打字機敲出來的藍色字跡 [Overwatch] */}
                      <div className="flex items-center gap-3 w-full min-w-0 font-mono text-[10px] text-blue-800">
                        <span className="font-bold whitespace-nowrap">
                          [{p.game}]
                        </span>
                        <span className="font-bold min-w-0 truncate">
                          [{p.hero}]
                        </span>
                      </div>

                      <div className="bg-[#fbf9f4] border border-[#8d6e63]/30 rounded-none p-3 min-h-[58px] flex items-center w-full overflow-hidden shrink-0 my-1">
                        <p className="text-[#3e2723] text-[12px] font-normal leading-relaxed italic line-clamp-2">
                          &ldquo;{p.message}&rdquo;
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#8d6e63]/10 mt-1 shrink-0 w-full font-mono text-[9px] text-[#8d6e63]">
                        {p.tags.map((tag) => (
                          <span key={tag}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 底部站長手札：淡入展示 */}
            <div className="pt-8 border-t border-[#8d6e63]/20 flex justify-center animate-[fadeIn_1s_ease-out]">
              <LotusWelcomeWidget />
            </div>

            {/* Clockwork Modals */}
            {isLuckyAllyModalOpen && (
              <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                <div className="bg-[#faf6ef] border-double border-4 border-[#8d6e63] w-full max-w-sm p-6 relative rounded-none shadow-xl">
                  <button 
                    onClick={() => setIsLuckyAllyModalOpen(false)}
                    className="absolute top-5 right-5 text-[#3e2723] hover:text-[#b18f4d] cursor-pointer z-50 font-bold"
                  >
                    [X]
                  </button>
                  <LuckyAlly />
                </div>
              </div>
            )}

            {isEventsModalOpen && (
              <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                <div className="bg-[#faf6ef] border-double border-4 border-[#8d6e63] w-full max-w-lg p-6 relative rounded-none shadow-xl">
                  <button 
                    onClick={() => setIsEventsModalOpen(false)}
                    className="absolute top-5 right-5 text-[#3e2723] hover:text-[#b18f4d] cursor-pointer z-50 font-bold"
                  >
                    [X]
                  </button>
                  <FeaturedArtists styleMode="B" />
                </div>
              </div>
            )}

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
