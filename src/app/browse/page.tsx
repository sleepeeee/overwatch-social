"use client";

import { useState, useEffect } from "react";
import { OWPlayerCard } from "@/types/card";
import { MOCK_PLAYERS, HEROES_CONFIG, SERVER_OPTIONS, MIC_OPTIONS } from "@/data/mockPlayers";
import OWCard from "@/components/OWCard";
import LoginModal from "@/components/LoginModal";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RotateCcw, Users, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getHeroAlignments } from "@/app/actions/alignment";
import type { AlignmentConfig } from "@/data/heroAlignments";
import { HERO_ALIGNMENTS } from "@/data/heroAlignments";

export default function BrowsePage() {
  const [players, setPlayers] = useState<OWPlayerCard[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [heroAlignments, setHeroAlignments] = useState<Record<string, AlignmentConfig>>(HERO_ALIGNMENTS);
  const [selectedRole, setSelectedRole] = useState("全部");
  const [selectedServer, setSelectedServer] = useState("全部");
  const [selectedMic, setSelectedMic] = useState("全部");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const supabase = createClient();

    // 查詢真實廣場資料（DB 層已遮蔽，前端無需額外處理）
    const loadPlayers = async () => {
      const { data, error } = await supabase
        .from("public_profiles")
        .select("*")
        .order("updated_at", { ascending: false });

      if (!error && data && data.length > 0) {
        // 將 DB row 轉為 OWPlayerCard 格式
        setPlayers(data.map(row => ({
          id: row.user_id,
          server: row.server,
          battle_tag: row.battle_tag, // DB view 已遮蔽
          is_tag_visible: row.is_tag_visible,
          selected_heroes: row.selected_heroes ?? [],
          tags: row.tags ?? [],
          message: row.message ?? "",
          languages: row.languages ?? [],
          mic_status: row.mic_status as OWPlayerCard["mic_status"],
          social_channels: {}, // public_profiles 不含 social_channels
          mbti: row.mbti ?? undefined,
        })));
      } else {
        // 冷啟動 fallback：DB 無資料時顯示 Mock
        setPlayers(MOCK_PLAYERS);
      }
    };

    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(!!data.user);
      setAuthLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
      setAuthLoading(false);
    });

    // 從 DB 載入英雄對準參數（fallback 到靜態資料）
    getHeroAlignments().then(setHeroAlignments);

    loadPlayers();
    return () => listener.subscription.unsubscribe();
  }, []);

  const getHeroRole = (heroId: string) => {
    const hero = HEROES_CONFIG.find(h => h.id === heroId);
    return hero ? hero.role : null;
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedRole("全部");
    setSelectedServer("全部");
    setSelectedMic("全部");
  };

  const filteredPlayers = players.filter((player) => {
    // 🛡️ [Privacy Protection] 如果玩家設定對外隱藏 (is_tag_visible === false)，則直接從廣場河道完全消失！
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

  // 🛡️ [Mitigation] 客戶端掛載前渲染骨架屏以杜絕水合錯誤與 Flash of Unstyled Content
  if (!isMounted) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[600px] gap-4">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 text-sm font-bold animate-pulse">正在與鬥陣特工廣場資料水合中...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 保持原先的精美 UI 佈局 */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#3e2723] flex items-center justify-center md:justify-start gap-2">
            <Users className="text-[#82b7cc]" /> 名片交友廣場
          </h1>
          <p className="text-[#8c7c6c] mt-1 font-semibold">
            在這裡與其他特工異世相逢！點擊 BattleTag 旁複製直接加好友，點擊社群 icon 複製聯絡管道。
          </p>
        </div>

        {/* Debug toggle 已移除：此按鈕讓任何人都能繞過 BattleTag 保護 */}
      </div>

      {/* 搜尋與篩選器面板 */}
      <div className="ow-glass-panel p-6 mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-grow w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8c7c6c]/70" size={18} />
            <Input
              type="text"
              placeholder="搜尋玩家 BattleTag、常用英雄 (如閃光)、留言關鍵字或 MBTI..."
              className="pl-10 bg-white/60 border-[#8c7c6c]/20 focus:border-[#82b7cc] focus:ring-1 focus:ring-[#82b7cc]/30 text-[#5d4037] text-sm rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 shrink-0 w-full md:w-auto justify-end">
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white/60 border border-[#8c7c6c]/20 hover:bg-[#8c7c6c]/5 rounded-xl text-xs font-bold text-[#8c7c6c] transition-colors"
              title="重置所有篩選"
            >
              <RotateCcw size={14} />
              <span>重置篩選</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-[#8c7c6c]/10 pt-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#8c7c6c]/80">遊玩伺服器</label>
            <select
              className="w-full bg-white/60 border border-[#8c7c6c]/20 rounded-xl py-2 px-3 text-xs focus:border-[#82b7cc] text-[#5d4037] font-semibold"
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

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#8c7c6c]/80">常用定位</label>
            <div className="grid grid-cols-4 gap-1">
              {["全部", "坦克", "輸出", "支援"].map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`text-[10px] font-extrabold py-2 rounded-xl transition-all border ${
                    selectedRole === role
                      ? "bg-[#82b7cc] border-[#82b7cc] text-white shadow-sm"
                      : "bg-white/60 border-[#8c7c6c]/18 text-[#8c7c6c] hover:bg-[#8c7c6c]/5"
                  }`}
                >
                  {role === "坦克" ? "🛡️" : role === "輸出" ? "⚔️" : role === "支援" ? "➕" : ""} {role}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#8c7c6c]/80">語音溝通習慣</label>
            <select
              className="w-full bg-white/60 border border-[#8c7c6c]/20 rounded-xl py-2 px-3 text-xs focus:border-[#82b7cc] text-[#5d4037] font-semibold"
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
          </div>
        </div>
      </div>

      <div className="mb-6 flex justify-between items-center text-xs font-semibold text-[#8c7c6c] px-1">
        <span>共有 {filteredPlayers.length} 位玩家的精美名片符合條件</span>
        {searchQuery || selectedRole !== "全部" || selectedServer !== "全部" || selectedMic !== "全部" ? (
          <span className="text-[#82b7cc] font-black">已啟用條件篩選</span>
        ) : null}
      </div>

      {filteredPlayers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
          {filteredPlayers.map((player) => (
            <div 
              key={player.id} 
              className="w-full flex justify-center hover:-translate-y-1 transition-transform duration-300"
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
      ) : (
        <div className="ow-glass-panel py-16 px-4 text-center max-w-xl mx-auto flex flex-col items-center justify-center gap-4">
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
