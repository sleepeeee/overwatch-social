/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
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
  Image as ImageIcon
} from "lucide-react";
import { addWhitelistEmail, removeWhitelistEmail } from "@/app/actions/developer";
import { getAnnouncements, saveAnnouncements, uploadAnnouncementIcon, AnnouncementItem, AlignmentConfig } from "@/app/actions/homepage";
import LotusWelcomeWidget from "@/components/morning-sketch/LotusWelcomeWidget";

interface DeveloperConsoleClientProps {
  initialWhitelist: Array<{ email: string; created_at: string }>;
  currentUserEmail: string;
  totalProfiles?: number;
  completedProfiles?: number;
  statsError?: string;
}

export default function DeveloperConsoleClient({
  initialWhitelist,
  currentUserEmail,
  totalProfiles = 0,
  completedProfiles = 0,
  statsError,
}: DeveloperConsoleClientProps) {
  const [whitelist, setWhitelist] = useState(initialWhitelist);
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  // Tab 狀態管理
  const [activeTab, setActiveTab] = useState<"overview" | "whitelist" | "tools">("overview");

  // APC 子工具切換
  const [activeApcTool, setActiveApcTool] = useState<"none" | "homepage">("none");
  // 選擇按鈕當前選取的公告 segment (1-4)
  const [activeSegment, setActiveSegment] = useState<number>(1);

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
        buttons_y: 0
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
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col font-sans selection:bg-[#82b7cc] selection:text-slate-900">
      {/* 霓虹發光背景裝飾球 */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#82b7cc]/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#f5d46b]/5 blur-[150px] pointer-events-none" />

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
      <main className={`flex-grow w-full mx-auto p-6 md:p-8 flex flex-col relative z-10 ${
        activeApcTool === "homepage" ? "max-w-7xl" : "max-w-6xl md:flex-row gap-6"
      }`}>
        
        {/* 左側 Sidebar 選單 */}
        {activeApcTool !== "homepage" && (
          <aside className="w-full md:w-64 shrink-0 flex flex-col gap-2">
          <button
            onClick={() => setActiveTab("overview")}
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
            onClick={() => setActiveTab("whitelist")}
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
            onClick={() => setActiveTab("tools")}
            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all font-black text-sm border ${
              activeTab === "tools"
                ? "bg-gradient-to-r from-slate-900 to-slate-800/80 text-white border-slate-700 shadow-md shadow-black/20"
                : "bg-transparent text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/40"
            }`}
          >
            <Sliders size={16} className={activeTab === "tools" ? "text-[#82b7cc]" : ""} />
            <span>高階製程工具 (APC Tools)</span>
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
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                      <span>高階製程工具 (APC Tools)</span>
                      <span>/</span>
                      <span className="text-[#82b7cc]">首頁精密調校</span>
                    </div>
                    <h2 className="text-xl font-black text-white uppercase tracking-wider">首頁內容精密調校儀</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveApcTool("none");
                      setErrorMsg("");
                      setSuccessMsg("");
                    }}
                    className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-2 rounded-lg text-xs font-bold transition-all border border-slate-700/50 cursor-pointer"
                  >
                    <ArrowLeft size={13} />
                    <span>返回工具列表</span>
                  </button>
                </div>

                {/* 左右雙欄配置：左邊 Sticky 預覽，右邊調校 Form */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* 左欄：Sticky 即時預覽監視器 */}
                  <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
                    <div className="p-5 rounded-xl border border-slate-800/80 bg-slate-950/60 space-y-3">
                      <span className="text-[10px] font-black text-[#82b7cc] uppercase tracking-widest block text-center">
                        🔍 即時製程監控預覽 (Closed Loop Process Live Monitor)
                      </span>
                      <div className="max-w-md mx-auto w-full border border-slate-800 rounded-2xl overflow-hidden shadow-[0_10px_35px_rgba(0,0,0,0.5)]">
                        <LotusWelcomeWidget previewData={announcements} activeStepOverride={activeSegment} />
                      </div>
                    </div>
                  </div>

                  {/* 右欄：Segmented Control 與各設定細項 */}
                  <div className="lg:col-span-7 space-y-6">
                    {/* 選擇按鈕切換 Segmented Control */}
                    <div className="bg-slate-950/60 p-1.5 rounded-xl border border-slate-800/80 flex gap-2 w-full">
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
                                ? "bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-slate-700 shadow-md shadow-black/25"
                                : "text-slate-500 hover:text-slate-300 hover:bg-slate-900/30 border border-transparent"
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
                          buttons_x: 0, buttons_y: 0
                        };

                        return (
                          <div key={item.num} className="space-y-6">
                            {/* 1. 文字公告編輯區 */}
                            <div className="p-5 rounded-xl border border-slate-800/80 bg-slate-950/40 space-y-4">
                              <h3 className="text-xs font-black text-[#82b7cc] uppercase tracking-widest border-b border-slate-800 pb-2">
                                📝 內容文字編輯 (Announcements Data)
                              </h3>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">標籤 (Tag)</label>
                                  <input
                                    type="text"
                                    value={item.tag}
                                    onChange={(e) => handleAnnouncementChange(idx, "tag", e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#82b7cc] text-slate-200"
                                    required
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">標題 (Title)</label>
                                  <input
                                    type="text"
                                    value={item.title}
                                    onChange={(e) => handleAnnouncementChange(idx, "title", e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#82b7cc] text-slate-200"
                                    required
                                  />
                                </div>
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">引言內容 (Message)</label>
                                <textarea
                                  rows={2}
                                  value={item.message}
                                  onChange={(e) => handleAnnouncementChange(idx, "message", e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#82b7cc] text-slate-200 leading-relaxed"
                                  required
                                />
                              </div>
                            </div>

                            {/* 2. 圖標更換 (上傳與還原) */}
                            <div className="p-5 rounded-xl border border-slate-800/80 bg-slate-950/40 space-y-4">
                              <h3 className="text-xs font-black text-[#82b7cc] uppercase tracking-widest border-b border-slate-800 pb-2">
                                🖼️ 圖標自定義圖片 (Custom Image Icon)
                              </h3>
                              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                                <div className="w-20 h-20 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                                  {item.custom_icon_url ? (
                                    <img src={item.custom_icon_url} alt="Icon preview" className="w-full h-full object-contain" />
                                  ) : (
                                    <div className="text-center text-[10px] text-slate-500 font-bold p-1">
                                      <ImageIcon className="mx-auto text-slate-600 mb-1" size={16} />
                                      預設蓮花 SVG
                                    </div>
                                  )}
                                </div>
                                <div className="space-y-3 flex-grow">
                                  <p className="text-[10px] text-slate-400 leading-relaxed">
                                    上傳自定義的圖標圖片以更換該公告的頂部圖標。上傳成功後，首頁小卡片將渲染此圖片。
                                  </p>
                                  <div className="flex flex-wrap gap-3">
                                    <label className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-black uppercase tracking-wider transition-all hover:scale-[1.02] cursor-pointer whitespace-nowrap">
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
                                        className="px-4 py-2 bg-red-950/30 hover:bg-red-950/60 border border-red-900/40 hover:border-red-900 text-red-400 rounded-xl text-xs font-black uppercase tracking-wider transition-all hover:scale-[1.02] cursor-pointer"
                                      >
                                        還原預設圖標
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* 3. 精密位置補償調校 */}
                            <div className="p-5 rounded-xl border border-slate-800/80 bg-slate-950/40 space-y-4">
                              <h3 className="text-xs font-black text-[#82b7cc] uppercase tracking-widest border-b border-slate-800 pb-2">
                                ⚙️ 精密位置與字型大小對準 (Closed Loop Calibration)
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* A. 圖標調校 */}
                                <div className="space-y-4">
                                  <span className="text-[11px] font-black text-slate-300 block">💮 圖標設定 (Icon Configs)</span>
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between gap-4">
                                      <span className="text-[10px] font-semibold text-slate-400">圖標大小比例 (icon_scale)</span>
                                      <div className="flex items-center gap-1.5">
                                        <button type="button" onClick={() => adjustAlignment("icon_scale", -5, 50, 150)} className="w-6 h-6 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded flex items-center justify-center text-xs font-black text-slate-300 active:scale-95 cursor-pointer">-</button>
                                        <span className="w-12 text-center text-xs font-mono text-slate-200">{alignments.icon_scale}%</span>
                                        <button type="button" onClick={() => adjustAlignment("icon_scale", 5, 50, 150)} className="w-6 h-6 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded flex items-center justify-center text-xs font-black text-slate-300 active:scale-95 cursor-pointer">+</button>
                                      </div>
                                    </div>
                                    {/* X & Y */}
                                    <div className="flex items-center justify-between gap-4">
                                      <span className="text-[10px] font-semibold text-slate-400">圖標 X 軸位移 (icon_x)</span>
                                      <div className="flex items-center gap-1.5">
                                        <button type="button" onClick={() => adjustAlignment("icon_x", -1, -50, 50)} className="w-6 h-6 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded flex items-center justify-center text-xs font-black text-slate-300 active:scale-95 cursor-pointer">-</button>
                                        <span className="w-12 text-center text-xs font-mono text-slate-200">{alignments.icon_x}px</span>
                                        <button type="button" onClick={() => adjustAlignment("icon_x", 1, -50, 50)} className="w-6 h-6 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded flex items-center justify-center text-xs font-black text-slate-300 active:scale-95 cursor-pointer">+</button>
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                      <span className="text-[10px] font-semibold text-slate-400">圖標 Y 軸位移 (icon_y)</span>
                                      <div className="flex items-center gap-1.5">
                                        <button type="button" onClick={() => adjustAlignment("icon_y", -1, -50, 50)} className="w-6 h-6 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded flex items-center justify-center text-xs font-black text-slate-300 active:scale-95 cursor-pointer">-</button>
                                        <span className="w-12 text-center text-xs font-mono text-slate-200">{alignments.icon_y}px</span>
                                        <button type="button" onClick={() => adjustAlignment("icon_y", 1, -50, 50)} className="w-6 h-6 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded flex items-center justify-center text-xs font-black text-slate-300 active:scale-95 cursor-pointer">+</button>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* B. 標題調校 */}
                                <div className="space-y-4">
                                  <span className="text-[11px] font-black text-slate-300 block">📝 標題設定 (Title Configs)</span>
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between gap-4">
                                      <span className="text-[10px] font-semibold text-slate-400">標題字體大小 (title_font_size)</span>
                                      <div className="flex items-center gap-1.5">
                                        <button type="button" onClick={() => adjustAlignment("title_font_size", -1, 10, 28)} className="w-6 h-6 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded flex items-center justify-center text-xs font-black text-slate-300 active:scale-95 cursor-pointer">-</button>
                                        <span className="w-12 text-center text-xs font-mono text-slate-200">{alignments.title_font_size}px</span>
                                        <button type="button" onClick={() => adjustAlignment("title_font_size", 1, 10, 28)} className="w-6 h-6 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded flex items-center justify-center text-xs font-black text-slate-300 active:scale-95 cursor-pointer">+</button>
                                      </div>
                                    </div>
                                    {/* X & Y */}
                                    <div className="flex items-center justify-between gap-4">
                                      <span className="text-[10px] font-semibold text-slate-400">標題 X 軸位移 (title_x)</span>
                                      <div className="flex items-center gap-1.5">
                                        <button type="button" onClick={() => adjustAlignment("title_x", -1, -50, 50)} className="w-6 h-6 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded flex items-center justify-center text-xs font-black text-slate-300 active:scale-95 cursor-pointer">-</button>
                                        <span className="w-12 text-center text-xs font-mono text-slate-200">{alignments.title_x}px</span>
                                        <button type="button" onClick={() => adjustAlignment("title_x", 1, -50, 50)} className="w-6 h-6 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded flex items-center justify-center text-xs font-black text-slate-300 active:scale-95 cursor-pointer">+</button>
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                      <span className="text-[10px] font-semibold text-slate-400">標題 Y 軸位移 (title_y)</span>
                                      <div className="flex items-center gap-1.5">
                                        <button type="button" onClick={() => adjustAlignment("title_y", -1, -50, 50)} className="w-6 h-6 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded flex items-center justify-center text-xs font-black text-slate-300 active:scale-95 cursor-pointer">-</button>
                                        <span className="w-12 text-center text-xs font-mono text-slate-200">{alignments.title_y}px</span>
                                        <button type="button" onClick={() => adjustAlignment("title_y", 1, -50, 50)} className="w-6 h-6 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded flex items-center justify-center text-xs font-black text-slate-300 active:scale-95 cursor-pointer">+</button>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* C. 內文調校 */}
                                <div className="space-y-4">
                                  <span className="text-[11px] font-black text-slate-300 block">💬 內文設定 (Message Configs)</span>
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between gap-4">
                                      <span className="text-[10px] font-semibold text-slate-400">內文字體大小 (message_font_size)</span>
                                      <div className="flex items-center gap-1.5">
                                        <button type="button" onClick={() => adjustAlignment("message_font_size", -1, 10, 20)} className="w-6 h-6 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded flex items-center justify-center text-xs font-black text-slate-300 active:scale-95 cursor-pointer">-</button>
                                        <span className="w-12 text-center text-xs font-mono text-slate-200">{alignments.message_font_size}px</span>
                                        <button type="button" onClick={() => adjustAlignment("message_font_size", 1, 10, 20)} className="w-6 h-6 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded flex items-center justify-center text-xs font-black text-slate-300 active:scale-95 cursor-pointer">+</button>
                                      </div>
                                    </div>
                                    {/* X & Y */}
                                    <div className="flex items-center justify-between gap-4">
                                      <span className="text-[10px] font-semibold text-slate-400">內文 X 軸位移 (message_x)</span>
                                      <div className="flex items-center gap-1.5">
                                        <button type="button" onClick={() => adjustAlignment("message_x", -1, -50, 50)} className="w-6 h-6 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded flex items-center justify-center text-xs font-black text-slate-300 active:scale-95 cursor-pointer">-</button>
                                        <span className="w-12 text-center text-xs font-mono text-slate-200">{alignments.message_x}px</span>
                                        <button type="button" onClick={() => adjustAlignment("message_x", 1, -50, 50)} className="w-6 h-6 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded flex items-center justify-center text-xs font-black text-slate-300 active:scale-95 cursor-pointer">+</button>
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                      <span className="text-[10px] font-semibold text-slate-400">內文 Y 軸位移 (message_y)</span>
                                      <div className="flex items-center gap-1.5">
                                        <button type="button" onClick={() => adjustAlignment("message_y", -1, -50, 50)} className="w-6 h-6 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded flex items-center justify-center text-xs font-black text-slate-300 active:scale-95 cursor-pointer">-</button>
                                        <span className="w-12 text-center text-xs font-mono text-slate-200">{alignments.message_y}px</span>
                                        <button type="button" onClick={() => adjustAlignment("message_y", 1, -50, 50)} className="w-6 h-6 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded flex items-center justify-center text-xs font-black text-slate-300 active:scale-95 cursor-pointer">+</button>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* D. 按鈕組調校 */}
                                <div className="space-y-4">
                                  <span className="text-[11px] font-black text-slate-300 block">🔘 按鈕組設定 (Buttons Configs)</span>
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between gap-4">
                                      <span className="text-[10px] font-semibold text-slate-400">按鈕組 X 軸位移 (buttons_x)</span>
                                      <div className="flex items-center gap-1.5">
                                        <button type="button" onClick={() => adjustAlignment("buttons_x", -1, -50, 50)} className="w-6 h-6 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded flex items-center justify-center text-xs font-black text-slate-300 active:scale-95 cursor-pointer">-</button>
                                        <span className="w-12 text-center text-xs font-mono text-slate-200">{alignments.buttons_x}px</span>
                                        <button type="button" onClick={() => adjustAlignment("buttons_x", 1, -50, 50)} className="w-6 h-6 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded flex items-center justify-center text-xs font-black text-slate-300 active:scale-95 cursor-pointer">+</button>
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                      <span className="text-[10px] font-semibold text-slate-400">按鈕組 Y 軸位移 (buttons_y)</span>
                                      <div className="flex items-center gap-1.5">
                                        <button type="button" onClick={() => adjustAlignment("buttons_y", -1, -50, 50)} className="w-6 h-6 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded flex items-center justify-center text-xs font-black text-slate-300 active:scale-95 cursor-pointer">-</button>
                                        <span className="w-12 text-center text-xs font-mono text-slate-200">{alignments.buttons_y}px</span>
                                        <button type="button" onClick={() => adjustAlignment("buttons_y", 1, -50, 50)} className="w-6 h-6 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded flex items-center justify-center text-xs font-black text-slate-300 active:scale-95 cursor-pointer">+</button>
                                      </div>
                                    </div>
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
