"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

// 匯入 Cosmic 向量元件與星空 Canvas 粒子
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { CosmicFullLogo } from "@/components/CosmicParticlesBackground";
import { getAnnouncements } from "@/app/actions/homepage";
import type { AnnouncementItem } from "@/types/homepage";
import { CloudStarmap } from "@/components/morning-sketch/CloudStarmap";

export default function Home() {
  const router = useRouter();
  const { user, authLoading } = useAuth();

  const [starmapOpen, setStarmapOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const cloudBtnRef = useRef<HTMLButtonElement | null>(null);

  // 載入公告資料並篩選未隱藏項目
  useEffect(() => {
    let active = true;
    getAnnouncements()
      .then((data) => {
        if (active) {
          const visible = data.filter((item) => !item.alignments?.is_hidden);
          setAnnouncements(visible);
        }
      })
      .catch((err) => {
        console.error("Failed to load announcements in client:", err);
      });
    return () => {
      active = false;
    };
  }, []);

  // 鍵盤 Esc 收回支援
  useEffect(() => {
    if (!starmapOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setStarmapOpen(false);
        cloudBtnRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [starmapOpen]);

  const toggleStarmap = (e: React.MouseEvent) => {
    e.stopPropagation();
    setStarmapOpen(!starmapOpen);
  };

  const handleGoogleLogin = async () => {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

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
    <div className="relative min-h-screen flex flex-col justify-between z-10 selection:bg-auroraMint/30 text-zinc-100">
      {/* 全螢幕無縫大氣漸層 */}
      <div className="fixed inset-0 ambient-space-glows pointer-events-none z-0"></div>

      <main className="brand-portal-shell atmosphere-content flex-grow max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-8 w-full z-10 relative">
        {/* 曜石星夜前廳主骨架 */}
        <div className="space-y-8 sm:space-y-12 max-w-7xl mx-auto z-10 relative">

          <div className="py-3 sm:py-6 flex flex-col items-center justify-center text-center max-w-4xl mx-auto space-y-6 sm:space-y-12 animate-fade-in">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full border border-white/10 bg-white/[0.02] text-[10px] text-zinc-300 font-mono uppercase tracking-widest mx-auto w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-auroraMint inline-block animate-pulse"></span>
              <span>Beta 展示館開放中</span>
            </div>

            <div className="flex justify-center py-1 sm:py-2 relative w-full">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 sm:w-80 sm:h-80 rounded-full bg-auroraMint/5 filter blur-3xl opacity-60"></div>
              {/* 外層定位基準容器：無 rounded-full，無 border，無 shadow，無 overflow-hidden 裁切 */}
              <div className="relative w-full max-w-[220px] sm:max-w-md bg-transparent">
                {/* 內層實體 Logo 視覺容器：擁有圓角與陰影，並加上 overflow-hidden */}
                <div className="w-full h-auto rounded-full border border-white/[0.02] shadow-[0_0_50px_rgba(139,92,246,0.05)] overflow-hidden">
                  <CosmicFullLogo className="w-full h-auto" />
                </div>
                
                {/* 雲朵互動熱區按鈕 - 移除 focus ring 與 focus:opacity-20 圈圈，僅保留 focus:outline-none */}
                <button
                  ref={cloudBtnRef}
                  onClick={toggleStarmap}
                  aria-expanded={starmapOpen}
                  aria-label="開啟站長星圖選單"
                  className="absolute left-[38%] top-[35%] w-[14%] h-[12%] rounded-full opacity-0 cursor-pointer focus:outline-none z-30"
                />

                {/* 星圖面板與連線元件 - 位於裁切容器之外，因此連接線絕不會被截斷！ */}
                <CloudStarmap
                  isOpen={starmapOpen}
                  onClose={() => setStarmapOpen(false)}
                  announcements={announcements}
                />
              </div>
            </div>

            <p className="text-xs sm:text-base text-zinc-300 leading-relaxed max-w-2xl mx-auto font-sans font-light mt-1 sm:mt-4 text-center">
              這裡不是熱鬧的交友廣場，而是一座安靜運行的深夜展示館。
              玩家把自己的遊戲習慣、常用角色與偏好留在名片上，
              讓相近的頻率在瀏覽之間慢慢靠近。
            </p>

            {/* 雙 CTA 入口卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full max-w-3xl">
              {/* 展示館入口 - Primary */}
              <Link href="/browse" className="block text-left">
                <div 
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  className="primary-glowing-card p-5 sm:p-8 rounded-2xl h-full group cursor-pointer relative overflow-hidden transition-all duration-300"
                >
                  <div className="absolute -right-10 -bottom-10 w-32 h-32 rounded-full bg-auroraTeal/10 filter blur-xl group-hover:bg-auroraTeal/20 transition-all duration-700"></div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono text-auroraMint uppercase tracking-wider font-semibold">Lobby Directory</span>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-auroraMint/20 text-[8px] text-auroraMint border border-auroraMint/30 font-mono tracking-wider animate-pulse">ACTIVE</span>
                    </div>
                    <span className="text-auroraMint font-mono text-xs group-hover:translate-x-1 transition-transform duration-500">→</span>
                  </div>
                  <h3 className="font-playfair text-xl text-white font-semibold mb-2 flex items-center gap-1.5">
                    名片廣場與展示館
                    <span className="text-xs text-auroraMint font-light">✦</span>
                  </h3>
                  <p className="text-xs text-zinc-300 leading-relaxed font-light">
                    走進展示館，翻看一張張被留下的玩家名片。也許只是相同的角色、相近的時段，或一句剛好對上的遊戲節奏，就能成為下一場同行的開始。
                  </p>
                </div>
              </Link>

              {/* 工作室入口 - Secondary - 整合低調 Continue with Google 登入 */}
              <div 
                onClick={() => router.push("/profile")}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="glass-card p-5 sm:p-8 rounded-2xl group cursor-pointer relative overflow-hidden border border-white/[0.03] hover:border-white/20 flex flex-col justify-between h-full transition-all duration-300 text-left"
              >
                <div className="relative">
                  <div className="absolute -right-10 -bottom-10 w-32 h-32 rounded-full bg-white/[0.01] filter blur-xl group-hover:bg-white/[0.03] transition-all duration-700"></div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Identity Studio</span>
                    <span className="text-zinc-500 font-mono text-xs group-hover:translate-x-1 transition-transform duration-500">→</span>
                  </div>
                  <h3 className="font-playfair text-xl text-white font-semibold mb-2 flex items-center gap-1.5">
                    全域身份工作室
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-light">
                    建立你的名片，寫下你常玩什麼、怎麼玩、想不想開語音，以及哪些聯絡方式可以公開。
                  </p>
                </div>

                {/* 低調且不可形變的 Google 登入狀態 / Continue 鍵 */}
                <div className="mt-6 pt-3 border-t border-white/[0.02] relative z-20">
                  {!authLoading && !user ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation(); // 阻止立即跳轉，先執行登入
                        handleGoogleLogin();
                      }}
                      className="inline-flex items-center space-x-2.5 h-8 px-3 rounded-full text-[9px] sm:text-[10px] tracking-wide transition-all duration-300 font-sans text-zinc-400 hover:text-zinc-200 border border-white/[0.05] hover:border-white/[0.15] bg-white/[0.005] hover:bg-white/[0.02] cursor-pointer"
                    >
                      <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                      </svg>
                      <span>Continue with Google</span>
                    </button>
                  ) : user ? (
                    <div className="inline-flex items-center space-x-1.5 text-[9px] text-emerald-400 font-mono tracking-wider bg-emerald-500/5 border border-emerald-500/10 px-2.5 py-1 rounded-full w-fit">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>已同步 GOOGLE 雲端資料</span>
                    </div>
                  ) : (
                    <div className="h-8 flex items-center justify-start">
                      <span className="w-3 h-3 rounded-full border border-zinc-500 border-t-transparent animate-spin inline-block"></span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 寂靜宣言 */}
            <div className="pt-6 sm:pt-10 border-t border-white/[0.04] w-full max-w-3xl fluid-gap-manifesto text-left">
              <p className="text-zinc-400 font-mono text-xs uppercase tracking-[0.2em] mb-5 sm:mb-8 text-center">AFTER MIDNIGHT 寂靜宣言</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <h4 className="text-xs text-zinc-300 font-bold tracking-wider font-mono">01 // 不做配對壓力</h4>
                  <p className="text-[11px] text-zinc-400 leading-relaxed font-light">
                    這裡不做滑卡、不做即時私訊，也不催你馬上互動。你只需要把名片放好，其他人看見後再自行決定要不要聯絡。
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs text-zinc-300 font-bold tracking-wider font-mono">02 // 先看遊戲習慣</h4>
                  <p className="text-[11px] text-zinc-400 leading-relaxed font-light">
                    比起一句自我介紹，我們更在意你怎麼玩。常用角色、語音習慣、時段、伺服器，這些資訊比漂亮話更有用。
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs text-zinc-300 font-bold tracking-wider font-mono">03 // 聯絡權交給玩家</h4>
                  <p className="text-[11px] text-zinc-400 leading-relaxed font-light">
                    After Midnight 不會替你撮合關係。名片只負責展示，真正要不要加好友、要不要一起玩，交給玩家自己判斷。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
