/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sliders,
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  Lock,
  Unlock,
  RotateCcw,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Loader2,
  Check,
  AlertCircle
} from "lucide-react";
import { saveAnnouncements, uploadAnnouncementIcon, AnnouncementItem, AlignmentConfig } from "@/app/actions/homepage";
import LotusWelcomeWidget from "@/components/morning-sketch/LotusWelcomeWidget";

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

  // 各調校區塊的鎖定狀態 (icon, tag, title, message, buttons)
  const [lockedBlocks, setLockedBlocks] = useState<Record<string, boolean>>({
    icon: false,
    tag: false,
    title: false,
    message: false,
    buttons: false
  });

  // 🔓 豁免全站防選取限制，允許開發者在後台點選與複製文字
  useEffect(() => {
    document.body.style.userSelect = "text";
    document.body.style.webkitUserSelect = "text";
    
    return () => {
      // 還原全站防選取防護
      document.body.style.userSelect = "";
      document.body.style.webkitUserSelect = "";
    };
  }, []);

  const handleAnnouncementChange = (idx: number, field: string, val: string) => {
    setAnnouncements(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: val };
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
        setSuccessMsg("首頁公告與精密對準參數已成功儲存並發布！");
        // 3 秒後自動清除成功訊息
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        setErrorMsg(res.error || "儲存失敗");
      }
    } catch {
      setErrorMsg("執行 Server Action 發生未知錯誤");
    } finally {
      setLoading(false);
    }
  };

  // 自定義圖標圖片上傳處理
  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await uploadAnnouncementIcon(String(activeSegment).padStart(2, "0"), formData);
      if (res.success && res.customIconUrl) {
        setAnnouncements(prev => {
          const updated = [...prev];
          const idx = activeSegment - 1;
          updated[idx] = { ...updated[idx], custom_icon_url: res.customIconUrl };
          return updated;
        });
        setSuccessMsg("圖標圖片上傳成功！別忘了點選下方的『儲存精密參數』發布更新。");
      } else {
        setErrorMsg(res.error || "上傳失敗");
      }
    } catch {
      setErrorMsg("執行上傳 Server Action 發生未知錯誤");
    } finally {
      setLoading(false);
    }
  };

  // 清除自訂圖片圖標
  const handleClearCustomIcon = () => {
    setAnnouncements(prev => {
      const updated = [...prev];
      const idx = activeSegment - 1;
      updated[idx] = { ...updated[idx], custom_icon_url: "" };
      return updated;
    });
    setSuccessMsg("已還原為預設蓮花 SVG 圖標，別忘了點選下方的『儲存精密參數』發布更新。");
  };

  // 數值精密微調 helper
  const adjustAlignment = (field: string, delta: number, min?: number, max?: number) => {
    setAnnouncements(prev => {
      const updated = [...prev];
      const idx = activeSegment - 1;
      
      const defaultAlignments: AlignmentConfig = {
        icon_x: 0,
        icon_y: 0,
        icon_scale: 100,
        title_font_size: 18,
        title_x: 0,
        title_y: 0,
        message_font_size: 13,
        message_x: 0,
        message_y: 0,
        buttons_x: 0,
        buttons_y: 0,
        tag_font_size: 10,
        tag_x: 0,
        tag_y: 0
      };

      const alignments = { ...defaultAlignments, ...updated[idx].alignments };
      const currentVal = alignments[field as keyof AlignmentConfig] ?? 0;
      let newVal = currentVal + delta;
      
      if (min !== undefined && newVal < min) newVal = min;
      if (max !== undefined && newVal > max) newVal = max;

      updated[idx] = {
        ...updated[idx],
        alignments: {
          ...alignments,
          [field]: newVal
        } as AlignmentConfig
      };
      return updated;
    });
  };

  // Reusable Slider + Number Input control rendering helper
  const renderAlignmentSlider = (
    label: string,
    field: keyof AlignmentConfig,
    currentAlignments: AlignmentConfig,
    min: number,
    max: number,
    unit: string = "px",
    disabled: boolean = false
  ) => {
    const value = currentAlignments[field] ?? 0;
    return (
      <div className={`space-y-1.5 p-3 rounded-xl bg-white/40 border border-[#8c7c6c]/10 transition-opacity duration-300 ${disabled ? "opacity-40" : ""}`}>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold text-[#8c7c6c]">{label}</span>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={min}
              max={max}
              value={value}
              disabled={disabled}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val)) {
                  adjustAlignment(field, val - value, min, max);
                }
              }}
              className="w-14 text-center text-xs font-mono text-[#3e2723] bg-white/80 border border-[#8c7c6c]/20 rounded py-0.5 focus:outline-none focus:border-[#82b7cc] disabled:cursor-not-allowed"
            />
            <span className="text-[10px] text-[#8c7c6c]/60 font-semibold">{unit}</span>
          </div>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          disabled={disabled}
          onChange={(e) => {
            const val = parseInt(e.target.value);
            if (!isNaN(val)) {
              adjustAlignment(field, val - value, min, max);
            }
          }}
          className="w-full h-1 bg-[#8c7c6c]/20 rounded-lg appearance-none cursor-pointer accent-[#8c7c6c] disabled:cursor-not-allowed"
        />
      </div>
    );
  };

  // 一鍵偏左、置中、偏右對齊
  const alignBlockX = (field: "icon_x" | "tag_x" | "title_x" | "message_x" | "buttons_x", alignment: "left" | "center" | "right") => {
    let targetX = 0;
    if (alignment === "left") targetX = -30;
    if (alignment === "right") targetX = 30;

    setAnnouncements(prev => {
      const updated = [...prev];
      const idx = activeSegment - 1;
      const defaultAlignments: AlignmentConfig = {
        icon_x: 0, icon_y: 0, icon_scale: 100,
        title_font_size: 18, title_x: 0, title_y: 0,
        message_font_size: 13, message_x: 0, message_y: 0,
        buttons_x: 0, buttons_y: 0,
        tag_font_size: 10, tag_x: 0, tag_y: 0
      };
      const alignments = { ...defaultAlignments, ...updated[idx].alignments };

      updated[idx] = {
        ...updated[idx],
        alignments: {
          ...alignments,
          [field]: targetX
        } as AlignmentConfig
      };
      return updated;
    });
  };

  // 一鍵返回預設值
  const resetBlockAlignments = (block: "icon" | "tag" | "title" | "message" | "buttons") => {
    const blockDefaults: Record<string, Partial<AlignmentConfig>> = {
      icon: { icon_scale: 100, icon_x: 0, icon_y: 0 },
      tag: { tag_font_size: 10, tag_x: 0, tag_y: 0 },
      title: { title_font_size: 18, title_x: 0, title_y: 0 },
      message: { message_font_size: 13, message_x: 0, message_y: 0 },
      buttons: { buttons_x: 0, buttons_y: 0 }
    };

    const defaults = blockDefaults[block];

    setAnnouncements(prev => {
      const updated = [...prev];
      const idx = activeSegment - 1;
      const defaultAlignments: AlignmentConfig = {
        icon_x: 0, icon_y: 0, icon_scale: 100,
        title_font_size: 18, title_x: 0, title_y: 0,
        message_font_size: 13, message_x: 0, message_y: 0,
        buttons_x: 0, buttons_y: 0,
        tag_font_size: 10, tag_x: 0, tag_y: 0
      };
      const alignments = { ...defaultAlignments, ...updated[idx].alignments };

      updated[idx] = {
        ...updated[idx],
        alignments: {
          ...alignments,
          ...defaults
        } as AlignmentConfig
      };
      return updated;
    });
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gradient-to-b from-[#fcf9f2] to-[#f3ecd8] text-[#5d4037] selection:bg-[#82b7cc] selection:text-slate-900 transition-colors duration-500">
      
      {/* 霓虹發光背景裝飾球 */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#82b7cc]/5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#f5d46b]/8 blur-[150px] pointer-events-none" />

      {/* 頂部導覽 */}
      <header className="sticky top-0 z-40 px-6 py-4 flex justify-between items-center border-b border-[#8c7c6c]/15 bg-white/70 backdrop-blur-xl text-[#3e2723] shadow-[0_1px_10px_rgba(140,124,108,0.05)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#8fa8a2] to-[#69857f] flex items-center justify-center shadow-[0_4px_12px_rgba(143,168,162,0.3)]">
            <Sliders size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-widest uppercase text-[#3e2723]">OVERWATCH social</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8c7c6c]">Homepage APC Aligner | 首頁精密調校儀</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-bold text-[#5d4037]">{currentUserEmail}</span>
            <span className="text-[9px] font-black tracking-wider text-emerald-600 uppercase flex items-center gap-1 justify-end">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active Developer
            </span>
          </div>
          <Link 
            href="/developer" 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border bg-white/80 hover:bg-[#8c7c6c]/10 text-[#8c7c6c] hover:text-[#3e2723] border-[#8c7c6c]/20 shadow-sm"
          >
            <ArrowLeft size={13} />
            <span>返回控制台</span>
          </Link>
        </div>
      </header>

      {/* 主體區域 */}
      <main className="flex-grow w-full mx-auto p-6 md:p-8 flex flex-col relative z-10 max-w-7xl">
        
        {/* 提示訊息 */}
        {successMsg && (
          <div className="mb-6 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/8 text-emerald-700 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <Check size={16} className="shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/8 text-red-700 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <AlertCircle size={16} className="shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 調校主表單 */}
        {announcements.length === 4 && (
          <form onSubmit={handleSaveAnnouncements} className="space-y-6">
            
            {/* 左右雙欄配置：左邊 Sticky 預覽，右邊調校 Form */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* 左欄：Sticky 即時預覽監視器 */}
              <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
                <div className="p-5 rounded-2xl border border-[#8c7c6c]/15 bg-white/40 backdrop-blur-md space-y-3">
                  <span className="text-[10px] font-black text-[#8c7c6c] uppercase tracking-widest block text-center">
                    🔍 即時製程監控預覽 (Closed Loop Process Live Monitor)
                  </span>
                  <div className="max-w-md mx-auto w-full border border-[#8c7c6c]/15 rounded-2xl overflow-hidden shadow-[0_10px_35px_rgba(140,124,108,0.06)]">
                    <LotusWelcomeWidget previewData={announcements} activeStepOverride={activeSegment} />
                  </div>
                </div>
              </div>

              {/* 右欄：Segmented Control 與各設定細項 */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* 選擇按鈕切換 Segmented Control */}
                <div className="bg-white/50 p-1.5 rounded-xl border border-[#8c7c6c]/15 flex gap-2 w-full">
                  {[1, 2, 3, 4].map(num => {
                    const isActive = activeSegment === num;
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => {
                          setActiveSegment(num);
                          setErrorMsg("");
                          setSuccessMsg("");
                        }}
                        className={`flex-1 text-center py-2 px-1 rounded-lg text-xs font-black tracking-wider uppercase transition-all cursor-pointer ${
                          isActive 
                            ? "bg-[#8c7c6c] text-white border border-[#8c7c6c]/20 shadow-sm shadow-[#8c7c6c]/10"
                            : "text-[#8c7c6c] hover:text-[#3e2723] hover:bg-[#8c7c6c]/5 border border-transparent"
                        }`}
                      >
                        首頁區塊 {num}
                      </button>
                    );
                  })}
                </div>

                {/* 調校主區域 */}
                <div className="space-y-6">
                  {announcements.map((item, idx) => {
                    const isSelected = activeSegment === idx + 1;
                    if (!isSelected) return null;

                    const alignments = item.alignments || {
                      icon_x: 0, icon_y: 0, icon_scale: 100,
                      title_font_size: 18, title_x: 0, title_y: 0,
                      message_font_size: 13, message_x: 0, message_y: 0,
                      buttons_x: 0, buttons_y: 0,
                      tag_font_size: 10, tag_x: 0, tag_y: 0
                    };

                    return (
                      <div key={item.num} className="space-y-6">
                        
                        {/* 1. 文字公告編輯區 */}
                        <div className="p-5 rounded-2xl border border-[#8c7c6c]/15 bg-white/50 space-y-4 shadow-sm">
                          <h3 className="text-xs font-black text-[#8c7c6c] uppercase tracking-widest border-b border-[#8c7c6c]/15 pb-2">
                            📝 內容文字編輯 (Announcements Data)
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-[#8c7c6c] uppercase tracking-wider">標籤 (Tag)</label>
                              <input
                                type="text"
                                value={item.tag}
                                onChange={(e) => handleAnnouncementChange(idx, "tag", e.target.value)}
                                className="w-full bg-white/80 border border-[#8c7c6c]/20 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#82b7cc] text-[#3e2723] placeholder-[#8c7c6c]/40"
                                required
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-[#8c7c6c] uppercase tracking-wider">標題 (Title)</label>
                              <input
                                type="text"
                                value={item.title}
                                onChange={(e) => handleAnnouncementChange(idx, "title", e.target.value)}
                                className="w-full bg-white/80 border border-[#8c7c6c]/20 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#82b7cc] text-[#3e2723] placeholder-[#8c7c6c]/40"
                                required
                              />
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-[#8c7c6c] uppercase tracking-wider">引言內容 (Message)</label>
                            <textarea
                              rows={3}
                              value={item.message}
                              onChange={(e) => handleAnnouncementChange(idx, "message", e.target.value)}
                              className="w-full bg-white/80 border border-[#8c7c6c]/20 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#82b7cc] text-[#3e2723] placeholder-[#8c7c6c]/40 leading-relaxed"
                              required
                            />
                          </div>
                        </div>

                        {/* 2. 圖標更換 */}
                        <div className="p-5 rounded-2xl border border-[#8c7c6c]/15 bg-white/50 space-y-4 shadow-sm">
                          <h3 className="text-xs font-black text-[#8c7c6c] uppercase tracking-widest border-b border-[#8c7c6c]/15 pb-2">
                            🖼️ 圖標自定義圖片 (Custom Image Icon)
                          </h3>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                            <div className="w-20 h-20 rounded-xl bg-white/80 border border-[#8c7c6c]/15 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                              {item.custom_icon_url ? (
                                <img src={item.custom_icon_url} alt="Icon preview" className="w-full h-full object-contain" />
                              ) : (
                                <div className="text-center text-[10px] text-[#8c7c6c]/70 font-bold p-1">
                                  <ImageIcon className="mx-auto text-[#8c7c6c]/50 mb-1" size={16} />
                                  預設蓮花 SVG
                                </div>
                              )}
                            </div>
                            <div className="space-y-3 flex-grow">
                              <p className="text-[10px] text-[#8c7c6c]/80 leading-relaxed">
                                上傳自定義的圖標圖片以更換該公告的頂部圖標。上傳成功後，首頁將渲染此圖片。
                              </p>
                              <div className="flex flex-wrap gap-3">
                                <label className="flex items-center gap-1.5 px-4 py-2 bg-[#8c7c6c] hover:bg-[#7a6a5b] text-white border border-[#8c7c6c]/20 rounded-xl text-xs font-black uppercase tracking-wider transition-all hover:scale-[1.02] cursor-pointer whitespace-nowrap shadow-sm">
                                  <Upload size={14} />
                                  <span>上傳自訂圖片</span>
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleIconUpload} 
                                    className="hidden" 
                                    disabled={loading}
                                  />
                                </label>
                                {item.custom_icon_url && (
                                  <button
                                    type="button"
                                    onClick={handleClearCustomIcon}
                                    disabled={loading}
                                    className="px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-xl text-xs font-black uppercase tracking-wider transition-all hover:scale-[1.02] cursor-pointer"
                                  >
                                    還原預設圖標
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 3. 精密位置補償調校 */}
                        <div className="space-y-6">
                          <div className="flex items-center gap-2 border-b border-[#8c7c6c]/15 pb-2">
                            <Sliders size={16} className="text-[#8c7c6c]" />
                            <h3 className="text-xs font-black text-[#8c7c6c] uppercase tracking-widest">
                              ⚙️ 精密位置與字型大小對準 (Closed Loop Calibration)
                            </h3>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* A. 圖標設定區塊 */}
                            <div className="p-5 rounded-2xl border border-[#8c7c6c]/15 bg-white/50 space-y-4 transition-all shadow-sm">
                              <div className="flex justify-between items-center border-b border-[#8c7c6c]/15 pb-2">
                                <span className="text-[11px] font-black text-[#3e2723] flex items-center gap-1.5">
                                  {lockedBlocks.icon ? "🔒" : "💮"} 圖標設定 (Icon Configs)
                                </span>
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center bg-[#8c7c6c]/5 border border-[#8c7c6c]/10 rounded-lg p-0.5">
                                    <button type="button" title="偏左對齊" disabled={lockedBlocks.icon} onClick={() => alignBlockX("icon_x", "left")} className="p-1 rounded text-[#8c7c6c] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"><AlignLeft size={12} /></button>
                                    <button type="button" title="置中對齊" disabled={lockedBlocks.icon} onClick={() => alignBlockX("icon_x", "center")} className="p-1 rounded text-[#8c7c6c] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"><AlignCenter size={12} /></button>
                                    <button type="button" title="偏右對齊" disabled={lockedBlocks.icon} onClick={() => alignBlockX("icon_x", "right")} className="p-1 rounded text-[#8c7c6c] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"><AlignRight size={12} /></button>
                                  </div>
                                  <button type="button" title="返回預設值" disabled={lockedBlocks.icon} onClick={() => resetBlockAlignments("icon")} className="p-1 rounded bg-[#8c7c6c]/5 hover:bg-white border border-[#8c7c6c]/10 text-[#8c7c6c] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"><RotateCcw size={12} /></button>
                                  <button type="button" title={lockedBlocks.icon ? "點選解鎖" : "點選鎖定"} onClick={() => setLockedBlocks(prev => ({ ...prev, icon: !prev.icon }))} className={`p-1 rounded border transition-all cursor-pointer ${lockedBlocks.icon ? "bg-amber-100 border-amber-300 text-amber-700 shadow-inner" : "bg-white border-[#8c7c6c]/20 text-[#8c7c6c] hover:bg-[#8c7c6c]/5"}`}>{lockedBlocks.icon ? <Lock size={12} /> : <Unlock size={12} />}</button>
                                </div>
                              </div>
                              <div className="space-y-3">
                                {renderAlignmentSlider("圖標大小比例", "icon_scale", alignments, 50, 150, "%", lockedBlocks.icon)}
                                {renderAlignmentSlider("圖標 X 軸位移", "icon_x", alignments, -50, 50, "px", lockedBlocks.icon)}
                                {renderAlignmentSlider("圖標 Y 軸位移", "icon_y", alignments, -50, 50, "px", lockedBlocks.icon)}
                              </div>
                            </div>

                            {/* B. 標籤設定區塊 */}
                            <div className="p-5 rounded-2xl border border-[#8c7c6c]/15 bg-white/50 space-y-4 transition-all shadow-sm">
                              <div className="flex justify-between items-center border-b border-[#8c7c6c]/15 pb-2">
                                <span className="text-[11px] font-black text-[#3e2723] flex items-center gap-1.5">
                                  {lockedBlocks.tag ? "🔒" : "🏷️"} 標籤設定 (Tag Configs)
                                </span>
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center bg-[#8c7c6c]/5 border border-[#8c7c6c]/10 rounded-lg p-0.5">
                                    <button type="button" title="偏左對齊" disabled={lockedBlocks.tag} onClick={() => alignBlockX("tag_x", "left")} className="p-1 rounded text-[#8c7c6c] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"><AlignLeft size={12} /></button>
                                    <button type="button" title="置中對齊" disabled={lockedBlocks.tag} onClick={() => alignBlockX("tag_x", "center")} className="p-1 rounded text-[#8c7c6c] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"><AlignCenter size={12} /></button>
                                    <button type="button" title="偏右對齊" disabled={lockedBlocks.tag} onClick={() => alignBlockX("tag_x", "right")} className="p-1 rounded text-[#8c7c6c] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"><AlignRight size={12} /></button>
                                  </div>
                                  <button type="button" title="返回預設值" disabled={lockedBlocks.tag} onClick={() => resetBlockAlignments("tag")} className="p-1 rounded bg-[#8c7c6c]/5 hover:bg-white border border-[#8c7c6c]/10 text-[#8c7c6c] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"><RotateCcw size={12} /></button>
                                  <button type="button" title={lockedBlocks.tag ? "點選解鎖" : "點選鎖定"} onClick={() => setLockedBlocks(prev => ({ ...prev, tag: !prev.tag }))} className={`p-1 rounded border transition-all cursor-pointer ${lockedBlocks.tag ? "bg-amber-100 border-amber-300 text-amber-700 shadow-inner" : "bg-white border-[#8c7c6c]/20 text-[#8c7c6c] hover:bg-[#8c7c6c]/5"}`}>{lockedBlocks.tag ? <Lock size={12} /> : <Unlock size={12} />}</button>
                                </div>
                              </div>
                              <div className="space-y-3">
                                {renderAlignmentSlider("標籤字體大小", "tag_font_size", alignments, 8, 18, "px", lockedBlocks.tag)}
                                {renderAlignmentSlider("標籤 X 軸位移", "tag_x", alignments, -50, 50, "px", lockedBlocks.tag)}
                                {renderAlignmentSlider("標籤 Y 軸位移", "tag_y", alignments, -50, 50, "px", lockedBlocks.tag)}
                              </div>
                            </div>

                            {/* C. 標題設定區塊 */}
                            <div className="p-5 rounded-2xl border border-[#8c7c6c]/15 bg-white/50 space-y-4 transition-all shadow-sm">
                              <div className="flex justify-between items-center border-b border-[#8c7c6c]/15 pb-2">
                                <span className="text-[11px] font-black text-[#3e2723] flex items-center gap-1.5">
                                  {lockedBlocks.title ? "🔒" : "📝"} 標題設定 (Title Configs)
                                </span>
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center bg-[#8c7c6c]/5 border border-[#8c7c6c]/10 rounded-lg p-0.5">
                                    <button type="button" title="偏左對齊" disabled={lockedBlocks.title} onClick={() => alignBlockX("title_x", "left")} className="p-1 rounded text-[#8c7c6c] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"><AlignLeft size={12} /></button>
                                    <button type="button" title="置中對齊" disabled={lockedBlocks.title} onClick={() => alignBlockX("title_x", "center")} className="p-1 rounded text-[#8c7c6c] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"><AlignCenter size={12} /></button>
                                    <button type="button" title="偏右對齊" disabled={lockedBlocks.title} onClick={() => alignBlockX("title_x", "right")} className="p-1 rounded text-[#8c7c6c] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"><AlignRight size={12} /></button>
                                  </div>
                                  <button type="button" title="返回預設值" disabled={lockedBlocks.title} onClick={() => resetBlockAlignments("title")} className="p-1 rounded bg-[#8c7c6c]/5 hover:bg-white border border-[#8c7c6c]/10 text-[#8c7c6c] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"><RotateCcw size={12} /></button>
                                  <button type="button" title={lockedBlocks.title ? "點選解鎖" : "點選鎖定"} onClick={() => setLockedBlocks(prev => ({ ...prev, title: !prev.title }))} className={`p-1 rounded border transition-all cursor-pointer ${lockedBlocks.title ? "bg-amber-100 border-amber-300 text-amber-700 shadow-inner" : "bg-white border-[#8c7c6c]/20 text-[#8c7c6c] hover:bg-[#8c7c6c]/5"}`}>{lockedBlocks.title ? <Lock size={12} /> : <Unlock size={12} />}</button>
                                </div>
                              </div>
                              <div className="space-y-3">
                                {renderAlignmentSlider("標題字體大小", "title_font_size", alignments, 10, 28, "px", lockedBlocks.title)}
                                {renderAlignmentSlider("標題 X 軸位移", "title_x", alignments, -50, 50, "px", lockedBlocks.title)}
                                {renderAlignmentSlider("標題 Y 軸位移", "title_y", alignments, -50, 50, "px", lockedBlocks.title)}
                              </div>
                            </div>

                            {/* D. 內文設定區塊 */}
                            <div className="p-5 rounded-2xl border border-[#8c7c6c]/15 bg-white/50 space-y-4 transition-all shadow-sm">
                              <div className="flex justify-between items-center border-b border-[#8c7c6c]/15 pb-2">
                                <span className="text-[11px] font-black text-[#3e2723] flex items-center gap-1.5">
                                  {lockedBlocks.message ? "🔒" : "💬"} 內文設定 (Message Configs)
                                </span>
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center bg-[#8c7c6c]/5 border border-[#8c7c6c]/10 rounded-lg p-0.5">
                                    <button type="button" title="偏左對齊" disabled={lockedBlocks.message} onClick={() => alignBlockX("message_x", "left")} className="p-1 rounded text-[#8c7c6c] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"><AlignLeft size={12} /></button>
                                    <button type="button" title="置中對齊" disabled={lockedBlocks.message} onClick={() => alignBlockX("message_x", "center")} className="p-1 rounded text-[#8c7c6c] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"><AlignCenter size={12} /></button>
                                    <button type="button" title="偏右對齊" disabled={lockedBlocks.message} onClick={() => alignBlockX("message_x", "right")} className="p-1 rounded text-[#8c7c6c] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"><AlignRight size={12} /></button>
                                  </div>
                                  <button type="button" title="返回預設值" disabled={lockedBlocks.message} onClick={() => resetBlockAlignments("message")} className="p-1 rounded bg-[#8c7c6c]/5 hover:bg-white border border-[#8c7c6c]/10 text-[#8c7c6c] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"><RotateCcw size={12} /></button>
                                  <button type="button" title={lockedBlocks.message ? "點選解鎖" : "點選鎖定"} onClick={() => setLockedBlocks(prev => ({ ...prev, message: !prev.message }))} className={`p-1 rounded border transition-all cursor-pointer ${lockedBlocks.message ? "bg-amber-100 border-amber-300 text-amber-700 shadow-inner" : "bg-white border-[#8c7c6c]/20 text-[#8c7c6c] hover:bg-[#8c7c6c]/5"}`}>{lockedBlocks.message ? <Lock size={12} /> : <Unlock size={12} />}</button>
                                </div>
                              </div>
                              <div className="space-y-3">
                                {renderAlignmentSlider("內文字體大小", "message_font_size", alignments, 10, 20, "px", lockedBlocks.message)}
                                {renderAlignmentSlider("內文 X 軸位移", "message_x", alignments, -50, 50, "px", lockedBlocks.message)}
                                {renderAlignmentSlider("內文 Y 軸位移", "message_y", alignments, -50, 50, "px", lockedBlocks.message)}
                              </div>
                            </div>

                            {/* E. 按鈕組設定區塊 */}
                            <div className="p-5 rounded-2xl border border-[#8c7c6c]/15 bg-white/50 space-y-4 transition-all md:col-span-2 shadow-sm">
                              <div className="flex justify-between items-center border-b border-[#8c7c6c]/15 pb-2">
                                <span className="text-[11px] font-black text-[#3e2723] flex items-center gap-1.5">
                                  {lockedBlocks.buttons ? "🔒" : "🔘"} 按鈕組設定 (Buttons Configs)
                                </span>
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center bg-[#8c7c6c]/5 border border-[#8c7c6c]/10 rounded-lg p-0.5">
                                    <button type="button" title="偏左對齊" disabled={lockedBlocks.buttons} onClick={() => alignBlockX("buttons_x", "left")} className="p-1 rounded text-[#8c7c6c] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"><AlignLeft size={12} /></button>
                                    <button type="button" title="置中對齊" disabled={lockedBlocks.buttons} onClick={() => alignBlockX("buttons_x", "center")} className="p-1 rounded text-[#8c7c6c] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"><AlignCenter size={12} /></button>
                                    <button type="button" title="偏右對齊" disabled={lockedBlocks.buttons} onClick={() => alignBlockX("buttons_x", "right")} className="p-1 rounded text-[#8c7c6c] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"><AlignRight size={12} /></button>
                                  </div>
                                  <button type="button" title="返回預設值" disabled={lockedBlocks.buttons} onClick={() => resetBlockAlignments("buttons")} className="p-1 rounded bg-[#8c7c6c]/5 hover:bg-white border border-[#8c7c6c]/10 text-[#8c7c6c] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"><RotateCcw size={12} /></button>
                                  <button type="button" title={lockedBlocks.buttons ? "點選解鎖" : "點選鎖定"} onClick={() => setLockedBlocks(prev => ({ ...prev, buttons: !prev.buttons }))} className={`p-1 rounded border transition-all cursor-pointer ${lockedBlocks.buttons ? "bg-amber-100 border-amber-300 text-amber-700 shadow-inner" : "bg-white border-[#8c7c6c]/20 text-[#8c7c6c] hover:bg-[#8c7c6c]/5"}`}>{lockedBlocks.buttons ? <Lock size={12} /> : <Unlock size={12} />}</button>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {renderAlignmentSlider("按鈕組 X 軸位移", "buttons_x", alignments, -50, 50, "px", lockedBlocks.buttons)}
                                {renderAlignmentSlider("按鈕組 Y 軸位移", "buttons_y", alignments, -50, 50, "px", lockedBlocks.buttons)}
                              </div>
                            </div>

                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={loading || announcements.length !== 4}
                    className="bg-[#8c7c6c] hover:bg-[#7a6a5b] text-white px-6 py-3 rounded-xl text-xs font-black tracking-widest uppercase transition-all hover:scale-[1.02] shadow-[0_4px_12px_rgba(140,124,108,0.3)] disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center gap-2"
                  >
                    {loading && <Loader2 size={14} className="animate-spin" />}
                    <span>{loading ? "正在發布精密參數..." : "💾 儲存精密參數"}
                    </span>
                  </button>
                </div>

              </div>

            </div>

          </form>
        )}

      </main>

      <footer className="mt-auto py-6 border-t border-[#8c7c6c]/10 text-center text-[10px] font-bold uppercase tracking-widest text-[#8c7c6c]/60">
        Overwatch Social © 2026 Admin Panel • Closed Loop Process Control
      </footer>

    </div>
  );
}
