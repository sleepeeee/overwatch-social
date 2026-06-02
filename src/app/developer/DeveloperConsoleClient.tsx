"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
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
  Lock,
  Unlock,
  TrendingUp,
  Search,
  Loader2,
  Eye,
  EyeOff,
  Tags,
  Moon,
  Sun
} from "lucide-react";
import { addWhitelistEmail, removeWhitelistEmail, getAllProfilesForDeveloper } from "@/app/actions/developer";
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

const heroNameMap = new Map(HEROES_CONFIG.map(h => [h.id, h.name]));

const themeSchemes = {
  sage: {
    primary: "#8fa8a2",
    hover: "#7d9791",
    dark: "#69857f",
    light: "rgba(143, 168, 162, 0.15)",
    text: "#69857f",
    darkText: "#a7b8b4"
  },
  rose: {
    primary: "#bfa1a1",
    hover: "#ad8e8e",
    dark: "#947878",
    light: "rgba(191, 161, 161, 0.15)",
    text: "#947878",
    darkText: "#ccb0b0"
  },
  blue: {
    primary: "#8ca9b3",
    hover: "#7897a2",
    dark: "#5c7c88",
    light: "rgba(140, 169, 179, 0.15)",
    text: "#5c7c88",
    darkText: "#a8c0c9"
  },
  clay: {
    primary: "#b4a091",
    hover: "#a28c7c",
    dark: "#8c7c6c",
    light: "rgba(180, 160, 145, 0.15)",
    text: "#8c7c6c",
    darkText: "#c8b8ac"
  }
};

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

  // 主題與深淺色模式
  const [activeThemeColor, setActiveThemeColor] = useState<"sage" | "rose" | "blue" | "clay">("sage");
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Tab 狀態管理
  const [activeTab, setActiveTab] = useState<"overview" | "whitelist" | "tools" | "users">("overview");

  // RLS 狀態與提升權限模擬
  const [rlsEnabled, setRlsEnabled] = useState(true);
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayText, setOverlayText] = useState("");

  // Users tab
  const [usersData, setUsersData] = useState<ProfileRow[] | null>(null);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [usersSearch, setUsersSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // 🔓 豁免全站防選取限制，允許開發者在後台點選與複製文字
    document.body.style.userSelect = "text";
    document.body.style.webkitUserSelect = "text";
    
    return () => {
      // 還原全站防選取防護
      document.body.style.userSelect = "";
      document.body.style.webkitUserSelect = "";
    };
  }, []);

  // 監聽並套用 html body 樣式，避免前台污染
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDarkMode]);

  const scheme = themeSchemes[activeThemeColor];

  // 模擬 Toast 提示
  const triggerToast = (msg: string, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setSuccessMsg("");
      setTimeout(() => setErrorMsg(""), 3000);
    } else {
      setSuccessMsg(msg);
      setErrorMsg("");
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  // 切換 RLS
  const handleToggleRLS = () => {
    setRlsEnabled(prev => {
      const nextVal = !prev;
      triggerToast(nextVal ? "已重新建立全域行級保護 (RLS)" : "全域 RLS 已關閉，注意防範越權存取！");
      return nextVal;
    });
  };

  // 模擬提權
  const handlePrivilegeElevation = () => {
    setShowOverlay(true);
    setOverlayText("Generating temporary HMAC keypair for service account...");
    
    setTimeout(() => {
      setOverlayText("Injecting 'SET LOCAL rls.bypass = true' parameter...");
    }, 700);

    setTimeout(() => {
      setOverlayText("Querying table 'profiles' with bypass authority...");
    }, 1400);

    setTimeout(() => {
      setShowOverlay(false);
      setRlsEnabled(false);
      triggerToast("連線驗證已通過，已成功加載玩家數據表");
      fetchUsers();
    }, 2100);
  };

  // 新增白名單
  const handleAddWhitelist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await addWhitelistEmail(newEmail);
      if (res.success) {
        triggerToast(`成功將 ${newEmail.trim().toLowerCase()} 新增至白名單！`);
        setWhitelist(prev => [
          { email: newEmail.trim().toLowerCase(), created_at: new Date().toISOString() },
          ...prev
        ]);
        setNewEmail("");
      } else {
        triggerToast(res.error || "新增失敗", true);
      }
    } catch {
      triggerToast("執行 Server Action 發生未知錯誤", true);
    } finally {
      setLoading(false);
    }
  };

  // 刪除白名單
  const handleDeleteWhitelist = async (emailToDelete: string) => {
    if (!confirm(`確定要將 ${emailToDelete} 從開發者白名單中移除嗎？\n移除後該帳戶將失去開發者後台存取權限。`)) {
      return;
    }

    setLoading(true);

    try {
      const res = await removeWhitelistEmail(emailToDelete);
      if (res.success) {
        triggerToast(`已將 ${emailToDelete} 從白名單中移除。`);
        setWhitelist(prev => prev.filter(item => item.email !== emailToDelete));
      } else {
        triggerToast(res.error || "刪除失敗", true);
      }
    } catch {
      triggerToast("執行 Server Action 發生未知錯誤", true);
    } finally {
      setLoading(false);
    }
  };

  // 用戶查詢
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
    } catch {
      setUsersError("網路或認證錯誤，請重新整理頁面");
    } finally {
      setUsersLoading(false);
    }
  };

  const handleTabChange = (tab: "overview" | "whitelist" | "tools" | "users") => {
    startTransition(() => {
      setActiveTab(tab);
    });
    if (tab === "users" && !usersData && !usersLoading) {
      fetchUsers();
    }
  };

  const handleUsersSearch = (value: string) => {
    setUsersSearch(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      fetchUsers(value || undefined);
    }, 300);
  };

  return (
    <div 
      className="min-h-screen flex flex-col font-sans transition-colors duration-300 bg-[#f4f3f0] dark:bg-[#1a1d20] text-slate-800 dark:text-slate-100"
      style={{
        "--theme-primary": scheme.primary,
        "--theme-primary-hover": scheme.hover,
        "--theme-primary-dark": scheme.dark,
        "--theme-primary-light": scheme.light,
        "--theme-primary-text": scheme.text,
        "--theme-primary-dark-text": scheme.darkText,
      } as React.CSSProperties}
    >
      
      {/* 提權加載動畫 */}
      {showOverlay && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center flex-col gap-4 text-white">
          <Loader2 size={36} className="animate-spin text-[var(--theme-primary)]" />
          <p className="font-mono text-sm font-semibold tracking-wider animate-pulse max-w-lg text-center px-4">
            {overlayText}
          </p>
        </div>
      )}

      {/* Main Header */}
      <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-[#202428]/70 backdrop-blur-md flex items-center justify-between px-6 shrink-0 transition-colors duration-300 sticky top-[var(--dev-banner-height,0px)] z-30">
        
        {/* Left Side Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center transition-all hover:scale-105 duration-300 text-[var(--theme-primary-text)]">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 1.8c2.02 0 3.86.76 5.27 2.01L14.7 9.3c-.63-.48-1.52-.75-2.7-.75-1.18 0-2.07.27-2.7.75L6.73 5.81C8.14 4.56 9.98 3.8 12 3.8zm-6.23 4L8.3 11.23C8.1 11.83 8 12.52 8 13.3c0 2.37 1.48 3.9 4 3.9s4-1.53 4-3.9c0-.78-.1-1.47-.3-2.07l2.53-3.43c.96 1.47 1.57 3.22 1.57 5.11 0 5.07-4.13 9.2-9.2 9.2-5.07 0-9.2-4.13-9.2-9.2 0-1.89.61-3.64 1.57-5.11z"/>
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-wider text-sm text-slate-800 dark:text-slate-100">OVERWATCH SOCIAL</span>
              <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded font-mono">V2.4</span>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 block -mt-0.5 tracking-wider font-semibold">DEVELOPER CONSOLE | 開發者控制台</span>
          </div>
        </div>

        {/* Middle: Quick Morandi Customizer Tool */}
        <div className="hidden md:flex items-center gap-4 bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-full border border-slate-200/50 dark:border-slate-800/50">
          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase px-2 tracking-wider">莫蘭迪色系</div>
          <div className="flex items-center gap-1.5">
            {Object.keys(themeSchemes).map((colorKey) => {
              const isActive = activeThemeColor === colorKey;
              const col = themeSchemes[colorKey as keyof typeof themeSchemes];
              return (
                <button
                  key={colorKey}
                  onClick={() => setActiveThemeColor(colorKey as "sage" | "rose" | "blue" | "clay")}
                  className="w-5 h-5 rounded-full relative group border-2 transition-all duration-300"
                  style={{
                    backgroundColor: col.primary,
                    borderColor: isActive ? (isDarkMode ? "#ffffff" : "#1e293b") : "transparent",
                    transform: isActive ? "scale(1.15)" : "none"
                  }}
                  title={colorKey}
                >
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] bg-slate-800 text-white px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none capitalize">
                    {colorKey}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1"></div>
          {/* Dark / Light Toggle */}
          <button 
            onClick={() => setIsDarkMode(prev => !prev)} 
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
            title="切換深淺色"
          >
            {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>

        {/* Right Side User info & Actions */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col text-right hidden sm:block">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{currentUserEmail}</span>
            <div className="flex items-center justify-end gap-1.5 mt-0.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold">Active Developer</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-300 border border-slate-200 dark:border-slate-700">
            <div className="w-full h-full bg-gradient-to-tr from-slate-400 to-[#8fa8a2] flex items-center justify-center text-white text-xs font-bold font-mono">
              LC
            </div>
          </div>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>
          <Link 
            href="/"
            className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-100 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/70 rounded-lg transition-all duration-200"
          >
            <LogOut size={13} />
            <span>回到網站</span>
          </Link>
        </div>
      </header>

      {/* Main Body Wrapper */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-white/40 dark:bg-[#202428]/40 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between shrink-0 hidden md:flex transition-colors duration-300">
          <div className="p-4 space-y-6">
            <div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-2">後台功能導覽</span>
              <nav className="mt-2 space-y-1">
                
                {/* Nav: Overview */}
                <button 
                  onClick={() => handleTabChange("overview")} 
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-300 cursor-pointer ${
                    activeTab === "overview"
                      ? "bg-[var(--theme-primary-light)] text-[var(--theme-primary-text)] font-semibold border-l-4 border-[var(--theme-primary)]"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Terminal size={14} />
                    <span>系統概覽 (Overview)</span>
                  </div>
                  <span className="bg-slate-200 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold">INFO</span>
                </button>
                
                {/* Nav: Whitelist */}
                <button 
                  onClick={() => handleTabChange("whitelist")} 
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-300 cursor-pointer ${
                    activeTab === "whitelist"
                      ? "bg-[var(--theme-primary-light)] text-[var(--theme-primary-text)] font-semibold border-l-4 border-[var(--theme-primary)]"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Users size={14} />
                    <span>白名單維護 (Whitelist)</span>
                  </div>
                  <span className="bg-slate-200 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold">{whitelist.length}</span>
                </button>
                
                {/* Nav: Tools */}
                <button 
                  onClick={() => handleTabChange("tools")} 
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-300 cursor-pointer ${
                    activeTab === "tools"
                      ? "bg-[var(--theme-primary-light)] text-[var(--theme-primary-text)] font-semibold border-l-4 border-[var(--theme-primary)]"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Sliders size={14} />
                    <span>後台工具箱 (Tools)</span>
                  </div>
                  <span className="bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold">TOOLS</span>
                </button>
                
                {/* Nav: Users */}
                <button 
                  onClick={() => handleTabChange("users")} 
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-300 cursor-pointer ${
                    activeTab === "users"
                      ? "bg-[var(--theme-primary-light)] text-[var(--theme-primary-text)] font-semibold border-l-4 border-[var(--theme-primary)]"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Cpu size={14} />
                    <span>用戶管理 (Users)</span>
                  </div>
                  <span className={rlsEnabled ? "text-rose-400" : "text-emerald-400"}>
                    {rlsEnabled ? <Lock size={12} /> : <Unlock size={12} />}
                  </span>
                </button>
              </nav>
            </div>

            {/* Environment Info Widget */}
            <div className="rounded-xl bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/30 p-3.5 space-y-2">
              <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 block">系統節點狀態</span>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Supabase API</span>
                  <span className="font-mono font-semibold text-emerald-500"><i className="fa-solid fa-check-double text-[9px] mr-0.5"></i> Connected</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Database Engine</span>
                  <span className="font-mono font-semibold text-slate-500 dark:text-slate-300">PostgreSQL 15</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">CDN Edge</span>
                  <span className="font-mono font-semibold text-slate-500 dark:text-slate-300">TPE-1 (Active)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer RLS Box Inside Sidebar */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-100/30 dark:bg-slate-900/10">
            <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-3.5 text-center relative overflow-hidden group">
              {/* RLS Status Switcher Layer */}
              <div className="absolute inset-0 bg-slate-100 dark:bg-slate-950 opacity-0 group-hover:opacity-95 transition-opacity duration-300 flex flex-col justify-center items-center p-2">
                <span className="text-[10px] text-slate-400 mb-1.5 font-bold">更改資料庫安全機制?</span>
                <button 
                  onClick={handleToggleRLS}
                  className="px-3 py-1 rounded bg-rose-500 hover:bg-rose-600 text-white font-semibold text-[10px] transition-colors shadow cursor-pointer"
                >
                  {rlsEnabled ? "關閉 RLS" : "開啟 RLS"}
                </button>
              </div>

              {/* Normal RLS display */}
              <div className="flex justify-center mb-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${rlsEnabled ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                  {rlsEnabled ? <ShieldCheck size={16} /> : <AlertCircle size={16} />}
                </div>
              </div>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5">
                {rlsEnabled ? "RLS PROTECTED" : "RLS BYPASSED"}
              </h4>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">
                {rlsEnabled ? "此控制台受 Supabase 行級安全性保護，保障用戶隱私防越權。" : "行級安全性已被關閉，注意數據曝露風險！"}
              </p>
            </div>
          </div>
        </aside>

        {/* Main Dashboard Content */}
        <main className="flex-grow overflow-y-auto bg-slate-50 dark:bg-[#1c1f22] p-4 sm:p-6 md:p-8 flex flex-col justify-between transition-colors duration-300 relative">
          
          {/* Mobile Select Header */}
          <div className="flex md:hidden items-center justify-between mb-4 bg-white dark:bg-slate-900 p-2.5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">功能分區</span>
            <select 
              value={activeTab}
              onChange={(e) => handleTabChange(e.target.value as "overview" | "whitelist" | "tools" | "users")} 
              className="text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg font-medium border-none text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-[var(--theme-primary)]"
            >
              <option value="overview">系統概覽 (Overview)</option>
              <option value="whitelist">白名單維護 (Whitelist)</option>
              <option value="tools">後台工具箱 (Tools)</option>
              <option value="users">用戶管理 (Users)</option>
            </select>
          </div>

          <div className="space-y-6">
            
            {/* Feedback Notifications */}
            {successMsg && (
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/8 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                <ShieldCheck size={16} />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/8 text-rose-500 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* TAB 1: Overview */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider block uppercase">Dashboard</span>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 mt-0.5">
                    系統概覽 <span className="font-mono text-slate-400 font-normal">(OVERVIEW)</span>
                  </h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">目前開發環境的連結指標與核心設定狀態</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Card 1 */}
                  <div className="bg-white dark:bg-[#202428] rounded-xl p-5 border border-slate-200 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 text-slate-100 dark:text-slate-800/30 text-7xl font-bold select-none font-mono pointer-events-none group-hover:scale-110 transition-transform">
                      {totalProfiles}
                    </div>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">已建立名片的特工</span>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">{totalProfiles}</span>
                          <span className="text-xs text-slate-400">位特工</span>
                        </div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        <Users size={18} />
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">{completedProfiles} 完整名片</span>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800/80 text-slate-500 px-2 py-0.5 rounded-full font-mono">NORMAL</span>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="bg-white dark:bg-[#202428] rounded-xl p-5 border border-slate-200 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 text-slate-100 dark:text-slate-800/30 text-7xl font-bold select-none font-mono pointer-events-none group-hover:scale-110 transition-transform">
                      {whitelist.length}
                    </div>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">ACTIVE WHITELIST COUNTS</span>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">{whitelist.length}</span>
                          <span className="text-xs text-slate-400">個白名單信箱</span>
                        </div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        <Terminal size={18} />
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">已啟用連線驗證機制</span>
                      <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-mono font-bold">CONFIGURED</span>
                    </div>
                  </div>

                </div>

                {/* Hero Top 5 */}
                {heroStats.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={14} className="text-[var(--theme-primary-text)]" />
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
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{heroName}</span>
                                <span className="text-[10px] font-black text-slate-500">{stat.count} 人</span>
                              </div>
                              <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-primary-dark)] rounded-full transition-all"
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

                {/* Warning Tip */}
                <div className="bg-amber-50/50 dark:bg-amber-950/20 border-l-4 border-amber-500/80 rounded-r-xl p-5 shadow-sm flex items-start gap-4">
                  <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg shrink-0">
                    <AlertCircle size={20} />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300">開發者後台安全提示</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      白名單內的所有帳戶在登入系統時，會被資料庫 <code className="bg-amber-100/50 dark:bg-amber-900/40 px-1 py-0.5 rounded font-mono text-[11px]">Trigger</code> 自動更新為 <code className="font-bold">role = &apos;developer&apos;</code>。
                      非開發團隊成員切勿任意加入白名單，以免造成敏感工具被非授權使用者利用。
                    </p>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: Whitelist */}
            {activeTab === "whitelist" && (
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider block uppercase">Security Settings</span>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 mt-0.5">
                    白名單維護 <span className="font-mono text-slate-400 font-normal">(WHITELIST MANAGEMENT)</span>
                  </h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">在此新增或移除有權限進入開發者後台的 Google 帳號 Email</p>
                </div>

                <div className="bg-white dark:bg-[#202428] rounded-xl p-5 border border-slate-200 dark:border-slate-800/80 shadow-sm">
                  <form onSubmit={handleAddWhitelist} className="flex flex-col sm:flex-row items-stretch gap-3">
                    <div className="relative flex-1">
                      <input 
                        type="email" 
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="輸入授權的 Google Login Email (例如: user@gmail.com)" 
                        className="w-full px-4 py-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] text-slate-800 dark:text-slate-100 placeholder-slate-400 transition-all"
                        required
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={loading}
                      className="px-5 py-3 rounded-lg text-xs font-bold text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-primary-dark)] hover:opacity-90 cursor-pointer disabled:opacity-50"
                    >
                      <Plus size={14} />
                      <span>新增授權</span>
                    </button>
                  </form>
                </div>

                <div className="bg-white dark:bg-[#202428] rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 dark:bg-slate-900/30 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200/50 dark:border-slate-800/50">
                          <th className="px-6 py-4">白名單授權 EMAIL</th>
                          <th className="px-6 py-4">授權時間</th>
                          <th className="px-6 py-4 text-right">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs text-slate-600 dark:text-slate-300">
                        {whitelist.length > 0 ? (
                          whitelist.map((item) => (
                            <tr key={item.email} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                              <td className="px-6 py-4 font-mono font-medium">{item.email}</td>
                              <td className="px-6 py-4 text-slate-400 font-mono">
                                {new Date(item.created_at).toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button 
                                  onClick={() => handleDeleteWhitelist(item.email)}
                                  disabled={loading || item.email.toLowerCase() === currentUserEmail.toLowerCase()}
                                  className="text-xs font-bold text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 rounded-lg transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                                >
                                  <Trash2 size={13} className="inline mr-1" />
                                  <span>移除</span>
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={3} className="px-6 py-12 text-center text-slate-400">
                              <div className="flex flex-col items-center justify-center gap-3">
                                <AlertCircle className="text-3xl opacity-60 text-slate-400" />
                                <span className="text-xs">白名單中目前沒有任何資料，請在上方欄位新增！</span>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}



            {/* TAB 4: Tools */}
            {activeTab === "tools" && (
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider block uppercase">Control Suite</span>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 mt-0.5">
                    後台工具箱 <span className="font-mono text-slate-400 font-normal">(DEVELOPER TOOLS)</span>
                  </h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">用於系統研發、版面位置調校與標籤維護的開發者工具箱</p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  
                  {/* Tool 1 */}
                  <div className="bg-white dark:bg-[#202428] rounded-xl p-5 border border-slate-200 dark:border-slate-800/80 shadow-sm flex flex-col justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl shrink-0">
                        <Sliders size={20} />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                          英雄立繪對準工具 <span className="font-mono text-[11px] text-slate-400">(Portrait Aligner)</span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          用於精密調整《鬥陣特攻 2》英雄半身頭像立繪在卡槽中的 <strong>縮放比 (Scale)</strong> 與 <strong>X/Y 軸位移補償參數</strong>。保存後會即時寫入系統設定，全站無縫同步。
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-end border-t border-slate-100 dark:border-slate-800/50 pt-3">
                      <Link 
                        href="/developer/adjuster" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-md hover:shadow-lg flex items-center gap-1.5 transition-all bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-primary-dark)] hover:opacity-90"
                      >
                        <span>啟動對準工具</span>
                        <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>

                  {/* Tool 2 */}
                  <div className="bg-white dark:bg-[#202428] rounded-xl p-5 border border-slate-200 dark:border-slate-800/80 shadow-sm flex flex-col justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl shrink-0">
                        <Cpu size={20} />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                          首頁內容調校工具 <span className="font-mono text-[11px] text-slate-400">(Homepage Aligner)</span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          用於精密調整首頁「站長隨筆手札」各區塊元件的 <strong>X/Y 軸平移像素</strong>、<strong>縮放比例</strong> 與 <strong>字級大小</strong>，並支援上傳自訂圖片圖標。
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-end border-t border-slate-100 dark:border-slate-800/50 pt-3">
                      <Link 
                        href="/developer/homepage-aligner" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-md hover:shadow-lg flex items-center gap-1.5 transition-all bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-primary-dark)] hover:opacity-90"
                      >
                        <span>啟動調校工具</span>
                        <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>

                  {/* Tool 3 */}
                  <div className="bg-white dark:bg-[#202428] rounded-xl p-5 border border-slate-200 dark:border-slate-800/80 shadow-sm flex flex-col justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl shrink-0">
                        <Tags size={20} />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                          特色標籤管理工具 <span className="font-mono text-[11px] text-slate-400">(Tags Manager)</span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          用於維護不同遊戲下的特色標籤，供玩家在設定個人名片時選取（例如：鬥陣特攻）。支援新增特色標籤與物理刪除。
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-end border-t border-slate-100 dark:border-slate-800/50 pt-3">
                      <Link 
                        href="/developer/tags-manager" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-md hover:shadow-lg flex items-center gap-1.5 transition-all bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-primary-dark)] hover:opacity-90"
                      >
                        <span>啟動標籤管理</span>
                        <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* TAB 5: Users */}
            {activeTab === "users" && (
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider block uppercase">Accounts & Profiles</span>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 mt-0.5">
                    用戶管理 <span className="font-mono text-slate-400 font-normal">(USER MANAGEMENT)</span>
                  </h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">查看所有已建立名片的玩家（最多 100 筆，不含聯絡方式）</p>
                </div>

                {/* Error / Denied State */}
                {rlsEnabled && (
                  <div className="bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl p-8 text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto text-lg">
                      <Lock size={20} />
                    </div>
                    <div className="space-y-1 max-w-md mx-auto">
                      <h3 className="text-sm font-bold text-red-700 dark:text-red-300">permission denied for table profiles</h3>
                      <p className="text-xs text-red-600/80 dark:text-red-400/80 leading-relaxed font-mono">
                        資料庫傳回安全性錯誤：當前連線因不具備足夠的 IAM 權限或未繞過 RLS 行級別安全政策，無法讀取資料表 <code className="px-1 py-0.5 rounded bg-red-100 dark:bg-red-950 font-bold">profiles</code> 的內容。
                      </p>
                    </div>
                    <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center items-center">
                      <button 
                        onClick={handlePrivilegeElevation}
                        className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Terminal size={12} />
                        <span>臨時提升權限繞過 RLS</span>
                      </button>
                      <button 
                        onClick={handleToggleRLS}
                        className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-all cursor-pointer"
                      >
                        關閉全局 RLS 限制
                      </button>
                    </div>
                  </div>
                )}

                {/* Table State (RLS Bypassed or custom simulated data) */}
                {!rlsEnabled && (
                  <div className="space-y-4">
                    <div className="px-5 py-4 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-500/20 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="font-bold">連線成功：已暫時繞過安全限制讀取實體資料</span>
                      </div>
                      <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full font-mono font-bold uppercase">Bypassed</span>
                    </div>

                    {usersLoading && (
                      <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
                        <Loader2 size={20} className="animate-spin" />
                        <span className="text-sm font-bold">載入用戶資料中...</span>
                      </div>
                    )}

                    {usersError && !usersLoading && (
                      <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/8 text-rose-500 text-xs font-semibold flex items-center gap-2">
                        <AlertCircle size={16} />
                        <span>{usersError}</span>
                      </div>
                    )}

                    {usersData && !usersLoading && (
                      <>
                        <div className="relative">
                          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            placeholder="搜尋 BattleTag（server-side 過濾）..."
                            value={usersSearch}
                            onChange={e => handleUsersSearch(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[var(--theme-primary)] transition-all"
                          />
                        </div>

                        <div className="bg-white dark:bg-[#202428] rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-sm overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-900/30 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200/50 dark:border-slate-800/50">
                                  <th className="px-6 py-4">玩家 ID</th>
                                  <th className="px-6 py-4">玩家名稱 (BattleTag)</th>
                                  <th className="px-6 py-4">英雄數</th>
                                  <th className="px-6 py-4">公開狀態</th>
                                  <th className="px-6 py-4">更新時間</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs text-slate-600 dark:text-slate-300">
                                {usersData.map(profile => (
                                  <tr key={profile.user_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                                    <td className="px-6 py-3.5 font-mono text-[11px] text-slate-400">#{profile.user_id.slice(0, 8)}</td>
                                    <td className="px-6 py-3.5 font-semibold">{profile.battle_tag || <span className="text-slate-400 italic">未命名</span>}</td>
                                    <td className="px-6 py-3.5">
                                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold">
                                        {(profile.selected_heroes ?? []).length} 個英雄
                                      </span>
                                    </td>
                                    <td className="px-6 py-3.5">
                                      {profile.is_tag_visible ? (
                                        <span className="text-emerald-500 flex items-center gap-1"><Eye size={12} /> 公開</span>
                                      ) : (
                                        <span className="text-slate-400 flex items-center gap-1"><EyeOff size={12} /> 隱藏</span>
                                      )}
                                    </td>
                                    <td className="px-6 py-3.5 text-slate-400">
                                      {new Date(profile.updated_at).toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })}
                                    </td>
                                  </tr>
                                ))}
                                {usersData.length === 0 && (
                                  <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                                      沒有找到玩家資料。
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                          <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 font-bold">
                            {usersSearch ? `搜尋「${usersSearch}」結果` : `顯示前 ${usersData.length} 筆特工名片`}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

              </div>
            )}

          </div>

          {/* Real-time Console Log Tray */}
          <footer className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800/80 flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3 shrink-0">
            <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500 text-[10px] font-mono">
              <span className="flex items-center gap-1.5 bg-slate-200 dark:bg-slate-800/80 px-2 py-1 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>NODE_ENV: {process.env.NODE_ENV}</span>
              </span>
              <span>|</span>
              <span>API RESPONSE: OK</span>
            </div>
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
              Overwatch Social © 2026 Admin Panel • Developer Console
            </div>
          </footer>

        </main>
      </div>

    </div>
  );
}
