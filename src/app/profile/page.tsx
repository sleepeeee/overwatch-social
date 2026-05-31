"use client";

import { useState, useEffect } from "react";
import { OWPlayerCard } from "@/types/card";
import {
  HEROES_CONFIG,
  PRESET_TAGS,
  SERVER_OPTIONS,
  MBTI_OPTIONS,
  LANGUAGE_OPTIONS,
  MIC_OPTIONS,
  SOCIAL_PLATFORMS
} from "@/data/mockPlayers";
import OWCard from "@/components/OWCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Save, Info, AlertTriangle } from "lucide-react";

const DEFAULT_CARD: OWPlayerCard = {
  id: "player-current-user",
  server: "Asia Server",
  battle_tag: "愛喝奶茶#3342",
  is_tag_visible: true,
  selected_heroes: ["winston", "tracer"],
  tags: ["團隊至上", "主坦玩家"],
  message: "GGWP！一起加油，推車到底啦 🚀",
  languages: ["繁體中文"],
  mic_status: "mic-on",
  social_channels: {
    discord: "akira#1234"
  },
  mbti: "INFJ"
};

export default function ProfilePage() {
  const [cardData, setCardData] = useState<OWPlayerCard>(DEFAULT_CARD);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // 🛡️ [Mitigation] 引入 Mounted 狀態鎖，徹底杜絕 Next.js Hydration Mismatch 與 FOUC Layout Shift
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const savedCard = localStorage.getItem("ow_social_user_card");
    if (savedCard) {
      try {
        const parsed = JSON.parse(savedCard);
        // 防禦性合併，以防 localStorage 中 social_channels 被損壞
        setCardData({
          ...DEFAULT_CARD,
          ...parsed,
          social_channels: parsed.social_channels || {}
        });
      } catch (e) {
        console.error("載入名片資料失敗", e);
      }
    }
  }, []);

  const handleToggleHero = (heroId: string) => {
    setErrorMsg(null);
    setCardData((prev) => {
      const selected = prev.selected_heroes || [];
      if (selected.includes(heroId)) {
        return {
          ...prev,
          selected_heroes: selected.filter((id) => id !== heroId)
        };
      } else {
        if (selected.length >= 3) {
          setErrorMsg("常用英雄最多只能選擇三個喔！");
          return prev;
        }
        return {
          ...prev,
          selected_heroes: [...selected, heroId]
        };
      }
    });
  };

  const handleToggleTag = (tagText: string) => {
    setErrorMsg(null);
    setCardData((prev) => {
      const selected = prev.tags || [];
      if (selected.includes(tagText)) {
        return {
          ...prev,
          tags: selected.filter((t) => t !== tagText)
        };
      } else {
        if (selected.length >= 3) {
          setErrorMsg("特色標籤最多選取三個，以維護卡片美感喔！");
          return prev;
        }
        return {
          ...prev,
          tags: [...selected, tagText]
        };
      }
    });
  };

  const handleSocialChange = (platform: string, value: string) => {
    setErrorMsg(null);
    const trimmedVal = value.trim();
    setCardData((prev) => {
      const updatedChannels = { ...(prev.social_channels || {}) };
      if (trimmedVal) {
        updatedChannels[platform as keyof typeof prev.social_channels] = trimmedVal;
      } else {
        delete updatedChannels[platform as keyof typeof prev.social_channels];
      }
      return {
        ...prev,
        social_channels: updatedChannels
      };
    });
  };

  const handleToggleLanguage = (lang: string) => {
    setCardData((prev) => {
      const current = prev.languages || [];
      if (current.includes(lang)) {
        if (current.length <= 1) return prev;
        return {
          ...prev,
          languages: current.filter((l) => l !== lang)
        };
      } else {
        return {
          ...prev,
          languages: [...current, lang]
        };
      }
    });
  };

  const handleSave = () => {
    setErrorMsg(null);
    
    if (!cardData.battle_tag || !cardData.battle_tag.trim()) {
      setErrorMsg("請填寫您的 BattleTag！");
      return;
    }

    // 🛡️ [Mitigation] 加強通訊管道的空白防護驗證，杜絕繞過
    const activeSocials = Object.entries(cardData.social_channels || {}).filter(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ([_, value]) => !!value && value.trim() !== ""
    );
    
    if (activeSocials.length === 0) {
      setErrorMsg("為保障聯絡暢通，最少必須填寫一個通訊軟體帳號！");
      return;
    }
    if (activeSocials.length > 3) {
      setErrorMsg("通訊軟體最多填寫三個，以保障名片版面整潔！");
      return;
    }

    localStorage.setItem("ow_social_user_card", JSON.stringify(cardData));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // 🛡️ [Mitigation] 客戶端掛載前，渲染精美的 Skeleton 骨架屏，防止 SSR 水合衝突與閃爍
  if (!isMounted) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[500px] gap-4">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 text-sm font-bold animate-pulse">正在安全載入特工自訂面板...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 頂部裝飾 */}
      <div className="mb-8 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center justify-center md:justify-start gap-2">
            <Sparkles className="text-orange-500 animate-pulse" /> 製作我的鬥陣名片
          </h1>
          <p className="text-gray-400 mt-1">自訂高質感視覺名片，在交友廣場吸引志同道合的夥伴！</p>
        </div>
        
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 text-xs text-gray-400 max-w-sm flex gap-2">
          <Info className="text-orange-500 shrink-0" size={16} />
          <span>標籤與常用英雄皆由後台統一設定與優化，以維護卡片完美視覺，玩家僅需點選即可！</span>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 bg-red-950/50 border border-red-900 text-red-200 px-4 py-3 rounded-lg flex items-center gap-3 text-sm animate-shake">
          <AlertTriangle className="text-red-500 shrink-0" size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 左右分割版面 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* 左側：名片即時預覽 */}
        <div className="lg:col-span-5 flex flex-col items-center gap-4 lg:sticky lg:top-24">
          <h2 className="text-sm font-bold tracking-widest text-gray-500 uppercase">即時名片預覽</h2>
          <OWCard cardData={cardData} isLoggedIn={true} isEditable={true} />
          <p className="text-xs text-gray-500 italic text-center max-w-[320px]">
            ✨ 卡片效果將會同步更新，這也是其他玩家在廣場上看到的最終樣貌。
          </p>
        </div>

        {/* 右側：編輯表單 */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="bg-gray-900 border-gray-800 text-white">
            <CardContent className="pt-6 space-y-5">
              <h2 className="font-extrabold text-lg text-orange-400 border-b border-gray-800 pb-2 flex items-center gap-2">
                🎮 玩家基礎設定
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 mb-1.5 block">BattleTag (遊戲ID)</label>
                  <Input
                    placeholder="例如: 愛喝奶茶#3342"
                    className="bg-gray-950 border-gray-850 focus:border-orange-500 text-white font-mono"
                    value={cardData.battle_tag}
                    onChange={(e) => {
                      setErrorMsg(null);
                      setCardData({ ...cardData, battle_tag: e.target.value });
                    }}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 mb-1.5 block">遊玩伺服器</label>
                  <select
                    className="w-full bg-gray-950 border border-gray-850 rounded-md py-2 px-3 text-sm focus:border-orange-500 text-white"
                    value={cardData.server}
                    onChange={(e) => setCardData({ ...cardData, server: e.target.value })}
                  >
                    {SERVER_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-gray-950/60 p-3 rounded-lg border border-gray-800 flex justify-between items-center">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-gray-300 block">對外隱藏 BattleTag</span>
                  <span className="text-[10px] text-gray-500 block">
                    開啟後，廣場卡片上的真實 ID 將會遮蔽，且不提供「複製」按鈕以保障個人隱私。
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setCardData({ ...cardData, is_tag_visible: !cardData.is_tag_visible })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                    cardData.is_tag_visible ? "bg-orange-500" : "bg-gray-800"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      cardData.is_tag_visible ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-gray-400 block">自我介紹留言 (限100字)</label>
                  <span className={`text-[10px] font-bold ${cardData.message.length > 100 ? "text-red-500" : "text-gray-500"}`}>
                    {cardData.message.length} / 100
                  </span>
                </div>
                <Textarea
                  placeholder="GGWP！一起加油，推車到底啦 🚀"
                  className="bg-gray-950 border-gray-850 focus:border-orange-500 text-white resize-none text-sm"
                  rows={3}
                  value={cardData.message}
                  onChange={(e) => {
                    if (e.target.value.length <= 110) {
                      setCardData({ ...cardData, message: e.target.value });
                    }
                  }}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 mb-2 block">語音溝通狀態</label>
                <div className="grid grid-cols-3 gap-2">
                  {MIC_OPTIONS.map((opt) => (
                    <Button
                      key={opt.value}
                      type="button"
                      variant="secondary"
                      onClick={() => setCardData({ ...cardData, mic_status: opt.value as 'mic-on' | 'listen-only' | 'mic-off' })}
                      className={`text-xs font-bold py-2 ${
                        cardData.mic_status === opt.value
                          ? "bg-orange-500 hover:bg-orange-600 text-white"
                          : "bg-gray-950 border border-gray-850 hover:bg-gray-900 text-gray-300"
                      }`}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 mb-2 block">溝通語言 (複選)</label>
                  <div className="flex flex-wrap gap-1.5">
                    {LANGUAGE_OPTIONS.map((lang) => {
                      const isSelected = cardData.languages.includes(lang);
                      return (
                        <Badge
                          key={lang}
                          onClick={() => handleToggleLanguage(lang)}
                          className={`cursor-pointer px-2.5 py-1 text-xs transition-colors rounded ${
                            isSelected
                              ? "bg-orange-500 hover:bg-orange-600 text-white"
                              : "bg-gray-950 text-gray-400 hover:bg-gray-900 border border-gray-850"
                          }`}
                        >
                          {lang}
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 mb-1.5 block">MBTI 人格特質 (可選)</label>
                  <select
                    className="w-full bg-gray-950 border border-gray-850 rounded-md py-2 px-3 text-sm focus:border-orange-500 text-white"
                    value={cardData.mbti || ""}
                    onChange={(e) => setCardData({ ...cardData, mbti: e.target.value || undefined })}
                  >
                    <option value="">不公開</option>
                    {MBTI_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 常用英雄選擇 */}
          <Card className="bg-gray-900 border-gray-800 text-white">
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between items-center border-b border-gray-850 pb-2">
                <h2 className="font-extrabold text-lg text-orange-400 flex items-center gap-2">
                  🛡️ 常用英雄展示 (最多 3 個，不限定位)
                </h2>
                <span className="text-[10px] text-gray-500 bg-gray-950 px-2 py-0.5 rounded border border-gray-850">
                  已選 {cardData.selected_heroes.length} / 3
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {HEROES_CONFIG.map((hero) => {
                  const isSelected = cardData.selected_heroes.includes(hero.id);
                  return (
                    <button
                      key={hero.id}
                      type="button"
                      onClick={() => handleToggleHero(hero.id)}
                      className={`relative p-2 rounded-lg flex flex-col items-center justify-center border transition-all duration-200 group ${
                        isSelected
                          ? "bg-orange-500/20 border-orange-500 text-white scale-102"
                          : "bg-gray-950 border-gray-850 text-gray-400 hover:bg-gray-900 hover:border-gray-700"
                      }`}
                    >
                      <span className="absolute top-1 right-1 text-[8px]">
                        {hero.role === "tank" ? "🛡️" : hero.role === "damage" ? "⚔️" : "➕"}
                      </span>
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-800 bg-gray-900 flex justify-center items-end group-hover:scale-105 transition-transform mb-1.5 select-none">
                        <img 
                          src={hero.imageUrl} 
                          alt={hero.name} 
                          className="w-[150%] h-[150%] object-contain origin-bottom select-none"
                          draggable="false"
                        />
                      </div>
                      <span className="text-xs font-bold truncate max-w-full">{hero.name}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* 特色標籤選擇 */}
          <Card className="bg-gray-900 border-gray-800 text-white">
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between items-center border-b border-gray-850 pb-2">
                <h2 className="font-extrabold text-lg text-orange-400 flex items-center gap-2">
                  🏷️ 特色標籤選擇 (最多 3 個，後台預設)
                </h2>
                <span className="text-[10px] text-gray-500 bg-gray-950 px-2 py-0.5 rounded border border-gray-850">
                  已選 {cardData.tags.length} / 3
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {PRESET_TAGS.map((tag) => {
                  const isSelected = cardData.tags.includes(tag.text);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleToggleTag(tag.text)}
                      className={`cursor-pointer px-3 py-1.5 text-xs font-extrabold rounded-md border shadow-sm transition-all duration-200 ${
                        isSelected
                          ? "bg-orange-500 text-white border-orange-500 scale-105"
                          : "bg-gray-950 text-gray-400 hover:bg-gray-900 border-gray-850"
                      }`}
                    >
                      #{tag.text}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* 常用聯絡管道 */}
          <Card className="bg-gray-900 border-gray-800 text-white">
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between items-center border-b border-gray-850 pb-2">
                <h2 className="font-extrabold text-lg text-orange-400 flex items-center gap-2">
                  💬 常用聯絡管道設定 (1~3 個)
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SOCIAL_PLATFORMS.map((platform) => {
                  const val = (cardData.social_channels || {})[platform.id as keyof typeof cardData.social_channels] || "";
                  return (
                    <div key={platform.id}>
                      <label className="text-xs font-bold text-gray-400 mb-1.5 block">
                        {platform.label} 帳號
                      </label>
                      <Input
                        placeholder={platform.placeholder}
                        className="bg-gray-950 border-gray-850 focus:border-orange-500 text-white text-xs font-mono"
                        value={val}
                        onChange={(e) => handleSocialChange(platform.id, e.target.value)}
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleSave}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-6 text-base font-bold shadow-lg transition-transform active:scale-98 flex items-center justify-center gap-2 rounded-xl"
          >
            <Save size={18} />
            {saved ? "✓ 名片儲存成功！" : "儲存並發布我的名片"}
          </Button>
        </div>
      </div>
    </div>
  );
}
