"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { OWPlayerCard } from "@/types/card";
import { MOCK_PLAYERS, HEROES_CONFIG, SERVER_OPTIONS, MIC_OPTIONS } from "@/data/mockPlayers";
import OWCard from "@/components/OWCard";
import LoginModal from "@/components/LoginModal";
import { Button } from "@/components/ui/button";
import { RotateCcw, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getHeroAlignments } from "@/app/actions/alignment";
import { getPublicProfiles } from "@/app/actions/browse";
import type { AlignmentConfig } from "@/data/heroAlignments";
import { HERO_ALIGNMENTS } from "@/data/heroAlignments";
import { useAuth } from "@/context/AuthContext";

interface OverwatchSquareProps {
  searchQuery: string;
  isPremiumStyle?: boolean;
}

// 🌸 [Aesthetics] 手寫四角星芒裝飾 SVG 組件
function PencilStar({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      className={`${className} text-[#8c7c6c]/45 animate-pulse`} 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.2"
      style={{ animationDuration: "3.5s" }}
    >
      <path d="M12 2 C12 10 14 12 22 12 C14 12 12 14 12 22 C12 14 10 12 2 12 C10 12 12 10 12 2 Z" strokeLinecap="round" />
    </svg>
  );
}

// 🌸 [Aesthetics] SVG Doodles 手繪裝飾線
function DoodleLine({ className = "w-10 h-1.5" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 80 8" 
      className={`${className} text-[#f5d46b]/80 fill-none stroke-current`} 
      strokeWidth="1.6" 
      strokeLinecap="round" 
      pointerEvents="none"
    >
      <path d="M 2,4 C 25,1 55,7 78,3" />
    </svg>
  );
}

const PAGE_SIZE = 20;

export default function OverwatchSquare({ searchQuery, isPremiumStyle = true }: OverwatchSquareProps) {
  const router = useRouter();
  const { user, authLoading } = useAuth();
  const isLoggedIn = !!user;

  const [players, setPlayers] = useState<OWPlayerCard[]>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState("全部");
  const [selectedServer, setSelectedServer] = useState("全部");
  const [selectedMic, setSelectedMic] = useState("全部");
  const [isMounted, setIsMounted] = useState(false);
  const [heroAlignments, setHeroAlignments] = useState<Record<string, AlignmentConfig>>(HERO_ALIGNMENTS);
  const [isShowingMockData, setIsShowingMockData] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const requestCounterRef = useRef<number>(0);  // 遞增計數器，比 Date.now() 更可靠
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toPlayerCard = (row: Record<string, unknown>): OWPlayerCard => ({
    card_id: (row.card_id as string) ?? (row.user_id as string),
    user_id: row.user_id as string,
    server: row.server as string,
    battle_tag: row.battle_tag as string,
    is_tag_visible: row.is_tag_visible as boolean,
    selected_heroes: (row.selected_heroes as string[]) ?? [],
    tags: (row.tags as string[]) ?? [],
    message: (row.message as string) ?? "",
    languages: (row.languages as string[]) ?? [],
    mic_status: row.mic_status as OWPlayerCard["mic_status"],
    social_channels: (row.social_channels as Record<string, string>) ?? {},
    mbti: (row.mbti as string) ?? undefined,
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
        micFilter !== "全部" ? micFilter : undefined
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

      if (serverFilter !== "全部") query = query.eq("server", serverFilter);
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
  };

  useEffect(() => {
    setIsMounted(true);
    getHeroAlignments().then((aligns) => {
      if (aligns) setHeroAlignments(aligns);
    });
    loadPlayers("", 0);
  }, []);

  // searchQuery 變化時 debounce 觸發 server-side 搜尋
  useEffect(() => {
    if (!isMounted) return;
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      loadPlayers(searchQuery, 0, false, selectedServer, selectedMic);
    }, 300);
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  // server / mic 篩選變化時重新從 DB 拉取（offset 重設為 0）
  useEffect(() => {
    if (!isMounted) return;
    loadPlayers(searchQuery, 0, false, selectedServer, selectedMic);
  }, [selectedServer, selectedMic]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLoadMore = () => {
    loadPlayers(searchQuery, players.length, true, selectedServer, selectedMic);
  };

  const getHeroRole = (heroId: string) => {
    const hero = HEROES_CONFIG.find(h => h.id === heroId);
    return hero ? hero.role : null;
  };

  const handleResetFilters = () => {
    setSelectedRole("全部");
    setSelectedServer("全部");
    setSelectedMic("全部");
  };

  // client-side 過濾（role/server/mic + 英雄名稱搜尋，對已載入的資料）
  const filteredPlayers = players.filter((player) => {
    if (!player.is_tag_visible) return false;

    // 英雄名稱搜尋（client-side，需 HEROES_CONFIG lookup）
    if (searchQuery.trim()) {
      const matchesHeroQuery = (player.selected_heroes || []).some((heroId) => {
        const hero = HEROES_CONFIG.find(h => h.id === heroId);
        return hero && hero.name.toLowerCase().includes(searchQuery.toLowerCase());
      });
      // DB 已做 battle_tag/message/mbti 過濾，這裡只補英雄名稱
      // 不重複過濾 text fields（由 DB 決定）
      if (isShowingMockData && !matchesHeroQuery) {
        // Mock 模式下做完整 client-side 過濾
        const matchesText =
          player.battle_tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (player.message || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (player.mbti || "").toLowerCase().includes(searchQuery.toLowerCase());
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
    <div className="space-y-6 w-full animate-[fadeIn_0.4s_ease-out] relative pb-36">
      {/* 示範資料提示條（真實資料出現後自動消失）*/}
      {isShowingMockData && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#d8a070]/30 bg-[#d8a070]/8 text-[11px] font-bold text-[#8c7c6c] relative z-10">
          <span className="w-1.5 h-1.5 rounded-full bg-[#d8a070] shrink-0 animate-pulse" />
          目前顯示的是示範資料，廣場尚無真實玩家名片。成為第一個建立名片的特工吧！
        </div>
      )}

      {/* 🚀 獨立懸浮篩選紙帶 (Floating Cloud Filter Ribbon) */}
      <div className="w-full p-5 md:py-4 md:px-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 cloud-paper-panel">
        
        {/* 🌸 [Aesthetics] 手稿星芒 */}
        <div className="absolute -top-3 -left-3 pointer-events-none z-20">
          <PencilStar className="w-6 h-6 text-[#82b7cc]/60" />
        </div>
        <div className="absolute -bottom-2.5 -right-2.5 pointer-events-none z-20">
          <PencilStar className="w-5 h-5 text-[#f5d46b]/60 rotate-[15deg]" />
        </div>

        {/* 左翼：遊玩伺服器 */}
        <div className="space-y-1.5 w-full md:w-[22%]">
          <label className="text-[10px] font-black uppercase tracking-widest text-[#8c7c6c]/80 flex justify-between">
            <span>遊玩伺服器</span>
            <span className="text-[9px] text-[#82b7cc] lowercase">({filteredPlayers.length} active)</span>
          </label>
          <select
            className="w-full bg-white/60 border border-[#8c7c6c]/18 rounded-2xl py-2.5 px-3 text-xs focus:border-[#82b7cc] text-[#5d4037] font-semibold shadow-[0_10px_24px_-20px_rgba(140,124,108,0.22)] focus-visible:outline-none"
            value={selectedServer}
            onChange={(e) => setSelectedServer(e.target.value)}
          >
            <option value="全部">全部伺服器</option>
            {SERVER_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* 中腹：常用定位黏土按鈕 */}
        <div className="space-y-1.5 w-full md:w-[48%] flex flex-col items-center">
          <label className="text-[10px] font-black uppercase tracking-widest text-[#8c7c6c]/80 w-full text-center md:text-left md:pl-2 relative flex items-center justify-center md:justify-start gap-1">
            <span>常用定位</span>
            <DoodleLine className="w-10 h-1.5 opacity-60 inline-block align-middle ml-1" />
          </label>
          <div className="flex gap-2 w-full justify-center">
            {["全部", "坦克", "輸出", "支援"].map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`px-4 py-2.5 text-[10px] font-extrabold transition-all duration-500 hover:scale-[1.03] active:scale-[0.98] outline-1 outline-offset-[-3.5px] cursor-pointer flex-1 text-center flex items-center justify-center gap-1 rounded-xl ${
                  selectedRole === role
                    ? "bg-[#82b7cc]/15 text-[#384d54] border border-[#82b7cc]/40 shadow-[inset_0_1px_2.5px_rgba(130,183,204,0.1),0_4px_12px_rgba(130,183,204,0.04)]"
                    : "bg-white/50 text-[#8c7c6c] border border-[#8c7c6c]/18 hover:bg-white/80"
                }`}
              >
                <span>{role === "坦克" ? "🛡️" : role === "輸出" ? "⚔️" : role === "支援" ? "➕" : ""}</span>
                <span>{role}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 右翼：語音溝通習慣 + 重置按鈕 */}
        <div className="space-y-1.5 w-full md:w-[30%]">
          <label className="text-[10px] font-black uppercase tracking-widest text-[#8c7c6c]/80">語音溝通習慣</label>
          <div className="flex gap-2">
            <select
              className="w-full bg-white/60 border border-[#8c7c6c]/18 rounded-2xl py-2.5 px-3 text-xs focus:border-[#82b7cc] text-[#5d4037] font-semibold shadow-[0_10px_24px_-20px_rgba(140,124,108,0.22)] focus-visible:outline-none"
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

            {(selectedRole !== "全部" || selectedServer !== "全部" || selectedMic !== "全部") && (
              <button
                onClick={handleResetFilters}
                className="flex items-center justify-center p-2.5 bg-white/60 border border-[#8c7c6c]/18 hover:bg-white/80 rounded-2xl text-xs font-bold text-[#8c7c6c] transition-colors shrink-0 cursor-pointer shadow-[0_10px_24px_-20px_rgba(140,124,108,0.22)]"
                title="重置篩選"
              >
                <RotateCcw size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {filteredPlayers.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
            {filteredPlayers.map((player) => (
              <div
                key={player.card_id}
                className="w-full flex justify-center hover:-translate-y-1 transition-transform duration-300 relative cursor-pointer"
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest('[data-no-navigate]')) return;
                  router.push(`/player/${player.user_id}`);
                }}
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
                className="bg-white/60 hover:bg-white border border-[#8c7c6c]/20 text-[#5d4037] font-extrabold text-xs px-8 py-4 rounded-2xl shadow-sm transition-all active:scale-95 disabled:opacity-50"
              >
                {isLoadingMore ? "載入中..." : "載入更多特工"}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="bg-[#fefcf8] border border-[#8c7c6c]/15 rounded-[28px] py-16 px-4 text-center max-w-xl mx-auto flex flex-col items-center justify-center gap-4 shadow-[0_20px_50px_rgba(140,124,108,0.04)]">
          <div className="w-16 h-16 rounded-full bg-white/60 flex items-center justify-center text-[#82b7cc] border border-[#8c7c6c]/15 shadow-sm">
            <AlertCircle size={28} />
          </div>
          <div className="space-y-1">
            <h3 className="text-[#3e2723] font-extrabold text-lg">沒有找到符合條件的名片</h3>
            <p className="text-[#8c7c6c] text-xs max-w-sm mx-auto">
              試著調整您的篩選選項，或在右側重置所有條件，以瀏覽廣場上更多的鬥陣特工特工！
            </p>
          </div>
          <Button
            onClick={handleResetFilters}
            className="bg-[#82b7cc] hover:bg-[#82b7cc]/90 text-white font-extrabold text-xs px-6 py-4.5 mt-2 rounded-xl shadow-md transition-all active:scale-95"
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
