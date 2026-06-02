"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Tags,
  Plus,
  Trash2,
  AlertCircle,
  ArrowLeft,
  Loader2,
  Check
} from "lucide-react";
import { getGameSpecialTags, addGameSpecialTag, deleteGameSpecialTag } from "@/app/actions/tags";

export interface TagItem {
  id: string;
  game_id: string;
  tag_name: string;
  style_class: string;
  created_at: string;
}

interface TagsManagerClientProps {
  initialTags: TagItem[];
  currentUserEmail: string;
}

export default function TagsManagerClient({
  initialTags,
  currentUserEmail,
}: TagsManagerClientProps) {
  const [tags, setTags] = useState<TagItem[]>(initialTags);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // 新增標籤表單狀態
  const [newTagName, setNewTagName] = useState("");
  const [newTagStyle, setNewTagStyle] = useState<"sage" | "rose" | "blue" | "clay">("clay");
  const [selectedGame, setSelectedGame] = useState("overwatch");

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

  // 載入特色標籤
  const loadTags = async () => {
    const res = await getGameSpecialTags();
    if (res.success && res.data) {
      setTags(res.data as TagItem[]);
    }
  };

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

  // 新增特色標籤
  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    // 根據選擇的莫蘭迪風格產生對應的 CSS 樣式
    const stylesMap = {
      sage: "bg-[#8fa8a2]/15 text-[#59756f] border-[#8fa8a2]/30",
      rose: "bg-[#bfa1a1]/15 text-[#8c6c6c] border-[#bfa1a1]/30",
      blue: "bg-[#8ca9b3]/15 text-[#5c7c88] border-[#8ca9b3]/30",
      clay: "bg-[#b4a091]/15 text-[#8c6c5c] border-[#b4a091]/30"
    };

    const styleClass = stylesMap[newTagStyle];

    try {
      const res = await addGameSpecialTag(selectedGame, newTagName, styleClass);
      if (res.success) {
        triggerToast(`成功新增特色標籤「${newTagName}」`);
        setNewTagName("");
        await loadTags();
      } else {
        triggerToast(res.error || "新增失敗", true);
      }
    } catch {
      triggerToast("執行 Server Action 發生未知錯誤", true);
    } finally {
      setLoading(false);
    }
  };

  // 刪除特色標籤
  const handleDeleteTag = async (tagId: string, name: string) => {
    if (!confirm(`確定要物理刪除特色標籤「${name}」嗎？\n已套用此標籤的玩家資料將不再顯示此標籤。`)) {
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await deleteGameSpecialTag(tagId);
      if (res.success) {
        triggerToast(`已成功物理刪除標籤「${name}」`);
        await loadTags();
      } else {
        triggerToast(res.error || "刪除失敗", true);
      }
    } catch {
      triggerToast("執行 Server Action 發生未知錯誤", true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gradient-to-b from-[#fcf9f2] to-[#f3ecd8] text-[#5d4037] selection:bg-[#82b7cc] selection:text-slate-900 transition-colors duration-500 relative">
      
      {/* 莫蘭迪柔和裝飾球 */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#8fa8a2]/5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#b4a091]/8 blur-[150px] pointer-events-none" />

      {/* 頂部導覽 */}
      <header className="sticky top-0 z-40 px-6 py-4 flex justify-between items-center border-b border-[#8c7c6c]/15 bg-white/70 backdrop-blur-xl text-[#3e2723] shadow-[0_1px_10px_rgba(140,124,108,0.05)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#b4a091] to-[#8c7c6c] flex items-center justify-center shadow-[0_4px_12px_rgba(180,160,145,0.3)]">
            <Tags size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-widest uppercase text-[#3e2723]">OVERWATCH social</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8c7c6c]">Tags Manager | 特色標籤管理工具</p>
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border bg-white/80 hover:bg-[#8c7c6c]/10 text-[#8c7c6c] hover:text-[#3e2723] border-[#8c7c6c]/20 shadow-sm shadow-[#8c7c6c]/5"
          >
            <ArrowLeft size={13} />
            <span>返回控制台</span>
          </Link>
        </div>
      </header>

      {/* 主體區域 */}
      <main className="flex-grow w-full mx-auto p-6 md:p-8 flex flex-col relative z-10 max-w-5xl">
        
        {/* Toast 提示 */}
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

        {/* 雙欄版面 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* 左欄：新增標籤面板 */}
          <div className="lg:col-span-1 p-5 rounded-2xl border border-[#8c7c6c]/15 bg-white/40 backdrop-blur-md space-y-4 shadow-sm">
            <h3 className="text-xs font-black text-[#8c7c6c] uppercase tracking-widest border-b border-[#8c7c6c]/15 pb-2">
              🏷️ 新增特色標籤 (Add Game Tag)
            </h3>
            
            <form onSubmit={handleAddTag} className="space-y-4">
              
              {/* 遊戲項目 */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#8c7c6c] uppercase tracking-wider">遊戲項目</label>
                <select 
                  value={selectedGame}
                  onChange={(e) => setSelectedGame(e.target.value)}
                  className="w-full bg-white/80 border border-[#8c7c6c]/20 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#82b7cc] text-[#3e2723]"
                >
                  <option value="overwatch">鬥陣特攻 (Overwatch)</option>
                </select>
              </div>

              {/* 標籤名稱 */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#8c7c6c] uppercase tracking-wider">標籤名稱</label>
                <input 
                  type="text" 
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="例如: 輔助天花板, 絕活安娜"
                  className="w-full bg-white/80 border border-[#8c7c6c]/20 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#82b7cc] text-[#3e2723] placeholder-[#8c7c6c]/40"
                  required
                />
              </div>

              {/* 配色風格 */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#8c7c6c] uppercase tracking-wider">配色風格</label>
                <select 
                  value={newTagStyle}
                  onChange={(e) => setNewTagStyle(e.target.value as "sage" | "rose" | "blue" | "clay")}
                  className="w-full bg-white/80 border border-[#8c7c6c]/20 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#82b7cc] text-[#3e2723]"
                >
                  <option value="clay">溫潤暖沙 (Clay - 預設)</option>
                  <option value="sage">經典灰綠 (Sage)</option>
                  <option value="rose">乾燥玫瑰 (Rose)</option>
                  <option value="blue">冷冽藍灰 (Blue)</option>
                </select>
              </div>

              {/* 即時預覽 */}
              <div className="pt-2">
                <label className="text-[10px] font-black text-[#8c7c6c] uppercase tracking-wider block mb-2">標籤預覽 (Preview)</label>
                <div className="p-3 bg-white/40 border border-[#8c7c6c]/10 rounded-xl flex items-center justify-center min-h-[48px]">
                  <span className={`px-2.5 py-1 rounded-full text-xs border font-bold ${
                    newTagStyle === "sage" ? "bg-[#8fa8a2]/15 text-[#59756f] border-[#8fa8a2]/30" :
                    newTagStyle === "rose" ? "bg-[#bfa1a1]/15 text-[#8c6c6c] border-[#bfa1a1]/30" :
                    newTagStyle === "blue" ? "bg-[#8ca9b3]/15 text-[#5c7c88] border-[#8ca9b3]/30" :
                    "bg-[#b4a091]/15 text-[#8c6c5c] border-[#b4a091]/30"
                  }`}>
                    {newTagName.trim() || "標籤預覽文字"}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || !newTagName.trim()}
                  className="w-full bg-[#8c7c6c] hover:bg-[#7a6a5b] text-white py-2.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all hover:scale-[1.02] shadow-[0_4px_12px_rgba(140,124,108,0.3)] disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  <span>{loading ? "正在新增標籤..." : "新增特色標籤"}</span>
                </button>
              </div>

            </form>
          </div>

          {/* 右欄：特色標籤列表 */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-5 rounded-2xl border border-[#8c7c6c]/15 bg-white/40 backdrop-blur-md space-y-4 shadow-sm">
              <h3 className="text-xs font-black text-[#8c7c6c] uppercase tracking-widest border-b border-[#8c7c6c]/15 pb-2">
                🗂️ 已有特色標籤清單 ({tags.length} 個標籤)
              </h3>

              <div className="overflow-hidden border border-[#8c7c6c]/15 rounded-xl shadow-sm bg-white/30">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#8c7c6c]/10 text-[#8c7c6c] text-[10px] font-black uppercase tracking-wider border-b border-[#8c7c6c]/15">
                        <th className="px-4 py-3">遊戲項目</th>
                        <th className="px-4 py-3">標籤預覽</th>
                        <th className="px-4 py-3 text-right">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#8c7c6c]/10 text-xs text-[#5d4037]">
                      {tags.length > 0 ? (
                        tags.map((tag) => (
                          <tr key={tag.id} className="hover:bg-[#8c7c6c]/5 transition-colors">
                            <td className="px-4 py-4 font-bold capitalize">{tag.game_id}</td>
                            <td className="px-4 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs border font-bold ${tag.style_class}`}>
                                {tag.tag_name}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-right">
                              <button 
                                onClick={() => handleDeleteTag(tag.id, tag.tag_name)}
                                disabled={loading}
                                className="text-[10px] font-black text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/50 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                              >
                                <Trash2 size={12} className="inline mr-1" />
                                <span>物理刪除</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="px-4 py-12 text-center text-[#8c7c6c]/60">
                            <div className="flex flex-col items-center justify-center gap-3">
                              <AlertCircle className="text-3xl opacity-60 text-[#8c7c6c]/50" />
                              <span className="text-xs font-bold">目前系統內無任何特色標籤資料。</span>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>

        </div>

      </main>

      <footer className="mt-auto py-6 border-t border-[#8c7c6c]/10 text-center text-[10px] font-bold uppercase tracking-widest text-[#8c7c6c]/60">
        Overwatch Social © 2026 Admin Panel • Tags Manager Tool
      </footer>

    </div>
  );
}
