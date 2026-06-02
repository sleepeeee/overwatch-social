"use client";

import { useState, useEffect } from "react";
import { OWPlayerCard } from "@/types/card";
import { MOCK_PLAYERS, HEROES_CONFIG, SERVER_OPTIONS, MIC_OPTIONS } from "@/data/mockPlayers";
import OWCard from "@/components/OWCard";
import LoginModal from "@/components/LoginModal";
import { Button } from "@/components/ui/button";
import { RotateCcw, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getHeroAlignments } from "@/app/actions/alignment";
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

export default function OverwatchSquare({ searchQuery, isPremiumStyle = true }: OverwatchSquareProps) {
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

  useEffect(() => {
    setIsMounted(true);
    const supabase = createClient();

    // 載入英雄對齊微調補償配置
    getHeroAlignments().then((aligns) => {
      if (aligns) {
        setHeroAlignments(aligns);
      }
    });

    // 查詢真實廣場資料
    const loadPlayers = async () => {
      const { data, error } = await supabase
        .from("public_profiles")
        .select("*")
        .eq("is_tag_visible", true)
        .order("updated_at", { ascending: false });

      if (!error && data && data.length > 0) {
        setIsShowingMockData(false);
        setPlayers(data.map(row => ({
          card_id: row.card_id ?? row.user_id,
          user_id: row.user_id,
          server: row.server,
          battle_tag: row.battle_tag,
          is_tag_visible: row.is_tag_visible,
          selected_heroes: row.selected_heroes ?? [],
          tags: row.tags ?? [],
          message: row.message ?? "",
          languages: row.languages ?? [],
          mic_status: row.mic_status as OWPlayerCard["mic_status"],
          social_channels: {},
          mbti: row.mbti ?? undefined,
        })));
      } else {
        setIsShowingMockData(true);
        setPlayers(MOCK_PLAYERS);
      }
    };

    loadPlayers();
  }, []);

  const getHeroRole = (heroId: string) => {
    const hero = HEROES_CONFIG.find(h => h.id === heroId);
    return hero ? hero.role : null;
  };

  const handleResetFilters = () => {
    setSelectedRole("全部");
    setSelectedServer("全部");
    setSelectedMic("全部");
  };

  const filteredPlayers = players.filter((player) => {
    // 🛡️ [Privacy Protection] 如果玩家設定對外隱藏，則直接從廣場消失！
    if (!player.is_tag_visible) {
      return false;
    }

    // 關鍵字搜尋安全容錯
    const matchesQuery = 
      player.battle_tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (player.message || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (player.mbti && player.mbti.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesHeroQuery = (player.selected_heroes || []).some((heroId) => {
      const hero = HEROES_CONFIG.find(h => h.id === heroId);
      return hero && hero.name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const isSearchMatched = matchesQuery || matchesHeroQuery;

    let isRoleMatched = true;
    if (selectedRole !== "全部") {
      const mappedRole = selectedRole === "坦克" ? "tank" : selectedRole === "輸出" ? "damage" : "support";
      isRoleMatched = (player.selected_heroes || []).some(heroId => getHeroRole(heroId) === mappedRole);
    }

    const isServerMatched = selectedServer === "全部" || player.server === selectedServer;
    const isMicMatched = selectedMic === "全部" || player.mic_status === selectedMic;

    return isSearchMatched && isRoleMatched && isServerMatched && isMicMatched;
  });

  const roleRadii: Record<string, string> = {
    "全部": "16px 12px 14px 18px",
    "坦克": "12px 16px 15px 13px",
    "輸出": "15px 13px 16px 12px",
    "支援": "13px 15px 12px 16px"
  };

  if (!isMounted) {
    // 🛡️ [Anti-flicker] 為了防抖，我們在!isMounted時只返回一個高度為 0 的 placeholder，避免 layout jump 與 Loading 轉圈閃現！
    return <div className="min-h-0 h-0 opacity-0" />;
  }

  return (
    <div className="space-y-6 w-full animate-[fadeIn_0.4s_ease-out] relative">
      {/* 🌕 C1 有機圓形 - 廣場右上角（版本A獨有） */}
      <div
        className="ms-c1-organic-circle-yellow pointer-events-none select-none"
        style={{
          position: 'absolute',
          top: '-20px',
          right: '-10px',
          width: '80px',
          height: '80px',
          opacity: 0.28,
          zIndex: 0,
        }}
      />
      {/* ✨ C2 菱形 - 廣場左上角（版本A獨有） */}
      <div
        className="ms-c2-accent-diamond-sand pointer-events-none select-none"
        style={{
          position: 'absolute',
          top: '4px',
          left: '4px',
          width: '24px',
          height: '24px',
          opacity: 0.58,
          zIndex: 1,
        }}
      />
      {/* 示範資料提示條（真實資料出現後自動消失）*/}
      {isShowingMockData && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#d8a070]/30 bg-[#d8a070]/8 text-[11px] font-bold text-[#8c7c6c]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#d8a070] shrink-0 animate-pulse" />
          目前顯示的是示範資料，廣場尚無真實玩家名片。成為第一個建立名片的特工吧！
        </div>
      )}

      {/* 🚀 獨立懸浮篩選絲帶 (Floating Filter Ribbon) */}
      <div className="w-full bg-white/40 backdrop-blur-3xl border-2 border-white/60 rounded-[28px] p-5 md:py-4 md:px-6 shadow-[0_18px_45px_-18px_rgba(140,124,108,0.12),inset_0_1.5px_2px_rgba(255,255,255,0.85)] flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 elite-glass-card">
        
        {/* 🌸 [Aesthetics] 手稿星芒與偏光微光氣泡點綴 */}
        <div className="absolute -top-3 -left-3 pointer-events-none z-20">
          <PencilStar className="w-6 h-6 text-[#82b7cc]/60" />
        </div>
        <div className="absolute -bottom-2.5 -right-2.5 pointer-events-none z-20">
          <PencilStar className="w-5 h-5 text-[#f5d46b]/60 rotate-[15deg]" />
        </div>
        
        {/* 偏光氣泡 (右側邊角) */}
        <div className="glass-bubble-dot w-3 h-3 -top-1.5 right-12 opacity-60" />
        <div className="glass-bubble-dot w-2 h-2 top-8 -right-1 opacity-45" />

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
                className={`px-4 py-2.5 text-[10px] font-extrabold transition-all duration-500 hover:scale-[1.04] hover:-rotate-1 active:scale-[0.98] outline-1 outline-offset-[-3.5px] cursor-pointer flex-1 text-center flex items-center justify-center gap-1 ${
                  selectedRole === role
                    ? "bg-gradient-to-br from-[#82b7cc]/22 to-[#f5d46b]/15 text-[#384d54] border-2 border-[#82b7cc]/45 outline-dashed outline-[#82b7cc]/30 shadow-[0_8px_20px_-8px_rgba(130,183,204,0.3),inset_0_1.5px_2px_rgba(255,255,255,0.9)]"
                    : "bg-white/45 text-[#8c7c6c] border border-[#8c7c6c]/20 outline-dashed outline-[#8c7c6c]/12 hover:bg-white/75"
                }`}
                style={{ borderRadius: roleRadii[role] }}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
          {filteredPlayers.map((player) => (
            <div 
              key={player.card_id} 
              className="w-full flex justify-center hover:-translate-y-1 transition-transform duration-300 relative"
            >
              {/* ⧡ Version B: 六邂形框裝飾（卡片右上，超低opacity） */}
              <div
                className="ms-c3-organic-hexagon-frame-soft pointer-events-none select-none"
                style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  width: '56px',
                  height: '56px',
                  opacity: 0.10,
                  zIndex: 0,
                }}
              />
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
      ) : (
        <div className="ow-glass-panel elite-glass-card py-16 px-4 text-center max-w-xl mx-auto flex flex-col items-center justify-center gap-4">
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
