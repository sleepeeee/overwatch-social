"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Compass, Users, Moon } from "lucide-react";
import TopBar from "@/components/TopBar";

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
  const [profiles, setProfiles] = useState<PlayerCard[]>(initialProfiles);
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

  return (
    <div 
      data-style="A"
      className="min-h-screen relative pb-32 transition-colors duration-500"
    >
      <FluidClipPath />

      <main className="transition-all duration-500 ease-out p-6 md:p-8 min-h-screen w-full max-w-7xl mx-auto px-4 md:px-8 pt-6">
        
        <TopBar />

        <div className="space-y-8 max-w-7xl mx-auto z-10 relative">

          {/* 🔴 [Hero Area] */}
          <div
            className="relative overflow-hidden p-6 sm:p-8 md:p-10 glass-panel organic-corners animate-[fadeInUp_0.8s_ease-out] w-full flex flex-col md:flex-row items-center justify-between gap-8 min-h-[260px]"
          >
            <div className="space-y-4.5 max-w-xl min-w-0 text-center md:text-left relative z-10">
              <Badge className="bg-[#82b7cc]/15 text-[#2a454d] border border-[#82b7cc]/35 px-3 py-1 text-[10.5px] font-bold tracking-widest uppercase rounded-full flex items-center gap-1.5 shadow-[0_1px_8px_rgba(130,183,204,0.05)] w-fit mx-auto md:mx-0">
                <Moon size={11} className="shrink-0 text-[#2a454d] fill-[#2a454d]/10" />
                所有遊戲玩家的靈魂避風港
              </Badge>
              
              <h2 className="text-3xl sm:text-4xl font-bold tracking-wider leading-tight text-[#3e2723] break-words text-balance">
                尋找心靈契合的 <span className="text-[#82b7cc]">最佳遊戲搭檔</span>
              </h2>
              
              <p className="text-[#8c7c6c] text-xs md:text-sm leading-relaxed font-normal">
                不僅僅是戰友，更是心靈相通的夥伴。在這裡，建立專屬的磨砂玻璃遊戲名片，展示你的遊戲靈魂，秒速遇到懂你的排位與日常搭檔！
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-wrap gap-3 pt-2 justify-center md:justify-start">
                <Link href="/profile">
                  <Button className="w-full calm-btn-primary font-bold text-xs tracking-widest uppercase px-5 py-4.5 rounded-2xl cursor-pointer hover:scale-102 transition-transform shadow-md">
                    <Sparkles size={11} className="mr-1.5" />
                    建立遊戲名片
                  </Button>
                </Link>
                
                <Link href="/browse">
                  <Button variant="outline" className="w-full border-[#8c7c6c]/10 text-[#8c7c6c] hover:text-[#5d4037] bg-white/40 hover:bg-white/70 font-bold text-[10px] tracking-widest uppercase px-5 py-4.5 rounded-2xl shadow-sm transition-all duration-300 cursor-pointer hover:scale-102">
                    <Compass size={11} className="mr-1.5" />
                    漫步玩家廣場
                  </Button>
                </Link>
              </div>
            </div>

            {/* 右側遊戲名片預覽：讓首屏一眼看出這是找隊友名片平台 */}
            <div className="hidden md:flex relative z-10 pr-4 lg:pr-8">
              <div className="relative w-64 rounded-[28px] border border-white/60 bg-white/35 p-4 shadow-[0_18px_55px_rgba(140,124,108,0.08)] backdrop-blur-xl rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center gap-3">
                  <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-[#82b7cc]/25 bg-white/60 shrink-0">
                    <Image
                      src="/images/avatars/avatar_female_cheerful_square.png"
                      alt="玩家名片預覽頭像"
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black tracking-widest uppercase text-[#82b7cc]">ALLY CARD</p>
                    <p className="text-sm font-black text-[#3e2723] truncate">深夜補位夥伴</p>
                    <p className="text-[10px] font-bold text-[#8c7c6c] truncate">Overwatch · 安娜</p>
                  </div>
                </div>
                <div className="mt-4 rounded-2xl border border-white/70 bg-white/35 p-3">
                  <p className="line-clamp-2 text-[11px] leading-relaxed text-[#5d4037]">
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

          {/* 兩欄元件展示區 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* 左側欄 (8格) */}
            <div className="lg:col-span-8 space-y-8 flex flex-col animate-[fadeInUp_0.9s_ease-out]">
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                
                {/* 🔵 藍色區塊 (左) */}
                <div className="md:col-span-6 flex">
                  <LuckyAlly />
                </div>

                {/* 🟣 紫色區塊 (中) - 已優化垂直重心居中 */}
                <div className="md:col-span-6 flex">
                  <LotusWelcomeWidget />
                </div>

              </div>

              {/* 💗 粉色區塊：最新在大廳啟航的玩家 (已實作滑動動畫與真實大頭貼) */}
              <section className="space-y-4.5 w-full">
                <div className="flex justify-between items-center px-1">
                  <h3 className="text-sm font-bold text-[#3e2723] tracking-widest uppercase flex items-center gap-1.5">
                    <Users size={16} className="text-[#82b7cc]" style={{ color: "rgba(var(--theme-accent-rgb), 0.85)" }} />
                    🎉 最新在大廳啟航的玩家
                  </h3>
                  <span className="text-xs font-bold text-[#8c7c6c]/60 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                    即時連線更新中
                  </span>
                </div>

                {/* 完整展示 3 份卡片，大氣的三欄 grid 佈局 (含滑動更新動畫過渡) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden py-1 px-0.5 w-full">
                  {profiles.map((p, idx) => {
                    const isNew = idx === 0;

                    return (
                      <div 
                        key={p.id} 
                        className={`glass-panel p-5 border border-white/40 flex flex-col justify-between h-[220px] transition-all duration-500 hover:border-[#82b7cc]/40 hover:-translate-y-1 hover:shadow-md ${
                          isNew ? "animate-card-slide" : ""
                        }`}
                      >
                        {/* 卡片頂部：頭像 + 姓名 + 段位，遊戲資訊獨立放下一層避免擁擠 */}
                        <div className="flex justify-between items-start gap-2 w-full">
                          <div className="flex items-center gap-2.5 min-w-0 flex-grow">
                            {/* 真實大頭貼圖片 (與 profile 頁面設定 avatar_url 格式對應，Lorelei 禪意手繪風) */}
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
                            
                            {/* 姓名獨立一層，避免與遊戲和英雄資訊互搶空間 */}
                            <div className="min-w-0 flex-grow text-left">
                              <h4 className="font-bold text-[#3e2723] text-sm truncate">{p.name}</h4>
                              <p className="text-[10px] font-semibold text-[#8c7c6c]/80 truncate">尋找今日固定隊友</p>
                            </div>
                          </div>
                          
                          {/* 右側段位 Badge */}
                          <div className="shrink-0 ml-1">
                            <Badge className={`bg-[#ebdcd8]/50 border-none text-[#735954] text-xs font-bold px-2.5 py-0.5 rounded-lg shadow-sm whitespace-nowrap`}>
                              {p.rank}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 w-full min-w-0">
                          <span className="soft-home-badge soft-home-badge-compact bg-[#82b7cc]/85 text-white border-[#82b7cc]/40 shrink-0">
                            {p.game}
                          </span>
                          <span className="soft-home-badge soft-home-badge-compact soft-home-badge-muted min-w-0 truncate justify-start">
                            {p.hero}
                          </span>
                        </div>

                        {/* 溫潤手感發言區 (高度收窄固定 h-[64px] min-h-[64px]，字體為 text-[12.5px]，釋放空間) */}
                        <div className="bg-white/30 border border-white/60 rounded-2xl p-3 min-h-[58px] flex items-center shadow-[inset_0_1px_2px_rgba(74,62,61,0.01)] text-left w-full overflow-hidden shrink-0 my-1">
                          <p className="text-[#3e2723] text-[12.5px] font-normal leading-relaxed italic opacity-95 line-clamp-2">
                            &ldquo;{p.message}&rdquo;
                          </p>
                        </div>

                        {/* 水粉貼紙標籤 */}
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

            {/* 🟢 綠色區塊 (新右) - 揪團行事曆與色譜 */}
            <div className="lg:col-span-4 w-full animate-[fadeInUp_1s_ease-out]">
              <FeaturedArtists styleMode="B" />
            </div>

          </div>

        </div>
      </main>

    </div>
  );
}
