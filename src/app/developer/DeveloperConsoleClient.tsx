/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useTransition, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Users,
  Sliders,
  Trash2,
  Plus,
  ShieldCheck,
  Terminal,
  Cpu,
  AlertCircle,
  ArrowRight,
  LogOut,
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  Lock,
  Unlock,
  RotateCcw,
  AlignLeft,
  AlignCenter,
  AlignRight,
  TrendingUp,
  Search,
  Loader2,
  Eye,
  EyeOff
} from "lucide-react";
import { addWhitelistEmail, removeWhitelistEmail, getAllProfilesForDeveloper } from "@/app/actions/developer";
import { getAnnouncements, saveAnnouncements, uploadAnnouncementIcon, AnnouncementItem, AlignmentConfig } from "@/app/actions/homepage";
import LotusWelcomeWidget from "@/components/morning-sketch/LotusWelcomeWidget";
import { HEROES_CONFIG } from "@/data/mockPlayers";

interface ProfileRow {
  user_id: string;
  battle_tag: string;
  is_tag_visible: boolean;
  selected_heroes: string[];
  updated_at: string;
}

interface DeveloperConsoleClientProps {
  initialWhitelist: Array<{ email: string; created_at: string }>;
  currentUserEmail: string;
  totalProfiles?: number;
  completedProfiles?: number;
  statsError?: string;
  heroStats?: Array<{ heroId: string; count: number }>;
}

// 英雄名稱查找表
const heroNameMap = new Map(HEROES_CONFIG.map(h => [h.id, h.name]));

export default function DeveloperConsoleClient({
  initialWhitelist,
  currentUserEmail,
  totalProfiles = 0,
  completedProfiles = 0,
  statsError,
  heroStats = [],
}: DeveloperConsoleClientProps) {
  const [whitelist, setWhitelist] = useState(initialWhitelist);
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Tab 狀態管理
  const [activeTab, setActiveTab] = useState<"overview" | "whitelist" | "tools" | "users">("overview");

  // Users tab on-demand state
  const [usersData, setUsersData] = useState<ProfileRow[] | null>(null);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [usersSearch, setUsersSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // APC 子工具切換
  const [activeApcTool, setActiveApcTool] = useState<"none" | "homepage">("none");
  // 選擇按鈕當前選取的公告 segment (1-4)
  const [activeSegment, setActiveSegment] = useState<number>(1);

  // 各調校區塊的鎖定狀態 (icon, tag, title, message, buttons)
  const [lockedBlocks, setLockedBlocks] = useState<Record<string, boolean>>({
    icon: false,
    tag: false,
    title: false,
    message: false,
    buttons: false
  });

  // 首頁對準儀狀態
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);

  // 讀取首頁公告
  useEffect(() => {
    getAnnouncements().then(data => {
      if (data && data.length === 4) {
        setAnnouncements(data);
      }
    });
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
      <div className={`space-y-1.5 p-3 rounded-lg bg-white/20 border border-[#8c7c6c]/5 transition-opacity duration-300 ${disabled ? "opacity-40" : ""}`}>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10.5px] font-semibold text-[#8c7c6c]/90">{label}</span>
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

  // 新增白名單處理
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await addWhitelistEmail(newEmail);
      if (res.success) {
        setSuccessMsg(`成功將 ${newEmail.trim().toLowerCase()} 新增至白名單！`);
        setWhitelist(prev => [
          { email: newEmail.trim().toLowerCase(), created_at: new Date().toISOString() },
          ...prev
        ]);
        setNewEmail("");
      } else {
        setErrorMsg(res.error || "新增失敗");
      }
    } catch {
      setErrorMsg("執行 Server Action 發生未知錯誤");
    } finally {
      setLoading(false);
    }
  };

  // 執行 users 資料查詢（含 try/catch，防止 Server Action 拋錯）
  const fetchUsers = async (search?: string) => {
    setUsersLoading(true);
    setUsersError("");
    try {
      const res = await getAllProfilesForDeveloper(search);
      if (res.success && res.data) {
        setUsersData(res.data);
      } else {
        setUsersError(res.error || "載入失敗");
      }
    } catch (err) {
      setUsersError("網路或認證錯誤，請重新整理頁面");
    } finally {
      setUsersLoading(false);
    }
  };

  // Tab 切換（users tab 觸發 on-demand fetch，useTransition 防止 race condition）
  const handleTabChange = (tab: "overview" | "whitelist" | "tools" | "users") => {
    startTransition(() => {
      setActiveTab(tab);
    });
    if (tab === "users" && !usersData && !usersLoading) {
      fetchUsers();
    }
  };

  // 搜尋框 debounce（300ms 後觸發 server-side search）
  const handleUsersSearch = (value: string) => {
    setUsersSearch(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      fetchUsers(value || undefined);
    }, 300);
  };

  // 刪除白名單處理
  const handleDelete = async (emailToDelete: string) => {
    if (!confirm(`確定要將 ${emailToDelete} 從開發者白名單中移除嗎？\n移除後該帳戶將失去開發者後台存取權限。`)) {
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await removeWhitelistEmail(emailToDelete);
      if (res.success) {
        setSuccessMsg(`已將 ${emailToDelete} 從白名單中移除。`);
        setWhitelist(prev => prev.filter(item => item.email !== emailToDelete));
      } else {
        setErrorMsg(res.error || "刪除失敗");
      }
    } catch {
      setErrorMsg("執行 Server Action 發生未知錯誤");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-[#82b7cc] selection:text-slate-900 transition-colors duration-500 ${
      activeApcTool === "homepage" 
        ? "bg-gradient-to-b from-[#fcf9f2] to-[#f3ecd8] text-[#5d4037]" 
        : "bg-[#0b0f17] text-slate-100"
    }`}>
      {/* 霓虹發光背景裝飾球 */}
      {activeApcTool !== "homepage" ? (
        <>
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#82b7cc]/10 blur-[150px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#f5d46b]/5 blur-[150px] pointer-events-none" />
        </>
      ) : (
        <>
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#82b7cc]/5 blur-[150px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#f5d46b]/8 blur-[150px] pointer-events-none" />
        </>
      )}

      {/* 頂部導覽 */}
      <header className={`sticky top-0 z-40 px-6 py-4 flex justify-between items-center transition-all ${
        activeApcTool === "homepage"
          ? "border-b border-[#8c7c6c]/15 bg-white/70 backdrop-blur-xl text-[#3e2723] shadow-[0_1px_10px_rgba(140,124,108,0.05)]"
          : "border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl text-slate-100 shadow-[0_1px_10px_rgba(0,0,0,0.4)]"
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#82b7cc] to-[#3b82f6] flex items-center justify-center shadow-[0_0_15px_rgba(130,183,204,0.4)]">
            <Cpu size={20} className="text-white" />
          </div>
          <div>
            <h1 className={`text-lg font-black tracking-widest uppercase transition-colors ${
              activeApcTool === "homepage"
                ? "text-[#3e2723]"
                : "bg-gradient-to-r from-white via-slate-200 to-[#82b7cc] bg-clip-text text-transparent"
            }`}>OVERWATCH social</h1>
            <p className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${
              activeApcTool === "homepage" ? "text-[#8c7c6c]" : "text-slate-400"
            }`}>Developer Console | 開發者控制台</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className={`text-xs font-bold transition-colors ${
              activeApcTool === "homepage" ? "text-[#5d4037]" : "text-slate-300"
            }`}>{currentUserEmail}</span>
            <span className="text-[9px] font-black tracking-wider text-emerald-400 uppercase flex items-center gap-1 justify-end">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active Developer
            </span>
          </div>
          <Link 
            href="/" 
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              activeApcTool === "homepage"
                ? "bg-white/80 hover:bg-[#8c7c6c]/10 text-[#8c7c6c] hover:text-[#3e2723] border-[#8c7c6c]/20 shadow-sm"
                : "bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700/50"
            }`}
          >
            <LogOut size={13} />
            <span>回到網站</span>
          </Link>
        </div>
      </header>

      {/* 主體區域 */}
      <main className={`flex-grow w-full mx-auto p-6 md:p-8 flex flex-col relative z-10 ${
        activeApcTool === "homepage" ? "max-w-7xl" : "max-w-6xl md:flex-row gap-6"
      }`}>
        
        {/* 左側 Sidebar 選單 */}
        {activeApcTool !== "homepage" && (
          <aside className="w-full md:w-64 shrink-0 flex flex-col gap-2">
          <button
            onClick={() => handleTabChange("overview")}
            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all font-black text-sm border ${
              activeTab === "overview"
                ? "bg-gradient-to-r from-slate-900 to-slate-800/80 text-white border-slate-700 shadow-md shadow-black/20"
                : "bg-transparent text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/40"
            }`}
          >
            <Terminal size={16} className={activeTab === "overview" ? "text-[#82b7cc]" : ""} />
            <span>系統概覽 (Overview)</span>
          </button>
          
          <button
            onClick={() => handleTabChange("whitelist")}
            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all font-black text-sm border ${
              activeTab === "whitelist"
                ? "bg-gradient-to-r from-slate-900 to-slate-800/80 text-white border-slate-700 shadow-md shadow-black/20"
                : "bg-transparent text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/40"
            }`}
          >
            <Users size={16} className={activeTab === "whitelist" ? "text-[#82b7cc]" : ""} />
            <span>白名單維護 (Whitelist)</span>
          </button>
          
          <button
            onClick={() => handleTabChange("tools")}
            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all font-black text-sm border ${
              activeTab === "tools"
                ? "bg-gradient-to-r from-slate-900 to-slate-800/80 text-white border-slate-700 shadow-md shadow-black/20"
                : "bg-transparent text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/40"
            }`}
          >
            <Sliders size={16} className={activeTab === "tools" ? "text-[#82b7cc]" : ""} />
            <span>高階製程工具 (APC Tools)</span>
          </button>

          <button
            onClick={() => handleTabChange("users")}
            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all font-black text-sm border ${
              activeTab === "users"
                ? "bg-gradient-to-r from-slate-900 to-slate-800/80 text-white border-slate-700 shadow-md shadow-black/20"
                : "bg-transparent text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/40"
            }`}
          >
            <Users size={16} className={activeTab === "users" ? "text-[#82b7cc]" : ""} />
            <span>用戶管理 (Users)</span>
          </button>

          <div className="mt-8 p-4 rounded-xl border border-slate-800 bg-slate-950/40 text-center">
            <ShieldCheck size={28} className="mx-auto text-emerald-400 mb-2 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]" />
            <h4 className="text-xs font-black text-slate-300 uppercase tracking-widest mb-1">RLS Protected</h4>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              此控制台所有資料交互皆受 Supabase 行級安全性 (Row Level Security) 政策保護，防範越權行為。
            </p>
          </div>
        </aside>
        )}

        {/* 右側內容卡片 */}
        <section className={`flex-grow min-h-[500px] flex flex-col justify-between transition-all duration-500 ${
          activeApcTool === "homepage"
            ? "glass-panel p-6 shadow-[0_15px_45px_-10px_rgba(140,124,108,0.08)]"
            : "bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
        }`}>
          
          <div>
            {/* 提示訊息 */}
            {successMsg && (
              <div className="mb-6 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/8 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                <ShieldCheck size={16} className="shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/8 text-red-400 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* TAB 1: 系統概覽 */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-wider mb-1">系統概覽 (Overview)</h2>
                  <p className="text-xs text-slate-400">目前開發環境的連線指標與核心設定狀態</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 flex flex-col justify-between">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">已建立名片的特工</span>
                    <div className="flex items-end justify-between mt-3">
                      {statsError ? (
                        <span className="text-sm font-black text-red-400 flex items-center gap-1">
                          <AlertCircle size={14} /> 查詢失敗
                        </span>
                      ) : (
                        <span className="text-lg font-black text-slate-200">{totalProfiles} 位特工</span>
                      )}
                      <span className="bg-[#82b7cc]/10 border border-[#82b7cc]/20 text-[#82b7cc] text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                        {statsError ? "—" : `${completedProfiles} 完整名片`}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 flex flex-col justify-between">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Whitelist Counts</span>
                    <div className="flex items-end justify-between mt-3">
                      <span className="text-lg font-black text-slate-200">{whitelist.length} 個白名單信箱</span>
                      <span className="bg-[#82b7cc]/10 border border-[#82b7cc]/20 text-[#82b7cc] text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                        Configured
                      </span>
                    </div>
                  </div>
                </div>

                {/* 英雄流行度 Top 5 */}
                {heroStats.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={14} className="text-[#82b7cc]" />
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">英雄流行度 Top 5</h3>
                    </div>
                    <div className="space-y-2">
                      {heroStats.map((stat, idx) => {
                        const heroName = heroNameMap.get(stat.heroId) || stat.heroId;
                        const maxCount = heroStats[0]?.count || 1;
                        const barWidth = Math.round((stat.count / maxCount) * 100);
                        return (
                          <div key={stat.heroId} className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-slate-500 w-4 text-right">{idx + 1}</span>
                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-bold text-slate-300">{heroName}</span>
                                <span className="text-[10px] font-black text-slate-500">{stat.count} 人</span>
                              </div>
                              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-[#82b7cc] to-[#3b82f6] rounded-full transition-all"
                                  style={{ width: `${barWidth}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {heroStats.length === 0 && (
                  <div className="text-xs text-slate-500 italic text-center py-2">尚無英雄選用數據</div>
                )}

                {/* 開發者安全宣言卡 */}
                <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/30 flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-200 mb-1">先進製程控制 (APC) 安全提示</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      白名單中的所有帳戶在登入系統時，會被資料庫 Trigger 自動更新為 `{"role = 'developer'"}`。
                      請注意！非開發團隊成員切勿任意加入白名單，以免造成敏感測試工具（如對準儀）被非白名單使用者利用。
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: 白名單管理 */}
            {activeTab === "whitelist" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-wider mb-1">白名單維護 (Whitelist Management)</h2>
                  <p className="text-xs text-slate-400">在此新增或移除有權限進入開發者後台的 Google 帳號 Email</p>
                </div>

                {/* 新增 Email 表單 */}
                <form onSubmit={handleAdd} className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    disabled={loading}
                    placeholder="輸入授權的 Google Login Email (例如: user@gmail.com)"
                    className="flex-grow bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-[#82b7cc] focus:ring-1 focus:ring-[#82b7cc] transition-all disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={loading || !newEmail}
                    className="bg-[#82b7cc] hover:bg-[#6fa4b8] text-slate-950 px-5 rounded-xl text-xs font-black tracking-widest uppercase flex items-center gap-1.5 transition-all shadow-[0_4px_12px_rgba(130,183,204,0.3)] disabled:opacity-50 disabled:pointer-events-none hover:scale-[1.02]"
                  >
                    <Plus size={16} />
                    <span>新增授權</span>
                  </button>
                </form>

                {/* 白名單表格展示 */}
                <div className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-950/20">
                  <div className="max-h-[300px] overflow-y-auto">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="bg-slate-950/80 border-b border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <th className="px-4 py-3">白名單授權 Email</th>
                          <th className="px-4 py-3">授權時間</th>
                          <th className="px-4 py-3 text-right">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {whitelist.length > 0 ? (
                          whitelist.map((item) => (
                            <tr key={item.email} className="border-b border-slate-900 hover:bg-slate-900/30 transition-all text-xs font-medium">
                              <td className="px-4 py-3.5 text-slate-200">
                                <div className="flex items-center gap-2">
                                  <span>{item.email}</span>
                                  {item.email.toLowerCase() === currentUserEmail.toLowerCase() && (
                                    <span className="bg-[#82b7cc]/12 text-[#82b7cc] border border-[#82b7cc]/25 text-[9px] font-black px-1.5 py-0.5 rounded-md scale-90">
                                      您自己
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3.5 text-slate-500">
                                {new Date(item.created_at).toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })}
                              </td>
                              <td className="px-4 py-3.5 text-right">
                                <button
                                  onClick={() => handleDelete(item.email)}
                                  disabled={loading || item.email.toLowerCase() === currentUserEmail.toLowerCase()}
                                  title={item.email.toLowerCase() === currentUserEmail.toLowerCase() ? "您無法刪除自己" : "刪除授權"}
                                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={3} className="px-4 py-8 text-center text-slate-500 italic">
                              白名單中目前沒有任何資料，請在上方欄位新增！
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

                        {/* TAB 3: 高階製程工具 */}
            {activeTab === "tools" && activeApcTool === "none" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-wider mb-1">高階製程工具 (Advanced APC Tools)</h2>
                  <p className="text-xs text-slate-400">系統研發與版面位置對準調校專用的進階控制儀</p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {/* 精密對準儀入口卡片 */}
                  <div className="p-6 rounded-xl border border-slate-800 bg-slate-950/40 hover:border-[#82b7cc]/40 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 group">
                    <div className="space-y-2 max-w-xl">
                      <div className="flex items-center gap-2">
                        <Sliders className="text-[#82b7cc]" size={20} />
                        <h3 className="text-base font-black text-slate-200">精密立繪對準補償儀 (APC Aligner)</h3>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        對準儀是用於精密調整《鬥陣特攻 2》英雄半身胸像立繪在卡槽中的 **縮放比 (Scale)** 與 **X/Y 軸位移補償參數** 的開發者專屬工具。
                        保存後會即時寫入系統設定，全站無縫同步。
                      </p>
                    </div>

                    <Link 
                      href="/developer/adjuster"
                      className="bg-gradient-to-r from-[#82b7cc] to-[#3b82f6] text-white px-5 py-3 rounded-xl text-xs font-black tracking-widest uppercase flex items-center gap-2 transition-all hover:scale-[1.03] shadow-[0_5px_15px_rgba(130,183,204,0.3)] whitespace-nowrap"
                    >
                      <span>啟動對準儀</span>
                      <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>

                  {/* 首頁公告精密調校儀入口卡片 */}
                  <div className="p-6 rounded-xl border border-slate-800 bg-slate-950/40 hover:border-[#82b7cc]/40 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 group">
                    <div className="space-y-2 max-w-xl">
                      <div className="flex items-center gap-2">
                        <Cpu className="text-[#82b7cc]" size={20} />
                        <h3 className="text-base font-black text-slate-200">首頁內容精密調校儀 (Homepage APC Aligner)</h3>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        調校儀用於精密調整首頁「站長隨筆手札」各區塊元件的 **X/Y 軸平移像素**、**縮放比例**、與**字級大小**，並支援上傳自訂圖片圖標。
                      </p>
                    </div>

                    <button 
                      onClick={() => setActiveApcTool("homepage")}
                      type="button"
                      className="bg-gradient-to-r from-[#82b7cc] to-[#3b82f6] text-white px-5 py-3 rounded-xl text-xs font-black tracking-widest uppercase flex items-center gap-2 transition-all hover:scale-[1.03] shadow-[0_5px_15px_rgba(130,183,204,0.3)] hover:shadow-[0_8px_20px_rgba(130,183,204,0.5)] whitespace-nowrap cursor-pointer"
                    >
                      <span>啟動首頁調校儀</span>
                      <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            )}


            {/* TAB 3 (子頁面): 首頁公告精密對準面板 */}
            {activeTab === "tools" && activeApcTool === "homepage" && announcements.length === 4 && (
              <form onSubmit={handleSaveAnnouncements} className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#8c7c6c]/15 pb-4">
                  <div>
                    <div className="flex items-center gap-2 text-[#8c7c6c]/80 text-xs mb-1">
                      <span>高階製程工具 (APC Tools)</span>
                      <span>/</span>
                      <span className="text-[#82b7cc]">首頁精密調校</span>
                    </div>
                    <h2 className="text-xl font-black text-[#3e2723] uppercase tracking-wider">首頁內容精密調校儀</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveApcTool("none");
                      setErrorMsg("");
                      setSuccessMsg("");
                    }}
                    className="flex items-center gap-1.5 bg-white/85 hover:bg-[#8c7c6c]/10 text-[#8c7c6c] hover:text-[#3e2723] px-3 py-2 rounded-lg text-xs font-bold transition-all border border-[#8c7c6c]/20 cursor-pointer shadow-sm"
                  >
                    <ArrowLeft size={13} />
                    <span>返回工具列表</span>
                  </button>
                </div>

                {/* 左右雙欄配置：左邊 Sticky 預覽，右邊調校 Form */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* 左欄：Sticky 即時預覽監視器 */}
                  <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
                    <div className="p-5 rounded-xl border border-[#8c7c6c]/15 bg-white/40 backdrop-blur-md space-y-3">
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
                            {num}
                          </button>
                        );
                      })}
                    </div>

                    {/* 調校主區域 */}
                    <div className="space-y-6">
                      {/* 當前選擇公告的內容編輯 */}
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
                            <div className="p-5 rounded-xl border border-[#8c7c6c]/15 bg-white/50 space-y-4">
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
                                  rows={2}
                                  value={item.message}
                                  onChange={(e) => handleAnnouncementChange(idx, "message", e.target.value)}
                                  className="w-full bg-white/80 border border-[#8c7c6c]/20 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#82b7cc] text-[#3e2723] placeholder-[#8c7c6c]/40 leading-relaxed"
                                  required
                                />
                              </div>
                            </div>

                            {/* 2. 圖標更換 (上傳與還原) */}
                            <div className="p-5 rounded-xl border border-[#8c7c6c]/15 bg-white/50 space-y-4">
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
                                    上傳自定義的圖標圖片以更換該公告的頂部圖標。上傳成功後，首頁小卡片將渲染此圖片。
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

                            {/* 3. 精密位置補償調校 (分區卡片顯示) */}
                            <div className="space-y-6">
                              {/* 標頭提示 */}
                              <div className="flex items-center gap-2 border-b border-[#8c7c6c]/15 pb-2">
                                <Sliders size={16} className="text-[#8c7c6c]" />
                                <h3 className="text-xs font-black text-[#8c7c6c] uppercase tracking-widest">
                                  ⚙️ 精密位置與字型大小對準 (Closed Loop Calibration)
                                </h3>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* A. 圖標設定區塊 */}
                                <div className="p-5 rounded-xl border border-[#8c7c6c]/15 bg-white/50 space-y-4 transition-all">
                                  <div className="flex justify-between items-center border-b border-[#8c7c6c]/15 pb-2">
                                    <span className="text-[11px] font-black text-[#3e2723] flex items-center gap-1.5">
                                      {lockedBlocks.icon ? "🔒" : "💮"} 圖標設定 (Icon Configs)
                                    </span>
                                    <div className="flex items-center gap-2">
                                      {/* 左中右 */}
                                      <div className="flex items-center bg-[#8c7c6c]/5 border border-[#8c7c6c]/10 rounded-lg p-0.5">
                                        <button type="button" title="偏左對齊" disabled={lockedBlocks.icon} onClick={() => alignBlockX("icon_x", "left")} className="p-1 rounded text-[#8c7c6c] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"><AlignLeft size={12} /></button>
                                        <button type="button" title="置中對齊" disabled={lockedBlocks.icon} onClick={() => alignBlockX("icon_x", "center")} className="p-1 rounded text-[#8c7c6c] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"><AlignCenter size={12} /></button>
                                        <button type="button" title="偏右對齊" disabled={lockedBlocks.icon} onClick={() => alignBlockX("icon_x", "right")} className="p-1 rounded text-[#8c7c6c] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"><AlignRight size={12} /></button>
                                      </div>
                                      {/* 重置 */}
                                      <button type="button" title="返回預設值" disabled={lockedBlocks.icon} onClick={() => resetBlockAlignments("icon")} className="p-1 rounded bg-[#8c7c6c]/5 hover:bg-white border border-[#8c7c6c]/10 text-[#8c7c6c] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"><RotateCcw size={12} /></button>
                                      {/* 鎖定 */}
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
                                <div className="p-5 rounded-xl border border-[#8c7c6c]/15 bg-white/50 space-y-4 transition-all">
                                  <div className="flex justify-between items-center border-b border-[#8c7c6c]/15 pb-2">
                                    <span className="text-[11px] font-black text-[#3e2723] flex items-center gap-1.5">
                                      {lockedBlocks.tag ? "🔒" : "🏷️"} 標籤設定 (Tag Configs)
                                    </span>
                                    <div className="flex items-center gap-2">
                                      {/* 左中右 */}
                                      <div className="flex items-center bg-[#8c7c6c]/5 border border-[#8c7c6c]/10 rounded-lg p-0.5">
                                        <button type="button" title="偏左對齊" disabled={lockedBlocks.tag} onClick={() => alignBlockX("tag_x", "left")} className="p-1 rounded text-[#8c7c6c] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"><AlignLeft size={12} /></button>
                                        <button type="button" title="置中對齊" disabled={lockedBlocks.tag} onClick={() => alignBlockX("tag_x", "center")} className="p-1 rounded text-[#8c7c6c] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"><AlignCenter size={12} /></button>
                                        <button type="button" title="偏右對齊" disabled={lockedBlocks.tag} onClick={() => alignBlockX("tag_x", "right")} className="p-1 rounded text-[#8c7c6c] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"><AlignRight size={12} /></button>
                                      </div>
                                      {/* 重置 */}
                                      <button type="button" title="返回預設值" disabled={lockedBlocks.tag} onClick={() => resetBlockAlignments("tag")} className="p-1 rounded bg-[#8c7c6c]/5 hover:bg-white border border-[#8c7c6c]/10 text-[#8c7c6c] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"><RotateCcw size={12} /></button>
                                      {/* 鎖定 */}
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
                                <div className="p-5 rounded-xl border border-[#8c7c6c]/15 bg-white/50 space-y-4 transition-all">
                                  <div className="flex justify-between items-center border-b border-[#8c7c6c]/15 pb-2">
                                    <span className="text-[11px] font-black text-[#3e2723] flex items-center gap-1.5">
                                      {lockedBlocks.title ? "🔒" : "📝"} 標題設定 (Title Configs)
                                    </span>
                                    <div className="flex items-center gap-2">
                                      {/* 左中右 */}
                                      <div className="flex items-center bg-[#8c7c6c]/5 border border-[#8c7c6c]/10 rounded-lg p-0.5">
                                        <button type="button" title="偏左對齊" disabled={lockedBlocks.title} onClick={() => alignBlockX("title_x", "left")} className="p-1 rounded text-[#8c7c6c] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"><AlignLeft size={12} /></button>
                                        <button type="button" title="置中對齊" disabled={lockedBlocks.title} onClick={() => alignBlockX("title_x", "center")} className="p-1 rounded text-[#8c7c6c] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"><AlignCenter size={12} /></button>
                                        <button type="button" title="偏右對齊" disabled={lockedBlocks.title} onClick={() => alignBlockX("title_x", "right")} className="p-1 rounded text-[#8c7c6c] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"><AlignRight size={12} /></button>
                                      </div>
                                      {/* 重置 */}
                                      <button type="button" title="返回預設值" disabled={lockedBlocks.title} onClick={() => resetBlockAlignments("title")} className="p-1 rounded bg-[#8c7c6c]/5 hover:bg-white border border-[#8c7c6c]/10 text-[#8c7c6c] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"><RotateCcw size={12} /></button>
                                      {/* 鎖定 */}
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
                                <div className="p-5 rounded-xl border border-[#8c7c6c]/15 bg-white/50 space-y-4 transition-all">
                                  <div className="flex justify-between items-center border-b border-[#8c7c6c]/15 pb-2">
                                    <span className="text-[11px] font-black text-[#3e2723] flex items-center gap-1.5">
                                      {lockedBlocks.message ? "🔒" : "💬"} 內文設定 (Message Configs)
                                    </span>
                                    <div className="flex items-center gap-2">
                                      {/* 左中右 */}
                                      <div className="flex items-center bg-[#8c7c6c]/5 border border-[#8c7c6c]/10 rounded-lg p-0.5">
                                        <button type="button" title="偏左對齊" disabled={lockedBlocks.message} onClick={() => alignBlockX("message_x", "left")} className="p-1 rounded text-[#8c7c6c] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"><AlignLeft size={12} /></button>
                                        <button type="button" title="置中對齊" disabled={lockedBlocks.message} onClick={() => alignBlockX("message_x", "center")} className="p-1 rounded text-[#8c7c6c] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"><AlignCenter size={12} /></button>
                                        <button type="button" title="偏右對齊" disabled={lockedBlocks.message} onClick={() => alignBlockX("message_x", "right")} className="p-1 rounded text-[#8c7c6c] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"><AlignRight size={12} /></button>
                                      </div>
                                      {/* 重置 */}
                                      <button type="button" title="返回預設值" disabled={lockedBlocks.message} onClick={() => resetBlockAlignments("message")} className="p-1 rounded bg-[#8c7c6c]/5 hover:bg-white border border-[#8c7c6c]/10 text-[#8c7c6c] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"><RotateCcw size={12} /></button>
                                      {/* 鎖定 */}
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
                                <div className="p-5 rounded-xl border border-[#8c7c6c]/15 bg-white/50 space-y-4 transition-all md:col-span-2">
                                  <div className="flex justify-between items-center border-b border-[#8c7c6c]/15 pb-2">
                                    <span className="text-[11px] font-black text-[#3e2723] flex items-center gap-1.5">
                                      {lockedBlocks.buttons ? "🔒" : "🔘"} 按鈕組設定 (Buttons Configs)
                                    </span>
                                    <div className="flex items-center gap-2">
                                      {/* 左中右 */}
                                      <div className="flex items-center bg-[#8c7c6c]/5 border border-[#8c7c6c]/10 rounded-lg p-0.5">
                                        <button type="button" title="偏左對齊" disabled={lockedBlocks.buttons} onClick={() => alignBlockX("buttons_x", "left")} className="p-1 rounded text-[#8c7c6c] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"><AlignLeft size={12} /></button>
                                        <button type="button" title="置中對齊" disabled={lockedBlocks.buttons} onClick={() => alignBlockX("buttons_x", "center")} className="p-1 rounded text-[#8c7c6c] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"><AlignCenter size={12} /></button>
                                        <button type="button" title="偏右對齊" disabled={lockedBlocks.buttons} onClick={() => alignBlockX("buttons_x", "right")} className="p-1 rounded text-[#8c7c6c] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"><AlignRight size={12} /></button>
                                      </div>
                                      {/* 重置 */}
                                      <button type="button" title="返回預設值" disabled={lockedBlocks.buttons} onClick={() => resetBlockAlignments("buttons")} className="p-1 rounded bg-[#8c7c6c]/5 hover:bg-white border border-[#8c7c6c]/10 text-[#8c7c6c] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"><RotateCcw size={12} /></button>
                                      {/* 鎖定 */}
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
                  </div>

                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={loading || announcements.length !== 4}
                    className="bg-gradient-to-r from-[#82b7cc] to-[#3b82f6] text-white px-6 py-3 rounded-xl text-xs font-black tracking-widest uppercase transition-all hover:scale-[1.02] shadow-[0_5px_15px_rgba(130,183,204,0.3)] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                  >
                    {loading ? "正在發布精密參數..." : "💾 儲存精密參數"}
                  </button>
                </div>
              </form>
            )}


            {/* TAB 4: 用戶管理 */}
            {activeTab === "users" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-wider mb-1">用戶管理 (User Management)</h2>
                  <p className="text-xs text-slate-400">查看所有已建立名片的玩家（最多 100 筆，不含聯絡方式）</p>
                </div>

                {/* 載入中 */}
                {usersLoading && (
                  <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
                    <Loader2 size={20} className="animate-spin" />
                    <span className="text-sm font-bold">載入用戶資料中...</span>
                  </div>
                )}

                {/* 錯誤 */}
                {usersError && !usersLoading && (
                  <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/8 text-red-400 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle size={16} />
                    <span>{usersError}</span>
                  </div>
                )}

                {/* 資料載入完成 */}
                {usersData && !usersLoading && (
                  <>
                    {/* 搜尋（server-side ilike，300ms debounce）*/}
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        placeholder="搜尋 BattleTag（server-side 過濾）..."
                        value={usersSearch}
                        onChange={e => handleUsersSearch(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-[#82b7cc] focus:ring-1 focus:ring-[#82b7cc] transition-all"
                      />
                    </div>

                    {/* 表格 */}
                    <div className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-950/20">
                      <div className="max-h-[400px] overflow-y-auto">
                        <table className="w-full border-collapse text-left">
                          <thead>
                            <tr className="bg-slate-950/80 border-b border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              <th className="px-4 py-3">BattleTag</th>
                              <th className="px-4 py-3">英雄數</th>
                              <th className="px-4 py-3">公開</th>
                              <th className="px-4 py-3">更新時間</th>
                            </tr>
                          </thead>
                          <tbody>
                            {usersData
                              .map(profile => (
                                <tr key={profile.user_id} className="border-b border-slate-900 hover:bg-slate-900/30 transition-all text-xs">
                                  <td className="px-4 py-3 text-slate-200 font-mono">
                                    {profile.battle_tag || <span className="text-slate-600 italic">未設定</span>}
                                  </td>
                                  <td className="px-4 py-3 text-slate-400">
                                    {(profile.selected_heroes ?? []).length} 個
                                  </td>
                                  <td className="px-4 py-3">
                                    {profile.is_tag_visible
                                      ? <Eye size={13} className="text-emerald-400" />
                                      : <EyeOff size={13} className="text-slate-600" />
                                    }
                                  </td>
                                  <td className="px-4 py-3 text-slate-500">
                                    {new Date(profile.updated_at).toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })}
                                  </td>
                                </tr>
                              ))
                            }
                            {usersData.length === 0 && (
                              <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-slate-500 italic">
                                  {usersSearch ? `找不到符合「${usersSearch}」的玩家` : "目前沒有任何玩家資料"}
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                      <div className="px-4 py-2 border-t border-slate-800 text-[10px] text-slate-600 font-bold">
                        {usersSearch ? `搜尋「${usersSearch}」：${usersData.length} 筆` : `共 ${usersData.length} 筆（最新 100 筆，Server-side 過濾）`}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

          </div>

          {/* 頁尾版權 */}
          <footer className={`mt-8 pt-4 border-t text-center text-[10px] font-bold uppercase tracking-widest transition-colors ${
            activeApcTool === "homepage"
              ? "border-[#8c7c6c]/10 text-[#8c7c6c]/60"
              : "border-slate-900/60 text-slate-600"
          }`}>
            Overwatch Social © 2026 Admin Panel • Closed Loop Process Control
          </footer>

        </section>

      </main>
    </div>
  );
}
