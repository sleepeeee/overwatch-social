"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Compass, Users } from "lucide-react";

// 匯入 Morning Sketch 風格組件
import FluidClipPath from "@/components/morning-sketch/FluidClipPath";
import LotusWelcomeWidget from "@/components/morning-sketch/LotusWelcomeWidget";
import FeaturedArtists from "@/components/morning-sketch/FeaturedArtists";

// 原有特工資料
const sampleProfiles = [
  { name: "星辰", role: "支援", rank: "鑽石", hero: "安娜", tags: ["認真組排", "不開麥OK"], message: "熟練睡針與禁療瓶，專注後排抬血，找心態成熟的輸出雙排！" },
  { name: "大錘本哈", role: "坦克", rank: "大師", hero: "萊因哈特", tags: ["歡迎新手", "每日上線"], message: "盾牌不倒，青春不老！主坦老司機，歡迎各路輔助加好友。" },
  { name: "暗影源神", role: "輸出", rank: "白金", hero: "源氏", tags: ["快樂排位", "語音交流"], message: "有神快拜！專精源氏/死神。心態好不暴躁，輸贏都歡樂。" },
];

const rankColors: Record<string, string> = {
  黃金: "text-[#d8a070] font-black",
  白金: "text-[#82b7cc] font-black",
  鑽石: "text-blue-600 font-black",
  大師: "text-purple-600 font-black",
  宗師: "text-[#d8a070] font-black",
};

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [hoveredProfile, setHoveredProfile] = useState<string | null>(null);

  // 用於偏光懸停效果的座標紀錄與節流
  const requestRef = useRef<number | null>(null);
  const cardCoords = useRef<{ x: number; y: number }>({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    cardCoords.current = { x, y };

    if (!requestRef.current) {
      requestRef.current = requestAnimationFrame(() => {
        card.style.setProperty("--mouse-x", `${cardCoords.current.x}%`);
        card.style.setProperty("--mouse-y", `${cardCoords.current.y}%`);
        requestRef.current = null;
      });
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.setProperty("--mouse-x", "50%");
    card.style.setProperty("--mouse-y", "50%");
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
  };

  const handleGoogleLogin = () => {
    alert("實作測試：跳轉至 Google 授權登入流程！");
  };

  useEffect(() => {
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    // 全站鎖定使用最美的 A 版本莫蘭迪暖灰沙色系主題
    <div 
      data-style="A"
      className="min-h-screen relative pb-32 transition-colors duration-500 cyber-dots"
      style={{
        background: "var(--theme-bg-gradient)"
      }}
    >
      {/* 載入 SVG 液態曲線剪裁定義 */}
      <FluidClipPath />

      {/* 調整為全寬對稱的現代大氣佈局 */}
      <main className="transition-all duration-500 ease-out p-6 md:p-8 min-h-screen w-full max-w-7xl mx-auto px-4 md:px-8 pt-6">
        
        {/* 🌸 [TopBar] 全局頂部導航列：左側 Logo，右側無比吸睛的 Google 登入 */}
        <div className="w-full flex items-center justify-between mb-10 z-30 relative animate-[fadeIn_0.6s_ease-out]">
          <div className="flex items-center gap-3">
            {/* 精美 SVG 蓮花 Mini Logo */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#82b7cc]/15 to-[#f5d46b]/15 flex items-center justify-center border border-[#82b7cc]/25 shadow-sm">
              <svg viewBox="0 0 100 100" className="w-5 h-5 text-[#82b7cc]">
                <path d="M 50,75 C 34,68 36,55 50,35 C 64,55 66,68 50,75 Z" fill="currentColor" />
              </svg>
            </div>
            <span className="text-xs font-black tracking-widest text-[#3e2723] uppercase">
              LOTUS
            </span>
          </div>

          {/* 🤖 [Aesthetics] 右上角高強度的 Google 登入引導按鈕 */}
          <button 
            onClick={handleGoogleLogin}
            className="group relative flex items-center gap-2.5 px-4.5 py-2.5 rounded-xl border border-[#8c7c6c]/20 bg-white/40 text-xs font-black tracking-widest uppercase text-[#5d4037] hover:text-[#3e2723] hover:bg-white hover:border-[#82b7cc]/40 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-[0_4px_15px_rgba(130,183,204,0.15)]"
          >
            {/* 彩色 Google 標誌 (使用貝茲曲線繪製的高細緻向量 G) */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.466 0-6.277-2.81-6.277-6.277 0-3.466 2.81-6.277 6.277-6.277 1.558 0 2.977.569 4.083 1.503l3.14-3.14C19.167 1.83 15.938 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.16 0 10.993-4.32 10.993-10.993 0-.616-.068-1.22-.178-1.78l-10.815-.422z"
              />
              <path fill="#4285F4" d="M23.055 10.422H12.24v3.978h6.887c-.287 1.071-.856 1.954-1.751 2.519l3.076 3.076c2.313-2.138 3.52-5.176 3.52-8.583 0-.312-.016-.65-.055-.99z" />
              <path fill="#34A853" d="M12.24 23.24c3.084 0 5.672-1.022 7.562-2.779l-3.076-3.076c-.856.574-1.954.915-3.076.915-2.519 0-4.662-1.704-5.413-4.114L5.033 17.26c1.879 3.543 5.568 5.98 9.878 5.98z" />
              <path fill="#FBBC05" d="M6.827 14.191c-.198-.574-.312-1.19-.312-1.83s.114-1.256.312-1.83L3.727 7.42C2.96 8.98 2.52 10.56 2.52 12.36s.44 3.38 1.207 4.94l3.1-3.109z" />
            </svg>
            使用 Google 登入
          </button>
        </div>

        {/* 主控板黃金比例全寬佈局 */}
        <div className="space-y-8 max-w-7xl mx-auto z-10 relative">

          {/* 🤖 [Aesthetics] 雙折射偏光懸停體驗：核心 Hero 展示卡片 */}
          <div 
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative overflow-hidden p-10 glass-panel animate-[fadeInUp_0.8s_ease-out] w-full flex flex-col md:flex-row items-center justify-between gap-8 h-[260px]"
            style={{
              boxShadow: "0 15px 45px -10px rgba(var(--theme-accent-rgb), 0.1)",
              willChange: "background",
              background: "radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(var(--theme-accent-rgb), 0.15) 0%, rgba(255,255,255,0.45) 60%)"
            }}
          >
            <div className="space-y-4.5 max-w-xl text-center md:text-left relative z-10">
              <Badge className="bg-[#82b7cc]/12 text-[#82b7cc] border border-[#82b7cc]/25 px-3 py-1.5 text-[9px] font-black tracking-widest uppercase rounded-full">
                🛡️ OVERWATCH COOPERATION
              </Badge>
              
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-wider leading-none text-[#3e2723] uppercase">
                尋找你的 <span className="text-[#82b7cc]">最佳特工戰友</span>
              </h2>
              
              <p className="text-[#8c7c6c] text-xs leading-relaxed font-semibold">
                特工之間的默契交匯。建立專屬的磨砂玻璃名片，展示你的本命英雄與社群連結，秒速找到心態成熟的靈魂拍檔！
              </p>

              <div className="flex flex-wrap gap-3 pt-1 justify-center md:justify-start">
                <Link href="/profile">
                  <Button className="bg-[#82b7cc] hover:bg-[#82b7cc]/85 text-white font-extrabold text-[10px] tracking-widest uppercase px-6 py-4.5 rounded-xl shadow-sm hover:scale-105 active:scale-98 transition-all duration-300 ow-tech-btn">
                    <Sparkles size={12} className="mr-1.5" />
                    建立特工名片
                  </Button>
                </Link>
                
                <Link href="/browse">
                  <Button variant="outline" className="border-[#8c7c6c]/20 text-[#8c7c6c] hover:text-[#5d4037] bg-white/40 hover:bg-white/60 font-extrabold text-[10px] tracking-widest uppercase px-6 py-4.5 rounded-xl shadow-sm hover:scale-105 active:scale-98 transition-all duration-300 ow-tech-btn">
                    <Compass size={12} className="mr-1.5" />
                    廣場交友
                  </Button>
                </Link>
              </div>
            </div>

            <div className="hidden md:flex relative z-10 pr-6">
              {/* 精美的全息發光雷達旋轉圖案 */}
              <div className="w-32 h-32 rounded-full border-2 border-dashed border-[#82b7cc]/30 flex items-center justify-center animate-[spin_25s_linear_infinite]">
                <div className="w-22 h-22 rounded-full border border-dashed border-[#f5d46b]/40 flex items-center justify-center animate-[spin_12s_linear_infinite_reverse]">
                  <Compass size={28} className="text-[#82b7cc] transform -rotate-12" />
                </div>
              </div>
            </div>
          </div>

          {/* 兩欄元件展示區 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* 左側欄 (8格) */}
            <div className="lg:col-span-8 space-y-8 flex flex-col">
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                
                {/* 蓮花卡片 */}
                <div className="md:col-span-6 flex">
                  <LotusWelcomeWidget />
                </div>

                {/* 任務總覽或特色卡片 (此處展示 Tasks Overview 與環狀進度圖，完美保留經典的 75% 環形進度條) */}
                <div className="md:col-span-6 flex">
                  <div 
                    className="glass-panel p-6 w-full flex flex-col justify-between"
                    style={{
                      boxShadow: "0 10px 40px -10px rgba(var(--theme-accent-rgb), 0.08)"
                    }}
                  >
                    <div className="space-y-1">
                      <h3 className="text-sm font-black text-[#3e2723] uppercase tracking-widest leading-none">
                        Tasks Overview
                      </h3>
                      <p className="text-[9px] font-black text-[#8c7c6c]/60 uppercase tracking-widest">
                        Weekly sketch challenges
                      </p>
                    </div>

                    {/* 環狀進度與狀態指標 */}
                    <div className="flex items-center justify-around my-4">
                      <div className="relative w-24 h-24">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="48" cy="48" r="38" className="stroke-[#8c7c6c]/10" strokeWidth="6" fill="none" />
                          <circle 
                            cx="48" 
                            cy="48" 
                            r="38" 
                            className="stroke-[#82b7cc]" 
                            strokeWidth="6" 
                            fill="none" 
                            strokeDasharray="238" 
                            strokeDashoffset="60" // 75% completed
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                          <span className="text-lg font-black text-[#3e2723]">75%</span>
                          <span className="text-[8px] font-black text-[#8c7c6c]/60 uppercase">Done</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#82b7cc]" />
                          <span className="text-[9px] font-black text-[#8c7c6c]/80 uppercase">Completed</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#a0a29f]" />
                          <span className="text-[9px] font-black text-[#8c7c6c]/80 uppercase">In Progress</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#f5d46b]" />
                          <span className="text-[9px] font-black text-[#8c7c6c]/80 uppercase">Pending</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-[9px] font-black text-[#8c7c6c]/70 text-center uppercase tracking-widest pt-2 border-t border-[#8c7c6c]/10">
                      The details are not the details. They make the design.
                    </div>
                  </div>
                </div>

              </div>

              {/* 最新特工名片列表 */}
              <section className="space-y-4 w-full">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black text-[#3e2723] tracking-widest uppercase flex items-center gap-1.5">
                    <Users size={14} className="text-[#82b7cc]" /> 最新加入的特工隊友
                  </h3>
                  <span className="text-[9px] font-black text-[#8c7c6c]/60 uppercase tracking-widest">
                    剛剛上線公開
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {sampleProfiles.map((p) => {
                    const isHovered = hoveredProfile === p.name;
                    
                    return (
                      <div 
                        key={p.name} 
                        onMouseEnter={() => setHoveredProfile(p.name)}
                        onMouseLeave={() => setHoveredProfile(null)}
                        className="glass-panel p-5 transition-all duration-300 border-b-2 border-b-[#82b7cc]/15 hover:border-b-[#82b7cc]/50 hover:-translate-y-1 h-[210px] flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.01)]"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-[#82b7cc]/12 border border-[#82b7cc]/25 flex items-center justify-center text-xs font-black text-[#82b7cc] shadow-[inset_0_0_6px_rgba(130,183,204,0.15)]">
                              {p.name[0]}
                            </div>
                            <div>
                              <h4 className="font-extrabold text-[#5d4037] text-xs tracking-wide">{p.name}</h4>
                              <span className={`text-[8.5px] font-black uppercase ${rankColors[p.rank]}`}>{p.rank}</span>
                            </div>
                          </div>
                          <Badge className="bg-[#8c7c6c]/8 border-[#8c7c6c]/15 text-[#8c7c6c] text-[8.5px] font-bold px-2 py-0.5">
                            主玩 {p.hero}
                          </Badge>
                        </div>

                        <div className="bg-[#fcf9f2]/90 border border-[#8c7c6c]/10 rounded-xl p-3 min-h-[64px] flex items-center shadow-[inset_0_1px_3px_rgba(140,124,108,0.02)]">
                          <p className="text-[#5d4037] text-[10px] font-semibold leading-relaxed italic">
                            &ldquo;{p.message}&rdquo;
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-1 pt-1.5 border-t border-[#8c7c6c]/10">
                          {p.tags.map((tag) => (
                            <span key={tag} className="text-[8px] font-black px-1.5 py-0.5 rounded-md bg-[#82b7cc]/12 text-[#82b7cc] border border-[#82b7cc]/20">
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

            {/* 右側欄 (4格)：精選藝術家、實體色譜 (固定使用 Style Mode B 展示最美的藝術肖像與色塊) */}
            <div className="lg:col-span-4 w-full">
              <FeaturedArtists styleMode="B" />
            </div>

          </div>

        </div>
      </main>

    </div>
  );
}
