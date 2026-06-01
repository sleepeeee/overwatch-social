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
  TrendingUp,
  Search,
  Loader2,
  Eye,
  EyeOff
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

// 英雄名稱查找表（module-level，只建一次）
const heroNameMap = new Map(HEROES_CONFIG.map(h => [h.id, h.name]));

// 台灣時間格式器（module-level，避免每次 render 重新建立 Intl 物件）
const taipeiFormatter = new Intl.DateTimeFormat("zh-TW", {
  timeZone: "Asia/Taipei",
  year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit",
});

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

  // debounce cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, []);

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
    } catch (err) {
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

  // Tab 切換：useTransition 包住 async fetch，isPending 正確反映網路等待狀態
  const handleTabChange = (tab: "overview" | "whitelist" | "tools" | "users") => {
    setActiveTab(tab);
    if (tab === "users" && !usersData && !usersLoading) {
      startTransition(async () => {
        await fetchUsers();
      });
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
    } catch (err) {
      setErrorMsg("執行 Server Action 發生未知錯誤");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col font-sans selection:bg-[#82b7cc] selection:text-slate-900">
      {/* 霓虹發光背景裝飾球 */}
      {/* radial-gradient 取代 blur-[150px]，視覺相似但零 GPU compositing 成本 */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] pointer-events-none" style={{ background: "radial-gradient(circle, rgba(130,183,204,0.10) 0%, transparent 70%)" }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] pointer-events-none" style={{ background: "radial-gradient(circle, rgba(245,212,107,0.05) 0%, transparent 70%)" }} />

      {/* 頂部導覽 */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40 px-6 py-4 flex justify-between items-center shadow-[0_1px_10px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#82b7cc] to-[#3b82f6] flex items-center justify-center shadow-[0_0_15px_rgba(130,183,204,0.4)]">
            <Cpu size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-widest bg-gradient-to-r from-white via-slate-200 to-[#82b7cc] bg-clip-text text-transparent uppercase">OVERWATCH social</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Developer Console | 開發者控制台</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-bold text-slate-300">{currentUserEmail}</span>
            <span className="text-[9px] font-black tracking-wider text-emerald-400 uppercase flex items-center gap-1 justify-end">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active Developer
            </span>
          </div>
          <Link 
            href="/" 
            className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-slate-700/50"
          >
            <LogOut size={13} />
            <span>回到網站</span>
          </Link>
        </div>
      </header>

      {/* 主體區域 */}
      <main className="flex-grow max-w-6xl w-full mx-auto p-6 md:p-8 flex flex-col md:flex-row gap-6 relative z-10">
        
        {/* 左側 Sidebar 選單 */}
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

        {/* 右側內容卡片 */}
        <section className="flex-grow bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 min-h-[500px] flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
          
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
                      白名單中的所有帳戶在登入系統時，會被資料庫 Trigger 自動更新為 `role = 'developer'`。
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
                                {taipeiFormatter.format(new Date(item.created_at))}
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
            {activeTab === "tools" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-wider mb-1">高階製程工具 (Advanced Tools)</h2>
                  <p className="text-xs text-slate-400">研發與調校專用的進階控制儀</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* 精密對準儀入口卡片 */}
                  <div className="p-6 rounded-xl border border-[#cbdfe6]/20 bg-slate-950/40 hover:border-[#82b7cc]/40 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 group">
                    <div className="space-y-2 max-w-xl">
                      <div className="flex items-center gap-2">
                        <Sliders className="text-[#82b7cc]" size={20} />
                        <h3 className="text-base font-black text-slate-200">精密立繪對準補償儀 (APC Aligner)</h3>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        對準儀是用於精密調整《鬥陣特工 2》英雄半身胸像立繪在卡槽中的 **縮放比 (Scale)** 與 **X/Y 軸位移補償參數** 的開發者專屬工具。
                        保存後會即時寫入系統設定，全站無縫同步。
                      </p>
                    </div>

                    <Link 
                      href="/developer/adjuster"
                      className="bg-gradient-to-r from-[#82b7cc] to-[#3b82f6] text-white px-5 py-3 rounded-xl text-xs font-black tracking-widest uppercase flex items-center gap-2 transition-all hover:scale-[1.03] shadow-[0_5px_15px_rgba(130,183,204,0.3)] hover:shadow-[0_8px_20px_rgba(130,183,204,0.5)] whitespace-nowrap"
                    >
                      <span>啟動對準儀</span>
                      <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
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
                                    {taipeiFormatter.format(new Date(profile.updated_at))}
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
          <footer className="mt-8 pt-4 border-t border-slate-900/60 text-center text-[10px] text-slate-600 font-bold uppercase tracking-widest">
            Overwatch Social © 2026 Admin Panel • Closed Loop Process Control
          </footer>

        </section>

      </main>
    </div>
  );
}
