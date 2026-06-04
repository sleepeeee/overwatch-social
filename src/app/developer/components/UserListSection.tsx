"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getAdminUserList, AdminUserListItem } from "@/app/actions/userProfile";
import UserCardDetail from "./UserCardDetail";
import { Search, ChevronDown, ChevronUp, Loader2, AlertCircle } from "lucide-react";

const GAME_LABELS: Record<string, { label: string; color: string }> = {
  overwatch: { label: "OW", color: "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300" },
  lol: { label: "LoL", color: "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300" },
  valorant: { label: "Val", color: "bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300" },
};

export default function UserListSection() {
  const [users, setUsers] = useState<AdminUserListItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchUsers = useCallback(async (query?: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await getAdminUserList({ query: query ?? "" });
      if (res.success && res.data) {
        setUsers(res.data);
      } else {
        setError(res.error ?? "載入失敗");
      }
    } catch {
      setError("網路或認證錯誤，請重新整理頁面");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchUsers(value || undefined);
    }, 500);
  };

  const toggleExpand = (userId: string) => {
    setExpandedUsers(prev => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* 搜尋框 */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="搜尋暱稱（ilike 模糊搜尋）..."
          value={search}
          onChange={e => handleSearch(e.target.value)}
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[var(--theme-primary)] transition-all"
        />
      </div>

      {/* 狀態：載入中 */}
      {loading && (
        <div className="flex items-center justify-center py-12 gap-3 text-slate-400">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm font-bold">載入用戶列表...</span>
        </div>
      )}

      {/* 狀態：錯誤 */}
      {error && !loading && (
        <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/8 text-rose-500 text-xs font-semibold flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* 用戶列表 */}
      {users && !loading && (
        <div className="bg-white dark:bg-[#202428] rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-sm overflow-hidden">
          {users.length === 0 ? (
            <div className="px-6 py-12 text-center text-slate-400 italic text-xs">
              {search ? `找不到暱稱包含「${search}」的用戶` : "尚無用戶資料"}
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {users.map(user => {
                const isExpanded = expandedUsers.has(user.user_id);
                const displayName = user.nickname ?? null;
                const idShort = user.user_id.slice(0, 8);

                return (
                  <div key={user.user_id}>
                    {/* 第一層：用戶 row */}
                    <div className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/60 dark:hover:bg-slate-900/20 transition-colors">
                      {/* 暱稱 + ID */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {displayName ? (
                            <span className="text-sm font-black text-slate-800 dark:text-slate-100 truncate">
                              {displayName}
                            </span>
                          ) : (
                            <span className="text-xs font-semibold text-slate-400 italic">
                              未設定暱稱
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 select-all">
                          {user.user_id}
                        </span>
                      </div>

                      {/* 遊戲 badges */}
                      <div className="flex gap-1.5 shrink-0">
                        {user.games.length === 0 ? (
                          <span className="text-[10px] text-slate-400 italic">無名片</span>
                        ) : (
                          user.games.map(game => {
                            const g = GAME_LABELS[game];
                            return g ? (
                              <span key={game} className={`text-[10px] font-black px-2 py-0.5 rounded ${g.color}`}>
                                {g.label}
                              </span>
                            ) : (
                              <span key={game} className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                                {game}
                              </span>
                            );
                          })
                        )}
                      </div>

                      {/* 展開按鈕 */}
                      <button
                        onClick={() => toggleExpand(user.user_id)}
                        className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
                      >
                        {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        <span>{isExpanded ? "收合" : "展開"}</span>
                      </button>
                    </div>

                    {/* 第二層：角色卡詳情（lazy load） */}
                    {isExpanded && (
                      <div className="border-t border-slate-100 dark:border-slate-800/50">
                        <UserCardDetail userId={user.user_id} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 font-bold">
            {search
              ? `搜尋「${search}」：${users.length} 筆結果（最多顯示 50 筆）`
              : `顯示 ${users.length} 位用戶（最多 50 筆）`}
          </div>
        </div>
      )}
    </div>
  );
}
