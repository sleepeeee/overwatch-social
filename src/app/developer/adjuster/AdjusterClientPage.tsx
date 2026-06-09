"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Lock,
  Unlock,
  RotateCcw,
  Copy,
  Check,
  Grid,
  Sliders,
  Search,
  Flame,
  Cpu,
  ChevronDown,
  Save,
  ArrowLeft
} from "lucide-react";
import OWCard from "@/components/OWCard";
import { HEROES_CONFIG } from "@/data/mockPlayers";
import { HERO_ALIGNMENTS, DEFAULT_ALIGNMENT, AlignmentConfig } from "@/data/heroAlignments";
import { OWPlayerCard } from "@/types/card";
import { saveHeroAlignments } from "@/app/actions/saveAlignment";

export default function AdjusterPage() {
  // 1. 狀態管理
  const [selectedHeroId, setSelectedHeroId] = useState<string>("tracer");
  const [scale, setScale] = useState<number>(1.8);
  const [translateX, setTranslateX] = useState<number>(0);
  const [translateY, setTranslateY] = useState<number>(15);
  
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [copiedCurrent, setCopiedCurrent] = useState<boolean>(false);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // 獨立鎖定狀態管理 (每個英雄擁有自己獨立的鎖定狀態，儲存於 LocalStorage)
  const [lockedHeroes, setLockedHeroes] = useState<Record<string, boolean>>({});
  
  // 自動製程控制即時寫入狀態提示 (APC Notification Status)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [saveMessage, setSaveMessage] = useState<string>("");

  // 儲存所有英雄的動態對齊狀態，以便在切換英雄時保留先前的微調結果
  const [alignments, setAlignments] = useState<Record<string, AlignmentConfig>>(() => {
    const initial: Record<string, AlignmentConfig> = { ...HERO_ALIGNMENTS };
    HEROES_CONFIG.forEach((hero) => {
      if (!initial[hero.id]) {
        initial[hero.id] = { ...DEFAULT_ALIGNMENT };
      }
    });
    return initial;
  });

  // 初始化時加載鎖定記錄並解鎖選取限制
  useEffect(() => {
    try {
      const stored = localStorage.getItem("ow_locked_heroes");
      if (stored) {
        setLockedHeroes(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to parse locked heroes:", e);
    }

    // 🔓 豁免全站防選取限制，允許開發者在後台點選與複製文字
    document.body.style.userSelect = "text";
    document.body.style.webkitUserSelect = "text";
    
    return () => {
      // 還原全站防選取防護
      document.body.style.userSelect = "";
      document.body.style.webkitUserSelect = "";
    };
  }, []);

  // 2. 當切換選擇英雄時，自動載入該英雄已儲存的微調參數
  useEffect(() => {
    const currentAlign = alignments[selectedHeroId] || DEFAULT_ALIGNMENT;
    setScale(currentAlign.scale);
    setTranslateX(currentAlign.translateX);
    setTranslateY(currentAlign.translateY);
  }, [selectedHeroId]);

  // 當前英雄是否被鎖定
  const isLocked = lockedHeroes[selectedHeroId] || false;
  const currentHero = HEROES_CONFIG.find((h) => h.id === selectedHeroId) || HEROES_CONFIG[0];

  // 3. 當滑動滑桿時，實時更新當前英雄的 alignments record
  const handleScaleChange = (val: number) => {
    if (isLocked) return;
    setScale(val);
    setAlignments(prev => ({
      ...prev,
      [selectedHeroId]: { scale: val, translateX, translateY }
    }));
  };

  const handleTranslateXChange = (val: number) => {
    if (isLocked) return;
    setTranslateX(val);
    setAlignments(prev => ({
      ...prev,
      [selectedHeroId]: { scale, translateX: val, translateY }
    }));
  };

  const handleTranslateYChange = (val: number) => {
    if (isLocked) return;
    setTranslateY(val);
    setAlignments(prev => ({
      ...prev,
      [selectedHeroId]: { scale, translateX, translateY: val }
    }));
  };

  // 4. 切換鎖定狀態 (🔒 鎖定確認，解鎖數據)
  // 當使用者點擊「鎖定確認」時，系統將當前全體最新對齊數據，直接持久化寫入實體檔案 src/data/heroAlignments.ts 中！
  const toggleLock = async () => {
    const nextLocked = !isLocked;
    
    // 更新鎖定狀態與 localStorage
    const updatedLocked = { ...lockedHeroes, [selectedHeroId]: nextLocked };
    setLockedHeroes(updatedLocked);
    try {
      localStorage.setItem("ow_locked_heroes", JSON.stringify(updatedLocked));
    } catch (e) {
      console.error("Failed to write localStorage:", e);
    }

    // 🔒 點選鎖定代表「確認並同步修改前端」
    if (nextLocked) {
      setSaveStatus("saving");
      setSaveMessage(`正在將 ${currentHero.name} 的微調對齊數據持久化寫入實體設定檔...`);
      
      const latestAlignments = {
        ...alignments,
        [selectedHeroId]: { scale, translateX, translateY }
      };

      const res = await saveHeroAlignments(latestAlignments);
      if (res.success) {
        setSaveStatus("success");
        setSaveMessage(`✅ ${currentHero.name} 對齊參數已鎖定並寫入 heroAlignments.ts，前端卡片已即刻即時生效！`);
        setTimeout(() => {
          setSaveStatus("idle");
        }, 3500);
      } else {
        setSaveStatus("error");
        setSaveMessage(`❌ 寫入實體設定檔失敗：${res.error}`);
      }
    } else {
      // 🔓 解鎖僅作提示，不寫入檔案，待使用者調整完再次鎖定確認時寫入
      setSaveStatus("success");
      setSaveMessage(`🔓 ${currentHero.name} 已解除鎖定，您可以拖曳滑桿進行像素級微調。`);
      setTimeout(() => {
        setSaveStatus("idle");
      }, 2500);
    }
  };

  // 5. 重置為預設值並直接同步寫入檔案
  const handleReset = async () => {
    if (isLocked) return;
    
    const nextAlignments = {
      ...alignments,
      [selectedHeroId]: { ...DEFAULT_ALIGNMENT }
    };

    setScale(DEFAULT_ALIGNMENT.scale);
    setTranslateX(DEFAULT_ALIGNMENT.translateX);
    setTranslateY(DEFAULT_ALIGNMENT.translateY);
    setAlignments(nextAlignments);

    setSaveStatus("saving");
    setSaveMessage(`正在重設 ${currentHero.name} 的參數並同步寫入檔案...`);

    const res = await saveHeroAlignments(nextAlignments);
    if (res.success) {
      setSaveStatus("success");
      setSaveMessage(`🔄 ${currentHero.name} 對齊數據已成功恢復為系統預設值，全站即時同步生效！`);
      setTimeout(() => {
        setSaveStatus("idle");
      }, 3500);
    } else {
      setSaveStatus("error");
      setSaveMessage(`❌ 寫入實體設定檔失敗：${res.error}`);
    }
  };

  // 一鍵手動儲存全體（當前所有未鎖定但已調整的數據一併寫入）
  const handleManualSaveAll = async () => {
    setSaveStatus("saving");
    setSaveMessage("正在同步儲存所有已變更的特工對齊參數...");
    
    const res = await saveHeroAlignments(alignments);
    if (res.success) {
      setSaveStatus("success");
      setSaveMessage("✅ 所有特工對齊參數已完美同步持久化寫入實體檔案，全站均已生效！");
      setTimeout(() => {
        setSaveStatus("idle");
      }, 3500);
    } else {
      setSaveStatus("error");
      setSaveMessage(`❌ 儲存失敗：${res.error}`);
    }
  };

  // 6. 複製當前特工 JSON
  const handleCopyCurrent = () => {
    const formatted = `  "${selectedHeroId}": {\n    scale: ${scale.toFixed(2)},\n    translateX: ${translateX},\n    translateY: ${translateY}\n  },`;
    navigator.clipboard.writeText(formatted);
    setCopiedCurrent(true);
    setTimeout(() => setCopiedCurrent(false), 2000);
  };

  // 7. 複製全體 JSON (TS export 格式)
  const handleCopyAll = () => {
    let output = "export const HERO_ALIGNMENTS: Record<string, AlignmentConfig> = {\n";
    HEROES_CONFIG.forEach((hero) => {
      const align = alignments[hero.id] || DEFAULT_ALIGNMENT;
      output += `  "${hero.id}": {\n    scale: ${align.scale.toFixed(2)},\n    translateX: ${align.translateX},\n    translateY: ${align.translateY}\n  },\n`;
    });
    output = output.slice(0, -2); // 移除最後的逗號與換行
    output += "\n};";

    navigator.clipboard.writeText(output);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  // 8. 篩選英雄列表
  const filteredHeroes = HEROES_CONFIG.filter(
    (h) =>
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 9. 精密對照組 CardData
  // 第一欄是正在微調的英雄，第二欄是溫斯頓(大體型對照)，第三欄是閃光(纖細體型對照)
  // 如果正在微調的就是溫斯頓或閃光，就用安娜/壁壘機兵作為對照，以保證三欄不同
  const secondSlot = selectedHeroId === "winston" ? "ana" : "winston";
  const thirdSlot = selectedHeroId === "tracer" ? "bastion" : "tracer";

  const mockCardData: OWPlayerCard = {
    card_id: "dev-adjuster",
    user_id: "dev-user",
    server: "亞太伺服器",
    battle_tag: "Developer#8888",
    is_tag_visible: true,
    selected_heroes: [selectedHeroId, secondSlot, thirdSlot],
    tags: ["精密對齊", "黃光微調", "莫蘭迪暖灰"],
    message: `「黃光曝光對準標記監控中」正在微調 ${currentHero.name} 的胸像幾何補償...`,
    languages: ["繁體中文", "English"],
    mic_status: "mic-on",
    social_channels: { discord: "Developer#8888", game_voice: "Developer#8888" },
    mbti: "INTJ"
  };

  return (
    <div className="min-h-screen py-10 px-4 md:px-8 max-w-7xl mx-auto flex flex-col gap-8">
      {/* 🌸 [Lithography Header] 電競與半導體微影黃光雙重美學標頭 */}
      <div className="relative p-6 rounded-[24px] bg-white/40 backdrop-blur-md border border-[#8c7c6c]/18 overflow-hidden shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 animate-[fadeIn_0.5s_use-out]">
        <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-[#82b7cc] to-[#d8a070]" />
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <Badge className="bg-[#82b7cc]/12 text-[#82b7cc] border border-[#82b7cc]/25 hover:bg-[#82b7cc]/20 font-black tracking-widest text-[10px] uppercase py-0.5">
              Lithography Overlay & Offset Compensator
            </Badge>
            <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/15 hover:bg-emerald-500/15 font-black tracking-widest text-[10px] uppercase py-0.5">
              Wafer Level Align v1.3
            </Badge>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[#5d4037]">
            特工幾何精密對齊微調器 <span className="text-[#82b7cc] font-medium">/ Developer Adjuster</span>
          </h1>
          <p className="text-xs text-[#8c7c6c] mt-1.5 font-medium leading-relaxed max-w-2xl">
            由於鬥陣特工高畫質立繪帶有大面積透明邊距，且各英雄之重心幾何不同，本對準儀採用
            <span className="text-[#d8a070] font-bold">「黃光對齊與疊合偏置 (Lithography Overlay Offset)」</span>
            補償架構，提供像素級胸像裁切對準，本版本支援<span className="text-[#82b7cc] font-bold">「單個英雄獨立鎖定」</span>，並於鎖定時<span className="text-emerald-600 font-bold">自動實時同步寫入物理檔案</span>！
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0 self-end md:self-center">
          <Link href="/developer">
            <Button
              variant="outline"
              className="border-[#8c7c6c]/20 text-[#8c7c6c] hover:bg-[#8c7c6c]/8 font-bold text-xs gap-1.5 rounded-xl h-10"
            >
              <ArrowLeft size={15} />
              返回工具箱
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => setShowGrid(!showGrid)}
            className={`border-[#8c7c6c]/20 text-[#8c7c6c] hover:bg-[#8c7c6c]/8 font-bold text-xs gap-1.5 rounded-xl h-10 ${
              showGrid ? "bg-[#82b7cc]/10 text-[#82b7cc] border-[#82b7cc]/30 hover:bg-[#82b7cc]/15" : ""
            }`}
          >
            <Grid size={15} />
            {showGrid ? "關閉對準光罩" : "開啟對準光罩"}
          </Button>
          <Button
            onClick={handleManualSaveAll}
            className="bg-[#d8a070] hover:bg-[#c28e60] text-white font-bold text-xs gap-1.5 rounded-xl h-10 shadow-[0_4px_12px_rgba(216,160,112,0.15)]"
          >
            <Save size={15} />
            手動存檔全體
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* 💻 [Left Column] 微影光罩控制台 (Lg: 7) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="p-6 rounded-[24px] bg-white/70 backdrop-blur-md border border-[#8c7c6c]/18 shadow-[0_15px_45px_rgba(140,124,108,0.04)] flex flex-col gap-6">
            
            {/* 🎯 1. 英雄搜尋與選擇 */}
            <div>
              <label className="text-[11px] font-black tracking-widest text-[#8c7c6c]/80 uppercase block mb-2">
                1. 選擇待校對特工 (Select Agent Target)
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-3 flex items-center text-[#8c7c6c]/60 pointer-events-none">
                    <Search size={16} />
                  </span>
                  <input
                    type="text"
                    placeholder="搜尋特工姓名或 ID (例如 D.Va / tracer)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#8c7c6c]/18 bg-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-[#82b7cc]/30 focus:border-[#82b7cc] transition-all font-bold text-[#5d4037]"
                  />
                </div>
                <div className="relative min-w-[200px]">
                  <select
                    value={selectedHeroId}
                    onChange={(e) => setSelectedHeroId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#8c7c6c]/18 bg-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-[#82b7cc]/30 focus:border-[#82b7cc] transition-all appearance-none font-bold text-[#5d4037] cursor-pointer"
                  >
                    {filteredHeroes.map((hero) => {
                      const heroLocked = lockedHeroes[hero.id] || false;
                      return (
                        <option key={hero.id} value={hero.id}>
                          {heroLocked ? "🔒 " : ""}
                          {hero.name} ({hero.id.toUpperCase()})
                        </option>
                      );
                    })}
                  </select>
                  <span className="absolute inset-y-0 right-3 flex items-center text-[#8c7c6c]/60 pointer-events-none">
                    <ChevronDown size={16} />
                  </span>
                </div>
              </div>
              {filteredHeroes.length === 0 && (
                <p className="text-[11px] text-red-500 font-bold mt-1">
                  ⚠️ 未尋找到相符的特工，請重新輸入關鍵字。
                </p>
              )}
            </div>

            {/* 🎚️ 2. 疊合補償微調滑桿 (Overlay Compensation Sliders) */}
            <div className="border-t border-[#8c7c6c]/12 pt-5 flex flex-col gap-5">
              
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] font-black tracking-widest text-[#8c7c6c]/80 uppercase flex items-center gap-1.5">
                  <Sliders size={13} className="text-[#82b7cc]" />
                  2. 幾何偏置補償參數 (Overlay Offset Compensators)
                </span>
                {isLocked ? (
                  <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/15 font-black uppercase text-[10px] flex items-center gap-1">
                    <Lock size={10} />
                    {currentHero.name} 已鎖定存檔
                  </Badge>
                ) : (
                  <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/15 font-black uppercase text-[10px] flex items-center gap-1 animate-pulse">
                    <Unlock size={10} />
                    開放調校中
                  </Badge>
                )}
              </div>

              {/* 🌸 [APC Real-time Response Notification] 實時寫入設定檔狀態發光通知條 */}
              {saveStatus !== "idle" && (
                <div className={`p-3 rounded-xl border text-xs font-bold transition-all duration-300 flex items-center gap-2 shadow-sm ${
                  saveStatus === "saving" ? "bg-amber-500/8 text-amber-600 border-amber-500/15 animate-pulse" :
                  saveStatus === "success" ? "bg-emerald-500/8 text-emerald-600 border-emerald-500/15 shadow-[0_2px_10px_rgba(16,185,129,0.05)]" :
                  "bg-red-500/8 text-red-600 border-red-500/15"
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    saveStatus === "saving" ? "bg-amber-500" :
                    saveStatus === "success" ? "bg-emerald-500" : "bg-red-500"
                  }`} />
                  <p className="flex-1 leading-relaxed">{saveMessage}</p>
                </div>
              )}

              {/* 1. 放大倍率 (Scale) */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-[#5d4037] flex items-center gap-1">
                    放大倍率 <span className="text-[#8c7c6c] font-medium text-[10px]">(Scale Factor)</span>
                  </span>
                  <span className={`font-mono text-sm px-2 py-0.5 rounded border ${
                    isLocked 
                      ? "bg-gray-100 text-gray-500 border-gray-200" 
                      : "bg-[#82b7cc]/8 text-[#82b7cc] border-[#82b7cc]/15"
                  }`}>
                    {scale.toFixed(2)}x
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-bold text-[#8c7c6c] w-6">1.0x</span>
                  <input
                    type="range"
                    min="1.0"
                    max="3.0"
                    step="0.05"
                    disabled={isLocked}
                    value={scale}
                    onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
                    className="flex-1 h-1.5 rounded-lg appearance-none cursor-pointer bg-gray-200 accent-[#82b7cc] disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                  <span className="text-[10px] font-bold text-[#8c7c6c] w-6 text-right">3.0x</span>
                </div>
              </div>

              {/* 2. X 軸偏置平移 (Translate X) */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-[#5d4037] flex items-center gap-1">
                    X軸對齊偏置 <span className="text-[#8c7c6c] font-medium text-[10px]">(Horizontal Offset)</span>
                  </span>
                  <span className={`font-mono text-sm px-2 py-0.5 rounded border ${
                    isLocked 
                      ? "bg-gray-100 text-gray-500 border-gray-200" 
                      : "bg-[#d8a070]/8 text-[#d8a070] border-[#d8a070]/15"
                  }`}>
                    {translateX > 0 ? `+${translateX}` : translateX}%
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-bold text-[#8c7c6c] w-6">-50%</span>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    step="1"
                    disabled={isLocked}
                    value={translateX}
                    onChange={(e) => handleTranslateXChange(parseInt(e.target.value))}
                    className="flex-1 h-1.5 rounded-lg appearance-none cursor-pointer bg-gray-200 accent-[#d8a070] disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                  <span className="text-[10px] font-bold text-[#8c7c6c] w-6 text-right">+50%</span>
                </div>
              </div>

              {/* 3. Y 軸偏置平移 (Translate Y) */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-[#5d4037] flex items-center gap-1">
                    Y軸垂直偏置 <span className="text-[#8c7c6c] font-medium text-[10px]">(Vertical Offset)</span>
                  </span>
                  <span className={`font-mono text-sm px-2 py-0.5 rounded border ${
                    isLocked 
                      ? "bg-gray-100 text-gray-500 border-gray-200" 
                      : "bg-[#82b7cc]/8 text-[#82b7cc] border-[#82b7cc]/15"
                  }`}>
                    {translateY > 0 ? `+${translateY}` : translateY}%
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-bold text-[#8c7c6c] w-6">-50%</span>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    step="1"
                    disabled={isLocked}
                    value={translateY}
                    onChange={(e) => handleTranslateYChange(parseInt(e.target.value))}
                    className="flex-1 h-1.5 rounded-lg appearance-none cursor-pointer bg-gray-200 accent-[#82b7cc] disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                  <span className="text-[10px] font-bold text-[#8c7c6c] w-6 text-right">+50%</span>
                </div>
              </div>
            </div>

            {/* 🛠️ 工具列按鈕組 (Control Actions) */}
            <div className="flex flex-wrap gap-3 border-t border-[#8c7c6c]/12 pt-5">
              {/* 🔒 固定數據 / 鎖定並直接寫入 */}
              <Button
                variant={isLocked ? "default" : "outline"}
                onClick={toggleLock}
                className={`flex-1 min-w-[130px] font-extrabold text-xs rounded-xl h-11 border transition-all duration-300 gap-1.5 ${
                  isLocked 
                    ? "bg-[#d8a070] hover:bg-[#c28e60] text-white border-[#d8a070] shadow-[0_4px_14px_rgba(216,160,112,0.25)]" 
                    : "border-[#8c7c6c]/20 text-[#8c7c6c] hover:bg-[#8c7c6c]/8 hover:border-[#82b7cc]/40"
                }`}
              >
                {isLocked ? <Lock size={15} /> : <Unlock size={15} />}
                {isLocked ? `解鎖 ${currentHero.name} 🔓` : `鎖定確認 ${currentHero.name} 🔒`}
              </Button>

              {/* 🔄 重置預設 */}
              <Button
                variant="outline"
                disabled={isLocked}
                onClick={handleReset}
                className="flex-1 min-w-[130px] font-extrabold text-xs rounded-xl h-11 border border-[#8c7c6c]/20 text-[#8c7c6c] hover:bg-[#8c7c6c]/8 gap-1.5 disabled:opacity-30"
              >
                <RotateCcw size={15} />
                還原為系統預設
              </Button>
            </div>

          </div>

          {/* 📋 3. 對齊代碼輸出區 (JSON/Code Output Console) */}
          <div className="p-6 rounded-[24px] bg-white/70 backdrop-blur-md border border-[#8c7c6c]/18 shadow-[0_15px_45px_rgba(140,124,108,0.04)] flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <span className="text-[11px] font-black tracking-widest text-[#8c7c6c]/80 uppercase flex items-center gap-1.5">
                <Cpu size={13} className="text-[#82b7cc]" />
                3. 精密對齊設定代碼輸出 (Alignment Code Console)
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleCopyCurrent}
                  className="bg-white/80 hover:bg-white text-[#8c7c6c] border border-[#8c7c6c]/15 hover:border-[#82b7cc] rounded-lg text-[10px] font-bold px-2.5 h-7 gap-1"
                >
                  {copiedCurrent ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                  {copiedCurrent ? "已複製" : "複製當前"}
                </Button>
                <Button
                  size="sm"
                  onClick={handleCopyAll}
                  className="bg-[#82b7cc] hover:bg-[#6faec4] text-white rounded-lg text-[10px] font-bold px-2.5 h-7 gap-1 shadow-sm"
                >
                  {copiedAll ? <Check size={11} className="text-white" /> : <Copy size={11} />}
                  {copiedAll ? "已複製全體" : "複製全體 TS 配置"}
                </Button>
              </div>
            </div>

            {/* Code Blocks 展示 */}
            <div className="flex flex-col gap-3 font-mono text-[11px] leading-relaxed">
              <div>
                <span className="text-[10px] font-extrabold text-[#8c7c6c] block mb-1">【當前特工對齊參數 (單一英雄 JSON)】</span>
                <pre className="bg-[#5d4037]/5 border border-[#5d4037]/10 p-3 rounded-xl overflow-x-auto text-[#5d4037] font-semibold">
{`  "${selectedHeroId}": {
    scale: ${scale.toFixed(2)},
    translateX: ${translateX},
    translateY: ${translateY}
  },`}
                </pre>
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-[#8c7c6c] block mb-1">【實時同步檔案目標 (Physical File target)】</span>
                <div className="bg-[#82b7cc]/5 border border-[#82b7cc]/12 px-3 py-2 rounded-xl text-[#82b7cc] font-extrabold flex justify-between items-center">
                  <span>src/data/heroAlignments.ts</span>
                  <span className="text-[9px] bg-[#82b7cc]/15 px-1.5 py-0.5 rounded text-emerald-600">DIRECT WRITE</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 🔬 [Right Column] 精密對齊與疊合成像驗證區 (Lg: 5) */}
        <div className="lg:col-span-5 flex flex-col gap-6 items-center sticky top-6">
          <div className="w-full p-6 rounded-[24px] bg-[#fcfaf4]/80 backdrop-blur-md border border-[#8c7c6c]/20 shadow-[0_20px_50px_rgba(140,124,108,0.06)] flex flex-col items-center">
            
            <div className="w-full flex justify-between items-center mb-4 border-b border-[#8c7c6c]/10 pb-3">
              <span className="text-[11px] font-black tracking-widest text-[#8c7c6c]/80 uppercase flex items-center gap-1.5">
                <Flame size={13} className="text-[#d8a070]" />
                成像疊合對準檢測 (Alignment Mark Overlay)
              </span>
              <span className="text-[10px] font-mono text-emerald-600 font-extrabold flex items-center gap-1 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                LIVE PREVIEW
              </span>
            </div>

            {/* 🌸 [Card Core Container] 卡片本體與黃光對準光罩疊合處 */}
            <div className="relative rounded-[24px] overflow-hidden p-1 bg-white/20 select-none shadow-sm">
              
              {/* 輔助對準線 (Crosshair / Reticle Overlay) */}
              {showGrid && (
                <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between">
                  {/* 四角曝光標記 (Corner Target Marks) */}
                  <div className="absolute top-6 left-6 w-5 h-5 border-t-2 border-l-2 border-emerald-400/65" />
                  <div className="absolute top-6 right-6 w-5 h-5 border-t-2 border-r-2 border-emerald-400/65" />
                  <div className="absolute bottom-6 left-6 w-5 h-5 border-b-2 border-l-2 border-emerald-400/65" />
                  <div className="absolute bottom-6 right-6 w-5 h-5 border-b-2 border-r-2 border-emerald-400/65" />

                  {/* 常用英雄展示區正上方對準區 - 剛好對應 OWCard 的展示區 (約在 y: 176px 至 356px 之間) */}
                  <div className="absolute top-[176px] left-6 right-6 h-[180px] border border-dashed border-emerald-400/40 bg-emerald-500/[0.015] rounded-2xl flex items-center justify-center">
                    
                    {/* 中心十字線 (Center Crosshair) */}
                    <div className="w-full h-px bg-emerald-400/35 absolute top-1/2 left-0" />
                    <div className="w-px h-full bg-emerald-400/35 absolute left-1/2 top-0" />
                    
                    {/* 分區黃光邊界輔助線 (Die Boundary Markers) */}
                    <div className="absolute left-1/3 top-0 bottom-0 w-px border-l border-dashed border-emerald-400/20" />
                    <div className="absolute left-2/3 top-0 bottom-0 w-px border-l border-dashed border-emerald-400/20" />
                    
                    {/* 輔助同心圓對準標記 (Center Bullseye Mark) */}
                    <div className="w-12 h-12 rounded-full border border-emerald-400/30 flex items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div className="w-6 h-6 rounded-full border border-dashed border-emerald-400/25" />
                    </div>

                    {/* 雷射對準標籤 */}
                    <span className="absolute top-1 left-2 text-[7px] font-mono text-emerald-400/60 uppercase tracking-widest scale-90 origin-top-left">
                      RETICLE MARKER AXIS-Z
                    </span>
                    <span className="absolute bottom-1 right-2 text-[7px] font-mono text-emerald-400/60 uppercase tracking-widest scale-90 origin-bottom-right">
                      OVERLAY WAFER INDEX: [{selectedHeroId}]
                    </span>
                  </div>

                  {/* 整體邊界資訊 */}
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-emerald-950/85 backdrop-blur-sm border border-emerald-500/30 px-3 py-1 rounded-full shadow-[0_4px_12px_rgba(16,185,129,0.15)] flex items-center gap-1.5 z-40">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-[9px] font-mono text-emerald-400 font-extrabold uppercase tracking-widest whitespace-nowrap">
                      {isLocked ? "LOCK COMPENSATED" : "WAFER LEVEL ALIGN"}: {translateX}%, {translateY}%
                    </span>
                  </div>
                </div>
              )}

              {/* 渲染正式 OWCard，將 alignments 參數傳入 */}
              <OWCard
                cardData={mockCardData}
                isLoggedIn={true}
                isEditable={false}
                customAlignments={alignments}
              />
            </div>

            {/* 說明區 */}
            <div className="w-full mt-5 bg-white/50 border border-[#8c7c6c]/12 p-3.5 rounded-2xl text-[11px] leading-relaxed text-[#8c7c6c] font-medium">
              <span className="font-extrabold text-[#5d4037] block mb-1">💡 實時對齊微調工作流 ( APC Workflow )：</span>
              <ul className="list-decimal pl-4 flex flex-col gap-1.5 text-justify">
                <li>
                  在左側搜尋並切換要調整的特工，此時滑桿將載入對該特工的最新對準參數。
                </li>
                <li>
                  若特工右上角顯示 <span className="text-emerald-600 font-extrabold">開放調校中</span>，代表您可自由拖曳滑動條進行微調，右側卡片將即時以 60 FPS 的超高流暢度反應。
                </li>
                <li>
                  微調至完美胸像對齊後，點擊 <span className="text-[#d8a070] font-extrabold">「鎖定確認 [特工名] 🔒」</span>。
                </li>
                <li>
                  此時，對準儀會**自動調用 Next.js Server Action，將最新數據實時寫入 `src/data/heroAlignments.ts` 設定檔！** Next.js 的熱模組重載會立即啟動，讓全站卡片永久同步生效，無須任何手動複製貼上！
                </li>
                <li>
                  若欲再次修正，點擊同一按鈕「解鎖」即可恢復滑桿拖曳功能。
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
