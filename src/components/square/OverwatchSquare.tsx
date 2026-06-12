"use client";

import { useState, useEffect, useRef } from "react";
import { OWPlayerCard } from "@/types/card";
import { MOCK_PLAYERS, HEROES_CONFIG, SERVER_OPTIONS, MIC_OPTIONS } from "@/data/mockPlayers";
import { normalizeOverwatchServer } from "@/lib/gameCatalog";
import OWCard from "@/components/OWCard";
import LoginModal from "@/components/LoginModal";
import { Button } from "@/components/ui/button";
import { RotateCcw, AlertCircle, Search, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getHeroAlignments } from "@/app/actions/alignment";
import { getPublicProfiles } from "@/app/actions/browse";
import type { AlignmentConfig } from "@/data/heroAlignments";
import { HERO_ALIGNMENTS } from "@/data/heroAlignments";
import { useAuth } from "@/context/AuthContext";

interface OverwatchSquareProps {
  searchQuery?: string;
  isPremiumStyle?: boolean;
}

const PAGE_SIZE = 20;

export default function OverwatchSquare({ searchQuery, isPremiumStyle = true }: OverwatchSquareProps) {
  const { user, authLoading } = useAuth();
  const isLoggedIn = !!user;

  const [players, setPlayers] = useState<OWPlayerCard[]>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("全部");
  const [selectedServer, setSelectedServer] = useState("全部");
  const [selectedMic, setSelectedMic] = useState("全部");
  const [isMounted, setIsMounted] = useState(false);
  const [heroAlignments, setHeroAlignments] = useState<Record<string, AlignmentConfig>>(HERO_ALIGNMENTS);
  const [isShowingMockData, setIsShowingMockData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const requestCounterRef = useRef<number>(0);  // 遞增計數器，比 Date.now() 更可靠
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const effectiveSearchQuery = searchQuery ?? localSearchQuery;

  const toPlayerCard = (row: Record<string, unknown>): OWPlayerCard => ({
    card_id: (row.card_id as string) ?? (row.user_id as string),
    user_id: row.user_id as string,
    server: normalizeOverwatchServer(row.server as string),
    battle_tag: row.battle_tag as string,
    is_tag_visible: row.is_tag_visible as boolean,
    selected_heroes: (row.selected_heroes as string[]) ?? [],
    tags: (row.tags as string[]) ?? [],
    message: (row.message as string) ?? "",
    languages: (row.languages as string[]) ?? [],
    mic_status: row.mic_status as OWPlayerCard["mic_status"],
    social_channels: (row.social_channels as Record<string, string>) ?? {},
    mbti: (row.mbti as string) ?? undefined,
    display_name: (row.display_name as string) ?? undefined,
    game: "overwatch",
  });

  const loadPlayers = async (
    searchQ: string,
    offset: number,
    append = false,
    serverFilter = selectedServer,
    micFilter = selectedMic
  ) => {
    const requestId = ++requestCounterRef.current;

    if (append) setIsLoadingMore(true);

    let data: OWPlayerCard[] | null = null;
    let fetchError = false;

    if (!searchQ.trim()) {
      // 無搜尋：走 Server Action 快取路徑（60s TTL，減少 browser→DB 直連）
      const cached = await getPublicProfiles(
        offset,
        serverFilter !== "全部" ? serverFilter : undefined,
        micFilter !== "全部" ? micFilter : undefined,
        "overwatch"
      );
      data = cached;
    } else {
      // 有搜尋：直接打 Supabase（動態查詢，不適合快取）
      const supabase = createClient();
      let query = supabase
        .from("public_profiles")
        .select("*")
        .order("updated_at", { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1)
        .or(`battle_tag.ilike.%${searchQ}%,message.ilike.%${searchQ}%,mbti.ilike.%${searchQ}%`);

      if (serverFilter !== "全部") query = query.eq("server", normalizeOverwatchServer(serverFilter));
      if (micFilter !== "全部")   query = query.eq("mic_status", micFilter);

      const { data: rawData, error } = await query;
      fetchError = !!error;
      data = rawData ? rawData.map(toPlayerCard) : null;
    }

    if (requestCounterRef.current !== requestId) return; // 丟棄過期請求結果

    if (append) setIsLoadingMore(false);

    if (!fetchError && data && data.length > 0) {
      setIsShowingMockData(false);
      setPlayers(prev => append ? [...prev, ...data!] : data!);
      setHasMore(data.length === PAGE_SIZE);
    } else if (!append) {
      setIsShowingMockData(true);
      setPlayers(MOCK_PLAYERS);
      setHasMore(false);
    } else {
      setHasMore(false);
    }

    if (!append) setIsLoading(false);
  };

  useEffect(() => {
    setIsMounted(true);
    getHeroAlignments().then((aligns) => {
      if (aligns) setHeroAlignments(aligns);
    });
    loadPlayers("", 0);
  }, []);

  // 搜尋條件變化時 debounce 觸發 server-side 搜尋
  useEffect(() => {
    if (!isMounted) return;
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      loadPlayers(effectiveSearchQuery, 0, false, selectedServer, selectedMic);
    }, 300);
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [effectiveSearchQuery, isMounted]); // eslint-disable-line react-hooks/exhaustive-deps

  // server / mic 篩選變化時重新從 DB 拉取（offset 重設為 0）
  useEffect(() => {
    if (!isMounted) return;
    loadPlayers(effectiveSearchQuery, 0, false, selectedServer, selectedMic);
  }, [selectedServer, selectedMic, isMounted]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLoadMore = () => {
    loadPlayers(effectiveSearchQuery, players.length, true, selectedServer, selectedMic);
  };

  const getHeroRole = (heroId: string) => {
    const hero = HEROES_CONFIG.find(h => h.id === heroId);
    return hero ? hero.role : null;
  };

  const handleResetFilters = () => {
    setSelectedRole("全部");
    setSelectedServer("全部");
    setSelectedMic("全部");
    setLocalSearchQuery("");
  };

  // client-side 過濾（role/server/mic + 英雄名稱搜尋，對已載入的資料）
  const filteredPlayers = players.filter((player) => {
    if (!player.is_tag_visible) return false;

    // 英雄名稱搜尋（client-side，需 HEROES_CONFIG lookup）
    if (effectiveSearchQuery.trim()) {
      const matchesHeroQuery = (player.selected_heroes || []).some((heroId) => {
        const hero = HEROES_CONFIG.find(h => h.id === heroId);
        return hero && hero.name.toLowerCase().includes(effectiveSearchQuery.toLowerCase());
      });
      // DB 已做 battle_tag/message/mbti 過濾，這裡只補英雄名稱
      // 不重複過濾 text fields（由 DB 決定）
      if (isShowingMockData && !matchesHeroQuery) {
        // Mock 模式下做完整 client-side 過濾
        const matchesText =
          player.battle_tag.toLowerCase().includes(effectiveSearchQuery.toLowerCase()) ||
          (player.message || "").toLowerCase().includes(effectiveSearchQuery.toLowerCase()) ||
          (player.mbti || "").toLowerCase().includes(effectiveSearchQuery.toLowerCase());
        if (!matchesText && !matchesHeroQuery) return false;
      }
    }

    let isRoleMatched = true;
    if (selectedRole !== "全部") {
      const mappedRole = selectedRole === "坦克" ? "tank" : selectedRole === "輸出" ? "damage" : "support";
      isRoleMatched = (player.selected_heroes || []).some(heroId => getHeroRole(heroId) === mappedRole);
    }

    // server / mic_status 已由 DB WHERE clause 過濾（browse-db-filter change）
    return isRoleMatched;
  });



  if (!isMounted) {
    // 🛡️ [Anti-flicker] 為了防抖，我們在!isMounted時只返回一個高度為 0 的 placeholder，避免 layout jump 與 Loading 轉圈閃現！
    return <div className="min-h-0 h-0 opacity-0" />;
  }

  return (
    <div className="space-y-6 w-full animate-[fadeIn_0.4s_ease-out] relative pb-8">
      {/* 示範資料提示條（真實資料出現後自動消失）*/}
      {isShowingMockData && (
        <div className="glass-card flex items-center gap-2 px-4 py-2.5 rounded-xl border border-auroraMint/20 bg-auroraMint/5 text-[11px] font-bold text-zinc-300 relative z-10">
          <span className="w-1.5 h-1.5 rounded-full bg-auroraMint shrink-0 animate-pulse" />
          目前顯示的是示範資料，廣場尚無真實玩家名片。成為第一個建立名片的特工吧！
        </div>
      )}

      <div className="glass-card w-full p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5 relative z-10 rounded-xl border border-white/[0.06]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <p className="text-[10px] text-zinc-400 uppercase tracking-[0.18em] font-mono font-medium">
            調整探索頻率 // Overwatch Search & Filter
          </p>
          <span className="text-[9px] text-auroraMint lowercase font-mono tracking-[0.12em]">({filteredPlayers.length} active)</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_0.9fr_1.45fr_0.9fr] gap-3 sm:gap-4 items-end">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-medium uppercase tracking-[0.16em] text-zinc-400">搜尋名片</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
              <input
                type="text"
                placeholder="搜尋名稱、常用角色、深夜標籤..."
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                className="h-11 w-full rounded-lg border border-white/[0.08] bg-black/40 pl-9 pr-9 text-xs text-zinc-200 placeholder-zinc-500 transition-all duration-300 focus:border-auroraMint/50 focus:outline-none"
              />
              {localSearchQuery && (
                <button
                  onClick={() => setLocalSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 transition-colors hover:text-zinc-200"
                  title="清空搜尋"
                >
                  x
                </button>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-medium uppercase tracking-[0.16em] text-zinc-400">遊玩伺服器</label>
            <div className="relative">
              <select
                className="h-11 w-full appearance-none rounded-lg border border-white/[0.08] bg-black/40 pl-3 pr-10 text-xs font-semibold text-zinc-200 transition-all duration-300 focus:border-auroraMint/50 focus:outline-none"
                value={selectedServer}
                onChange={(e) => setSelectedServer(e.target.value)}
              >
                <option value="全部">全部伺服器</option>
                {SERVER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-medium uppercase tracking-[0.16em] text-zinc-400">
              <span>常用定位</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {["全部", "坦克", "輸出", "支援"].map((role) => {
                const isSelected = selectedRole === role;
                return (
                  <button
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className={`h-11 rounded-lg border px-2 text-[10px] font-semibold tracking-[0.04em] transition-all duration-300 active:scale-[0.96] outline-none cursor-pointer text-center flex items-center justify-center gap-1 ${
                      isSelected
                        ? "border-auroraMint/70 bg-auroraMint/15 text-white shadow-[0_0_18px_rgba(192,132,252,0.38)]"
                        : "border-white/[0.08] bg-black/30 text-zinc-400 hover:border-white/15 hover:bg-white/[0.04] hover:text-zinc-200"
                    }`}
                  >
                    <span>{role === "坦克" ? "🛡️" : role === "輸出" ? "⚔️" : role === "支援" ? "✚" : ""}</span>
                    <span>{role}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-medium uppercase tracking-[0.16em] text-zinc-400">語音溝通習慣</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <select
                  className="h-11 w-full appearance-none rounded-lg border border-white/[0.08] bg-black/40 pl-3 pr-10 text-xs font-semibold text-zinc-200 transition-all duration-300 focus:border-auroraMint/50 focus:outline-none"
                  value={selectedMic}
                  onChange={(e) => setSelectedMic(e.target.value)}
                >
                  <option value="全部">全部語音狀態</option>
                  {MIC_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
              </div>
              {(selectedRole !== "全部" || selectedServer !== "全部" || selectedMic !== "全部" || localSearchQuery) && (
                <button
                  onClick={handleResetFilters}
                  className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/[0.08] bg-black/30 text-zinc-400 transition-all hover:border-auroraMint/40 hover:bg-auroraMint/10 hover:text-white shrink-0 cursor-pointer"
                  title="重置篩選"
                >
                  <RotateCcw size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#8c7c6c]">
          <div className="w-8 h-8 rounded-full border-2 border-[#8c7c6c]/25 border-t-[#8c7c6c] animate-spin" />
          <span className="text-xs font-bold tracking-widest">正在載入展示館⋯</span>
        </div>
      ) : filteredPlayers.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
            {filteredPlayers.map((player) => (
              <div
                key={player.card_id}
                className="midnight-player-artifact w-full flex justify-center transition-transform duration-300 relative"
              >
                <OWCard
                  cardData={player}
                  isLoggedIn={isLoggedIn}
                  isEditable={false}
                  customAlignments={heroAlignments}
                  onLoginRequired={(!authLoading && !isLoggedIn) ? () => setShowLoginModal(true) : undefined}
                />
              </div>
            ))}
          </div>
          {/* Load More 按鈕 */}
          {hasMore && !isShowingMockData && (
            <div className="flex justify-center pt-4">
              <Button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="border border-auroraMint/20 bg-auroraMint/10 hover:bg-auroraMint/20 text-zinc-100 font-bold text-xs px-8 py-4 rounded-xl transition-all active:scale-95 disabled:opacity-50"
              >
                {isLoadingMore ? "載入中..." : "載入更多特工"}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="glass-card border border-white/[0.06] rounded-2xl py-16 px-4 text-center max-w-xl mx-auto mb-24 flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full bg-auroraMint/8 flex items-center justify-center text-auroraMint border border-auroraMint/20 shadow-[0_0_18px_rgba(192,132,252,0.2)]">
            <AlertCircle size={28} />
          </div>
          <div className="space-y-1">
            <h3 className="text-zinc-100 font-extrabold text-lg">沒有找到符合條件的名片</h3>
            <p className="text-zinc-400 text-xs max-w-sm mx-auto">
              試著調整您的篩選選項，或在右側重置所有條件，以瀏覽廣場上更多的鬥陣特工名片！
            </p>
          </div>
          <Button
            onClick={handleResetFilters}
            className="bg-auroraMint/20 hover:bg-auroraMint/30 text-white border border-auroraMint/30 font-extrabold text-xs px-6 py-4 mt-2 rounded-xl shadow-[0_0_18px_rgba(192,132,252,0.2)] transition-all active:scale-95"
          >
            重置所有篩選
          </Button>
        </div>
      )}

      {/* 未登入互動 → 登入 Modal */}
      <LoginModal
        show={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
}
