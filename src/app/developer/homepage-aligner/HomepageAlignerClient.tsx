/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sliders,
  ArrowLeft,
  Loader2,
  Check,
  AlertCircle,
  Sparkles,
  Info,
  Layers
} from "lucide-react";
import { saveAnnouncements, AnnouncementItem } from "@/app/actions/homepage";

interface HomepageAlignerClientProps {
  initialAnnouncements: AnnouncementItem[];
  currentUserEmail: string;
}

export default function HomepageAlignerClient({
  initialAnnouncements,
  currentUserEmail,
}: HomepageAlignerClientProps) {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(initialAnnouncements);
  const [activeSegment, setActiveSegment] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // 🔓 豁免全站防選取限制，允許開發者在後台點選與複製文字
  useEffect(() => {
    document.body.style.userSelect = "text";
    document.body.style.webkitUserSelect = "text";
    
    return () => {
      document.body.style.userSelect = "";
      document.body.style.webkitUserSelect = "";
    };
  }, []);

  const handleAnnouncementChange = (idx: number, field: string, val: string) => {
    setAnnouncements((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: val };
      return updated;
    });
  };

  const handleVisibilityToggle = (idx: number) => {
    setAnnouncements((prev) => {
      const updated = [...prev];
      const alignments = { ...updated[idx].alignments } as any;
      alignments.is_hidden = !alignments.is_hidden;
      updated[idx] = { ...updated[idx], alignments };
      return updated;
    });
  };

  const handleSaveAnnouncements = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await saveAnnouncements(announcements);
      if (res.success) {
        setSuccessMsg("首頁星圖公告內容已成功儲存並同步至前台！");
        setTimeout(() => setSuccessMsg(""), 3500);
      } else {
        setErrorMsg(res.error || "儲存失敗");
      }
    } catch {
      setErrorMsg("執行 Server Action 發生未知錯誤");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#030206] text-[#f4f4f5] relative overflow-x-hidden selection:bg-purple-500/30 selection:text-white">
      {/* 曜石星河漸層背景 */}
      <div className="fixed inset-0 ambient-space-glows pointer-events-none z-0"></div>

      {/* 頂部導覽列 */}
      <header className="sticky top-[var(--dev-banner-height,0px)] z-40 px-6 py-4 flex justify-between items-center border-b border-white/[0.04] bg-zinc-950/70 backdrop-blur-xl text-white shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#c084fc] to-[#8b5cf6] flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.3)]">
            <Sliders size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-[0.2em] uppercase text-zinc-100 font-mono">AFTER MIDNIGHT</h1>
            <p className="text-[9px] font-bold uppercase tracking-widest text-purple-300">Homepage Starmap Editor | 首頁星圖公告編輯器</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-bold text-zinc-300 font-mono">{currentUserEmail}</span>
            <span className="text-[9px] font-bold tracking-wider text-emerald-400 uppercase flex items-center gap-1 justify-end font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Developer Role
            </span>
          </div>
          <Link 
            href="/developer" 
            className="flex items-center gap-1.5 px-4.5 py-2 rounded-xl text-xs font-bold transition-all border bg-white/[0.02] border-white/10 hover:border-white/20 text-zinc-300 hover:text-white cursor-pointer shadow-lg"
          >
            <ArrowLeft size={13} />
            <span>返回控制台</span>
          </Link>
        </div>
      </header>

      {/* 主體內容 */}
      <main className="flex-grow w-full mx-auto p-6 md:p-8 flex flex-col relative z-10 max-w-7xl">
        
        {/* 狀態訊息提示 */}
        {successMsg && (
          <div className="mb-6 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-300 text-xs font-semibold flex items-center gap-2.5 animate-fade-in shadow-[0_0_15px_rgba(16,185,129,0.08)]">
            <Check size={16} className="shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-300 text-xs font-semibold flex items-center gap-2.5 animate-fade-in shadow-[0_0_15px_rgba(239,68,68,0.08)]">
            <AlertCircle size={16} className="shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {announcements.length === 4 && (
          <form onSubmit={handleSaveAnnouncements} className="space-y-8 flex-grow flex flex-col">
            
            {/* 左右雙欄：左邊 Live 高保真星圖卡片預覽，右邊編輯表單 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start flex-grow">
              
              {/* 左欄：高保真星空預覽監視器 */}
              <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
                <div className="p-6 rounded-2xl border border-white/[0.04] bg-white/[0.01] backdrop-blur-xl space-y-4 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-[10px] font-black text-purple-300 uppercase tracking-widest flex items-center gap-1.5">
                      <Sparkles size={11} className="text-purple-400 animate-pulse" />
                      高保真星圖預覽 (High-Fi Live Preview)
                    </span>
                    <span className="text-[9px] font-mono text-zinc-500">
                      Desktop Scale
                    </span>
                  </div>

                  {/* 模擬前台星空磨砂面板 */}
                  <div className="relative py-12 rounded-xl bg-black/60 border border-white/5 flex flex-col items-center justify-center gap-6 overflow-hidden min-h-[300px]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.08)_0%,transparent_70%)] pointer-events-none" />
                    
                    {/* 當前選中的區塊高保真預覽 */}
                    {announcements.map((item, idx) => {
                      const isSelected = activeSegment === idx + 1;
                      if (!isSelected) return null;

                      return (
                        <div
                          key={`preview-${item.num}`}
                          className="w-[280px] p-5 rounded-2xl border border-purple-500/20 bg-zinc-950/90 shadow-[0_0_30px_rgba(139,92,246,0.15)] animate-fade-in relative overflow-hidden"
                          style={{
                            transform: `rotate(${idx % 2 === 0 ? "-1.2deg" : "1.5deg"})`
                          }}
                        >
                          {/* 頂部發光能量粒子 */}
                          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#c084fc]/30 to-transparent" />
                          
                          {/* 隱藏狀態浮水印 */}
                          {item.alignments?.is_hidden && (
                            <div className="absolute inset-0 bg-red-950/20 backdrop-blur-[1px] flex items-center justify-center pointer-events-none z-10">
                              <span className="bg-red-500/20 border border-red-500/30 text-red-400 text-[9px] font-black tracking-widest px-3 py-1 rounded-full uppercase">
                                已隱藏 (HIDDEN)
                              </span>
                            </div>
                          )}

                          <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-mono text-purple-300 tracking-widest font-semibold uppercase">
                                {item.tag || "TAG"}
                              </span>
                              <span className="text-[9px] font-mono text-purple-400/50 font-bold">
                                #{item.num}
                              </span>
                            </div>
                            <h4 className="text-sm font-semibold text-white leading-snug">
                              {item.title || "請輸入標題"}
                            </h4>
                            <p className="text-xs text-zinc-300 font-light leading-relaxed line-clamp-4">
                              {item.message || "請輸入公告引言內容..."}
                            </p>
                          </div>
                        </div>
                      );
                    })}

                    <span className="text-[9px] font-mono text-zinc-600 z-10">
                      星圖面板依此預覽樣式直接渲染於首頁
                    </span>
                  </div>
                </div>
              </div>

              {/* 右欄：Segment 切換與卡片修改表單 */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* 區塊選擇 Segmented Control */}
                <div className="bg-white/[0.01] p-1.5 rounded-xl border border-white/[0.04] flex gap-2 w-full shadow-inner">
                  {[1, 2, 3, 4].map((num) => {
                    const isActive = activeSegment === num;
                    const item = announcements[num - 1];
                    const isHidden = item?.alignments?.is_hidden;
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => {
                          setActiveSegment(num);
                          setErrorMsg("");
                          setSuccessMsg("");
                        }}
                        className={`flex-1 text-center py-2.5 px-1 rounded-lg text-xs font-black tracking-wider uppercase transition-all cursor-pointer ${
                          isActive 
                            ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border border-purple-500/30 shadow-md shadow-purple-900/20"
                            : "text-zinc-400 hover:text-white hover:bg-white/[0.02] border border-transparent"
                        }`}
                      >
                        區塊 {num} {isHidden && <span className="text-[8px] text-amber-400 opacity-90 font-bold font-mono ml-1">(已隱藏)</span>}
                      </button>
                    );
                  })}
                </div>

                {/* 編輯欄位區 */}
                <div className="space-y-6">
                  {announcements.map((item, idx) => {
                    const isSelected = activeSegment === idx + 1;
                    if (!isSelected) return null;

                    const isHiddenAnn = item.alignments?.is_hidden;

                    return (
                      <div key={item.num} className="space-y-6 animate-fade-in">
                        
                        {/* 隱藏提示橫幅 */}
                        {isHiddenAnn && (
                          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-300 text-[11px] leading-relaxed flex gap-2.5 shadow-[0_0_15px_rgba(245,158,11,0.06)] animate-fade-in">
                            <Info size={16} className="shrink-0 text-amber-400 mt-0.5" />
                            <div>
                              <span className="font-bold">⚠️ 隱藏公告提示：</span>
                              此區塊 (#{item.num}) 目前已在前台星圖選單中隱藏，編輯儲存後將保留於資料表中作為後備，但不會在前台繪製。
                            </div>
                          </div>
                        )}

                        <div className="p-6 rounded-2xl border border-white/[0.04] bg-white/[0.01] space-y-5 shadow-2xl">
                          <div className="flex items-center justify-between border-b border-white/5 pb-3">
                            <div className="flex items-center gap-2">
                              <Layers size={14} className="text-purple-400" />
                              <h3 className="text-xs font-black text-zinc-300 uppercase tracking-widest font-mono">
                                ✏️ 區塊 #{item.num} 公告資訊編輯
                              </h3>
                            </div>
                            
                            {/* 前台顯示/隱藏切換開關 */}
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-zinc-400 font-bold font-mono">
                                前台星圖狀態：
                              </span>
                              <button
                                type="button"
                                onClick={() => handleVisibilityToggle(idx)}
                                className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                                  item.alignments?.is_hidden
                                    ? "bg-red-950/40 border border-red-500/30 text-red-400 hover:bg-red-900/40"
                                    : "bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/40"
                                }`}
                              >
                                {item.alignments?.is_hidden ? "已隱藏 (HIDDEN)" : "顯示中 (VISIBLE)"}
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-purple-300 uppercase tracking-wider font-mono">標籤 (Tag)</label>
                              <input
                                type="text"
                                value={item.tag}
                                onChange={(e) => handleAnnouncementChange(idx, "tag", e.target.value)}
                                className="w-full bg-[#0d0a15]/80 border border-white/10 rounded-xl px-4.5 py-3 text-xs font-semibold focus:outline-none focus:border-purple-500 text-white placeholder-zinc-600 transition-colors"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-purple-300 uppercase tracking-wider font-mono">標題 (Title)</label>
                              <input
                                type="text"
                                value={item.title}
                                onChange={(e) => handleAnnouncementChange(idx, "title", e.target.value)}
                                className="w-full bg-[#0d0a15]/80 border border-white/10 rounded-xl px-4.5 py-3 text-xs font-semibold focus:outline-none focus:border-purple-500 text-white placeholder-zinc-600 transition-colors"
                                required
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-purple-300 uppercase tracking-wider font-mono">詳細引言內容 (Message)</label>
                            <textarea
                              rows={5}
                              value={item.message}
                              onChange={(e) => handleAnnouncementChange(idx, "message", e.target.value)}
                              className="w-full bg-[#0d0a15]/80 border border-white/10 rounded-xl px-4.5 py-3 text-xs font-semibold focus:outline-none focus:border-purple-500 text-white placeholder-zinc-600 transition-colors leading-relaxed"
                              required
                            />
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>

                {/* 儲存提交按鈕 */}
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={loading || announcements.length !== 4}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-8 py-3.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all hover:scale-[1.02] shadow-[0_0_25px_rgba(139,92,246,0.25)] disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center gap-2"
                  >
                    {loading && <Loader2 size={14} className="animate-spin" />}
                    <span>{loading ? "正在儲存變更..." : "💾 儲存並同步公告"}</span>
                  </button>
                </div>

              </div>

            </div>

          </form>
        )}

      </main>

      <footer className="mt-auto py-6 border-t border-white/[0.04] text-center text-[9px] font-bold uppercase tracking-widest text-zinc-600 font-mono">
        After Midnight © 2026 Admin Panel • Starmap System Configurator
      </footer>

    </div>
  );
}
