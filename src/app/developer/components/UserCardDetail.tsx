"use client";

import { useState, useEffect } from "react";
import { getAdminUserCards, AdminUserCard } from "@/app/actions/userProfile";
import { setCardHidden } from "@/app/actions/developer";
import { Loader2, AlertCircle, EyeOff, Eye } from "lucide-react";

const GAME_LABELS: Record<string, string> = {
  overwatch: "🥞 鬥陣特攻",
  lol: "⚔️ 英雄聯盟",
  valorant: "🎯 特戰英豪",
};

const MIC_LABELS: Record<string, string> = {
  "mic-on": "🎤 開啟",
  "listen-only": "👂 收聽",
  "mic-off": "🔇 關閉",
};

const taipeiFormatter = new Intl.DateTimeFormat("zh-TW", {
  timeZone: "Asia/Taipei",
  year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit",
});

interface UserCardDetailProps {
  userId: string;
}

export default function UserCardDetail({ userId }: UserCardDetailProps) {
  const [cards, setCards] = useState<AdminUserCard[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  const handleToggleHidden = async (card: AdminUserCard) => {
    setTogglingId(card.id);
    setActionError("");
    try {
      const res = await setCardHidden(card.id, !card.is_hidden);
      if (res.success) {
        setCards(prev =>
          prev?.map(c => (c.id === card.id ? { ...c, is_hidden: !card.is_hidden } : c)) ?? null
        );
      } else {
        setActionError(res.error ?? "操作失敗");
      }
    } catch {
      setActionError("網路或認證錯誤，請重新整理頁面");
    } finally {
      setTogglingId(null);
    }
  };

  useEffect(() => {
    getAdminUserCards(userId).then(res => {
      if (res.success && res.data) {
        setCards(res.data);
      } else {
        setError(res.error ?? "載入失敗");
      }
      setLoading(false);
    });
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4 px-6 text-slate-400 text-xs">
        <Loader2 size={14} className="animate-spin" />
        <span>載入角色卡詳情...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 py-4 px-6 text-rose-500 text-xs">
        <AlertCircle size={14} />
        <span>{error}</span>
      </div>
    );
  }

  if (!cards || cards.length === 0) {
    return (
      <div className="py-4 px-6 text-slate-400 text-xs italic">
        此用戶尚未建立任何角色卡。
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
      {actionError && (
        <div className="flex items-center gap-2 py-2.5 px-6 text-rose-500 text-xs bg-rose-50/60 dark:bg-rose-950/20">
          <AlertCircle size={14} />
          <span>{actionError}</span>
        </div>
      )}
      {cards.map(card => (
        <div key={card.id} className="px-6 py-4 bg-slate-50/40 dark:bg-slate-900/20">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-black text-slate-700 dark:text-slate-200">
              {GAME_LABELS[card.game] ?? card.game}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              更新：{taipeiFormatter.format(new Date(card.updated_at))}
            </span>
            {card.is_hidden && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <EyeOff size={10} />
                已下架
              </span>
            )}
            {card.is_draft && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                草稿（未儲存過）
              </span>
            )}
            <button
              onClick={() => handleToggleHidden(card)}
              disabled={togglingId === card.id}
              className={`ml-auto flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                card.is_hidden
                  ? "border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                  : "border-rose-300 dark:border-rose-800 text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              }`}
            >
              {togglingId === card.id ? (
                <Loader2 size={10} className="animate-spin" />
              ) : card.is_hidden ? (
                <Eye size={10} />
              ) : (
                <EyeOff size={10} />
              )}
              <span>{card.is_hidden ? "恢復上架" : "下架名片"}</span>
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase mb-0.5">BattleTag</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {card.is_tag_visible ? card.battle_tag : <span className="italic text-slate-400">隱藏</span>}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase mb-0.5">伺服器</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">{card.server}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase mb-0.5">語音</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {MIC_LABELS[card.mic_status] ?? card.mic_status}
              </span>
            </div>
            <div className="min-w-0">
              <span className="text-slate-400 font-bold block text-[10px] uppercase mb-0.5">顯示名稱</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200 block truncate" title={card.display_name ?? undefined}>
                {card.display_name ?? <span className="italic text-slate-400">未設定</span>}
              </span>
            </div>
            {card.selected_heroes.length > 0 && (
              <div className="col-span-2">
                <span className="text-slate-400 font-bold block text-[10px] uppercase mb-0.5">英雄</span>
                <div className="flex gap-1.5 flex-wrap">
                  {card.selected_heroes.map(h => (
                    <span key={h} className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold">
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {card.tags.length > 0 && (
              <div className="col-span-2">
                <span className="text-slate-400 font-bold block text-[10px] uppercase mb-0.5">標籤</span>
                <div className="flex gap-1.5 flex-wrap">
                  {card.tags.map(t => (
                    <span key={t} className="px-1.5 py-0.5 rounded bg-[var(--theme-primary-light,#eef)] text-[var(--theme-primary-text,#556)] text-[10px] font-bold border border-[var(--theme-primary,#aaa)]/20 whitespace-nowrap max-w-full">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {card.message && (
              <div className="col-span-4">
                <span className="text-slate-400 font-bold block text-[10px] uppercase mb-0.5">留言</span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed break-words">{card.message}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
