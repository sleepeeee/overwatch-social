"use client";

import React from "react";
import Link from "next/link";

// 匯入 Cosmic 向量元件與星空 Canvas 粒子
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { CosmicFullLogo } from "@/components/CosmicParticlesBackground";

export default function Home() {
  const router = useRouter();
  const { user, authLoading } = useAuth();

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
              <span>慢速玩家展示館 運作中</span>
            </div>

            <div className="flex justify-center py-1 sm:py-2 relative w-full">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 sm:w-80 sm:h-80 rounded-full bg-auroraMint/5 filter blur-3xl opacity-60"></div>
              <div className="relative w-full max-w-[220px] sm:max-w-md bg-transparent rounded-full border border-white/[0.02] shadow-[0_0_50px_rgba(139,92,246,0.05)]">
                <CosmicFullLogo className="w-full h-auto" />
              </div>
            </div>

            <p className="text-xs sm:text-base text-zinc-300 leading-relaxed max-w-2xl mx-auto font-sans font-light mt-1 sm:mt-4 text-center">
              這不是一個喧鬧的交友大廳，而是一處深夜運作的玩家展示館。
              不急躁、無配對壓力、不強迫社交。
              請在此安靜地陳列您的遊戲美學，慢速瀏覽，與契合的遊戲氣質擦肩而過。
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
                    慢速瀏覽各平行宇宙的召喚師、特工與守望者檔案。翻閱精緻的遊戲名片，尋找頻率相通的無言默契。
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
                    在此撰寫您的深夜星語。您可以客製守望者、特工或是召喚師名片。配備您喜愛的英雄立繪，拼貼出專屬的電競氣質。
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
                  <h4 className="text-xs text-zinc-300 font-bold tracking-wider font-mono">01 // 低侵入式社交</h4>
                  <p className="text-[11px] text-zinc-400 leading-relaxed font-light">
                    我們相信真正的默契不需要在線焦慮。這裡沒有即時私訊，唯有在對方發光的名片上複製 UID，在遊戲內靜靜相遇。
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs text-zinc-300 font-bold tracking-wider font-mono">02 // 玩家風格圖鑑</h4>
                  <p className="text-[11px] text-zinc-400 leading-relaxed font-light">
                    展示您擅長的角色立繪、星軌定位、是否開麥等基礎遊戲美學，讓您的卡牌成為一件精緻的深夜藏品。
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs text-zinc-300 font-bold tracking-wider font-mono">03 // 深夜無壓探索</h4>
                  <p className="text-[11px] text-zinc-400 leading-relaxed font-light">
                    去除令人焦慮的愛心按讚數、綠點與快餐配對。給予足夠的空氣，放慢尋找同行者的腳步。
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
