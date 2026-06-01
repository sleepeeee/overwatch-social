"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Compass, Users, Moon } from "lucide-react";
import TopBar from "@/components/TopBar";

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
  const [hoveredProfile, setHoveredProfile] = useState<string | null>(null);

  return (
    // 全站鎖定使用最美的 A 版本莫蘭迪暖灰沙色系主題
    <div 
      data-style="A"
      className="min-h-screen relative pb-32 transition-colors duration-500"
    >
      {/* 載入 SVG 液態曲線剪裁定義 */}
      <FluidClipPath />

      {/* 調整為全寬對稱的現代大氣佈局 */}
      <main className="transition-all duration-500 ease-out p-6 md:p-8 min-h-screen w-full max-w-7xl mx-auto px-4 md:px-8 pt-6">
        
        <TopBar />

        {/* 主控板黃金比例全寬佈局 */}
        <div className="space-y-8 max-w-7xl mx-auto z-10 relative">

          {/* 🌸 [Hero Area] 有機溫潤大圓角卡片重構 */}
          <div 
            className="relative overflow-hidden p-8 md:p-10 glass-panel organic-corners animate-[fadeInUp_0.8s_ease-out] w-full flex flex-col md:flex-row items-center justify-between gap-8 min-h-[260px]"
          >
            <div className="space-y-4.5 max-w-xl text-center md:text-left relative z-10">
              <Badge className="bg-[#82b7cc]/15 text-[#2a454d] border border-[#82b7cc]/35 px-3 py-1 text-[10.5px] font-bold tracking-widest uppercase rounded-full flex items-center gap-1.5 shadow-[0_1px_8px_rgba(130,183,204,0.05)]">
                <Moon size={11} className="shrink-0 text-[#2a454d] fill-[#2a454d]/10" />
                永遠都發生在午夜之後
              </Badge>
              
              <h2 className="text-3xl sm:text-4xl font-bold tracking-wider leading-tight text-[#3e2723]">
                尋找心靈契合的 <span className="text-[#82b7cc]">最佳特工戰友</span>
              </h2>
              
              <p className="text-[#8c7c6c] text-xs md:text-sm leading-relaxed font-normal">
                特工之間的默契交匯。建立專屬的磨砂玻璃名片，展示你的本命英雄與社群連結，秒速找到心態成熟的靈魂拍檔！
              </p>

              <div className="flex flex-wrap gap-3 pt-2 justify-center md:justify-start">
                <Link href="/profile">
                  <Button className="calm-btn-primary font-bold text-xs tracking-widest uppercase px-6 py-4.5 rounded-2xl cursor-pointer">
                    <Sparkles size={11} className="mr-1.5" />
                    建立特工名片
                  </Button>
                </Link>
                
                <Link href="/browse">
                  <Button variant="outline" className="border-[#8c7c6c]/10 text-[#8c7c6c] hover:text-[#5d4037] bg-white/40 hover:bg-white/70 font-bold text-[10px] tracking-widest uppercase px-6 py-4.5 rounded-2xl shadow-sm transition-all duration-300 cursor-pointer">
                    <Compass size={11} className="mr-1.5" />
                    漫步名片廣場
                  </Button>
                </Link>
              </div>
            </div>

            {/* 右側裝飾：手繪禪意同心圓與動態微瀾 */}
            <div className="hidden md:flex relative z-10 pr-8">
              <div className="relative w-36 h-36 flex items-center justify-center">
                {/* 第一層：極淡水粉圓餅 (慢速呼吸) */}
                <div 
                  className="absolute inset-2 rounded-full blur-md animate-[pulse_6s_infinite]" 
                  style={{ backgroundColor: "rgba(var(--theme-accent-rgb), 0.15)" }}
                />
                {/* 第二層：極細同心禪意波紋 */}
                <svg className="w-full h-full text-[#8c7c6c]/30" viewBox="0 0 100 100">
                  {/* 外圓虛線 */}
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 4" className="animate-[spin_40s_linear_infinite]" />
                  {/* 內實線波浪 */}
                  <circle cx="50" cy="50" r="32" fill="none" stroke="currentColor" strokeWidth="0.6" />
                  <path d="M 30,50 Q 40,40 50,50 T 70,50" fill="none" stroke="rgba(var(--theme-accent-rgb), 0.8)" strokeWidth="1.2" className="animate-pulse" />
                  {/* 核心露珠 */}
                  <circle cx="50" cy="50" r="4" fill="#faf5eb" stroke="rgba(var(--theme-accent-rgb), 0.8)" strokeWidth="1" />
                </svg>
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
                    <div className="space-y-1.5">
                      <h3 className="text-base font-bold text-[#3e2723] uppercase tracking-widest leading-none">
                        Tasks Overview
                      </h3>
                      <p className="text-xs font-bold text-[#8c7c6c]/60 uppercase tracking-widest">
                        Weekly sketch challenges
                      </p>
                    </div>

                    {/* 環狀進度與狀態指標 */}
                    <div className="flex items-center justify-around my-4">
                      <div className="relative w-24 h-24">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          {/* 底層水筆刷感圓弧 */}
                          <circle cx="50" cy="50" r="38" className="stroke-[#cbdfe6]/20" style={{ stroke: "rgba(var(--theme-accent-rgb), 0.15)" }} strokeWidth="5.5" fill="none" strokeLinecap="round" />
                          {/* 上層莫蘭迪霧藍水粉圓弧 (75% completed) */}
                          <circle 
                            cx="50" 
                            cy="50" 
                            r="38" 
                            style={{ stroke: "rgba(var(--theme-accent-rgb), 0.85)" }} 
                            strokeWidth="5.5" 
                            fill="none" 
                            strokeDasharray="238" 
                            strokeDashoffset="60" 
                            strokeLinecap="round"
                            opacity="0.9"
                          />
                          {/* 畫筆質感修飾點 */}
                          <circle cx="50" cy="12" r="1.5" fill="#faf5eb" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                          <span className="text-xl font-bold text-[#3e2723]">75%</span>
                          <span className="text-[10px] font-bold text-[#8c7c6c]/60 uppercase tracking-widest">已完成</span>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "rgba(var(--theme-accent-rgb), 0.85)" }} />
                          <span className="text-xs font-bold text-[#8c7c6c]/80 uppercase tracking-widest">藝術挑戰</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "rgba(var(--theme-highlight-rgb), 0.85)" }} />
                          <span className="text-xs font-bold text-[#8c7c6c]/80 uppercase tracking-widest">排位特工</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-[10.5px] font-normal italic text-[#8c7c6c]/70 text-center tracking-wider pt-2 border-t border-[#8c7c6c]/10">
                      "安靜的細節，成就了高級的靈魂。"
                    </div>
                  </div>
                </div>

              </div>

              {/* 最新特工名片列表 */}
              <section className="space-y-4 w-full">
                <div className="flex justify-between items-center px-1">
                  <h3 className="text-sm font-bold text-[#3e2723] tracking-widest uppercase flex items-center gap-1.5">
                    <Users size={14} className="text-[#82b7cc]" style={{ color: "rgba(var(--theme-accent-rgb), 0.85)" }} /> 最新加入的特工隊友
                  </h3>
                  <span className="text-xs font-bold text-[#8c7c6c]/50 uppercase tracking-widest">
                    剛剛上線公開
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {sampleProfiles.map((p) => {
                    return (
                      <div 
                        key={p.name} 
                        className="glass-panel p-5 border border-white/40 flex flex-col justify-between h-[220px] transition-all duration-500"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8.5 h-8.5 rounded-xl bg-[#82b7cc]/12 border border-[#82b7cc]/25 flex items-center justify-center text-xs font-bold text-[#82b7cc]">
                              {p.name[0]}
                            </div>
                            <div>
                              <h4 className="font-bold text-[#3e2723] text-sm">{p.name}</h4>
                              <span className={`text-xs font-bold uppercase ${rankColors[p.rank]}`}>{p.rank}</span>
                            </div>
                          </div>
                          <Badge className="bg-[#ebdcd8]/50 border-none text-[#735954] text-xs font-bold px-2.5 py-0.5 rounded-lg shadow-sm">
                            主玩 {p.hero}
                          </Badge>
                        </div>

                        {/* 溫潤手感紙發言區 (無硬黑邊、無高對比) */}
                        <div className="bg-white/30 border border-white/60 rounded-2xl p-3 min-h-[64px] flex items-center shadow-[inset_0_1px_2px_rgba(74,62,61,0.01)]">
                          <p className="text-[#3e2723] text-[12.5px] font-normal leading-relaxed italic opacity-95">
                            &ldquo;{p.message}&rdquo;
                          </p>
                        </div>

                        {/* 水粉貼紙標籤 (無硬刺、極其溫柔) */}
                        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#8c7c6c]/10">
                          {p.tags.map((tag) => (
                            <span key={tag} className="text-[10.5px] font-bold px-2 py-0.5 rounded-full pastel-tag-blue">
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
