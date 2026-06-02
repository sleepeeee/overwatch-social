"use client";

import { useState, useEffect, useRef } from "react";
import { OWPlayerCard, type UserProfile, type HeroConfig } from "@/types/card";
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
import InteractiveAvatar from "@/components/InteractiveAvatar";
import { getHeroAlignments } from "@/app/actions/alignment";
import type { AlignmentConfig } from "@/data/heroAlignments";
import { HERO_ALIGNMENTS } from "@/data/heroAlignments";
import { Card, CardContent } from "@/components/ui/card";
import { SocialIcon } from "@/components/ui/SocialIcons";
import { toPng } from "html-to-image";

type ProfileUpdatePayload = {
  user_id: string;
  server: string;
  battle_tag: string;
  is_tag_visible: boolean;
  selected_heroes: string[];
  tags: string[];
  message: string;
  mic_status: string;
  mbti: string | null;
};
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Save, Info, AlertTriangle, ArrowLeft, Gamepad2, ShieldAlert, Cpu } from "lucide-react";
import { getMyProfile, saveProfile } from "@/app/actions/profile";
import { getGameSpecialTags } from "@/app/actions/tags";
import Link from "next/link";
import { useDevMode } from "@/hooks/useDevMode";
import LoginModal from "@/components/LoginModal";
import TopBar from "@/components/TopBar";
import { useAuth } from "@/context/AuthContext";

const DEFAULT_CARD: OWPlayerCard = {
  card_id: "card-current-user",
  user_id: "user-current-user",
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

const heroRoleTabs: Array<{ value: "all" | HeroConfig["role"]; label: string }> = [
  { value: "all", label: "全部" },
  { value: "tank", label: "肉盾 🛡️" },
  { value: "damage", label: "攻擊 ⚔️" },
  { value: "support", label: "支援 ➕" }
];

interface SpecialTag {
  id: string;
  game_id: string;
  tag_name: string;
  style_class: string;
  created_at: string;
}

export default function ProfilePage() {
  const { isDeveloper } = useDevMode();
  const [activeSection, setActiveSection] = useState<"hub" | "ow-edit">("hub");
  
  // 頂層 UserProfile 狀態
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: "user-current-user",
    display_name: "愛喝奶茶",
    avatar_url: "/images/avatars/avatar_female_elegant_square.png",
    bio: "GGWP！一起加油，推車到底啦 🚀"
  });

  // 鬥陣名片狀態
  const [cardData, setCardData] = useState<OWPlayerCard>(DEFAULT_CARD);
  
  // 各種 UI 控制狀態
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hubSaved, setHubSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [heroRoleFilter, setHeroRoleFilter] = useState<"all" | "tank" | "damage" | "support">("all");
  const { user, authLoading, userProfile: authUserProfile } = useAuth();
  const [heroAlignments, setHeroAlignments] = useState<Record<string, AlignmentConfig>>(HERO_ALIGNMENTS);
  const [dbTags, setDbTags] = useState<SpecialTag[]>([]);

  // 🌟 匯出圖片與分享相關狀態與 ref
  const cardRef = useRef<HTMLDivElement>(null);
  const [exportingImage, setExportingImage] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const handleExportImage = async () => {
    if (!cardRef.current) return;
    setExportingImage(true);
    setErrorMsg(null);
    try {
      // 確保導出時的磨砂玻璃效果與解析度
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        backgroundColor: "transparent",
        style: {
          transform: "scale(1)",
          transformOrigin: "top left"
        }
      });
      const link = document.createElement("a");
      const name = cardData.battle_tag ? cardData.battle_tag.split("#")[0] : "player";
      link.download = `ow-card-${name}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("導出圖片失敗:", err);
      setErrorMsg("導出圖片失敗，請重試！");
    } finally {
      setExportingImage(false);
    }
  };

  const handleShareLink = async () => {
    setErrorMsg(null);
    setSharing(true);
    try {
      const shareUrl = `${window.location.origin}/share/${user?.id || "mock-user-id"}`;
      await navigator.clipboard.writeText(shareUrl);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2500);
    } catch (err) {
      console.error("產生分享連結失敗:", err);
      setErrorMsg("產生分享連結失敗，請重試！");
    } finally {
      setSharing(false);
    }
  };


  // 初始化：載入特色標籤 + 英雄對準參數
  useEffect(() => {
    getGameSpecialTags("overwatch").then(res => {
      if (res.success && res.data) {
        setDbTags(res.data);
      }
    });
    getHeroAlignments().then(setHeroAlignments);
  }, []);

  // Auth seed：以 per-user localStorage 優先，無快取時使用 Auth metadata
  useEffect(() => {
    if (!authUserProfile) return;
    const key = `user_profile_hub_${authUserProfile.id}`;
    const cached = localStorage.getItem(key);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed?.id === authUserProfile.id) {
          setUserProfile(parsed);
          return;
        }
      } catch {
        localStorage.removeItem(key);
      }
    }
    setUserProfile(authUserProfile);
  }, [authUserProfile]);

  // user 變化時載入名片資料（auth state 由 AuthContext 統一管理）
  useEffect(() => {
    if (!user) return;
    getMyProfile().then(profile => {
      if (profile) {
        const loadedCard = { ...DEFAULT_CARD, ...profile, social_channels: profile.social_channels || {} };
        setCardData(loadedCard);
      } else {
        setCardData(DEFAULT_CARD);
      }
    });
  }, [user?.id]);

  // 變更頭像 handler
  const handleAvatarChange = (newUrl: string) => {
    setUserProfile((prev) => {
      const updated = { ...prev, avatar_url: newUrl };
      const key = `user_profile_hub_${updated.id}`;
      localStorage.setItem(key, JSON.stringify(updated));
      return updated;
    });
  };

  // 儲存通用帳戶檔案 handler
  const handleSaveHub = () => {
    setHubSaved(true);
    const key = `user_profile_hub_${userProfile.id}`;
    localStorage.setItem(key, JSON.stringify(userProfile));
    setTimeout(() => setHubSaved(false), 2000);
  };

  // 原有鬥陣名片編輯 handlers
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

  const handleToggleSocial = (platformId: string) => {
    setErrorMsg(null);
    setCardData((prev) => {
      const currentChannels = { ...(prev.social_channels || {}) };
      const isActive = !!currentChannels[platformId as keyof typeof prev.social_channels];
      const activeCount = Object.keys(currentChannels).length;
      
      if (isActive) {
        if (activeCount <= 1) {
          setErrorMsg("為保障聯絡暢通，最少必須填寫一個聯絡管道喔！");
          return prev;
        }
        delete currentChannels[platformId as keyof typeof prev.social_channels];
      } else {
        if (activeCount >= 3) {
          setErrorMsg("常用聯絡管道最多只能點選三個喔，以維護卡片版面整潔！");
          return prev;
        }
        currentChannels[platformId as keyof typeof prev.social_channels] = "true";
      }
      
      return {
        ...prev,
        social_channels: currentChannels
      };
    });
  };

  const handleToggleLanguage = (lang: string) => {
    setErrorMsg(null);
    setCardData((prev) => {
      const current = prev.languages || [];
      if (current.includes(lang)) {
        if (current.length <= 1) return prev;
        return {
          ...prev,
          languages: current.filter((l) => l !== lang)
        };
      } else {
        if (current.length >= 3) {
          setErrorMsg("溝通語言最多只能選擇三個喔，以維護卡片完美視覺！");
          return prev;
        }
        return {
          ...prev,
          languages: [...current, lang]
        };
      }
    });
  };

  const getPlatformEmoji = (platformId: string) => {
    switch (platformId) {
      case 'discord': return '👾';
      case 'steam': return '🎮';
      case 'x': return '𝕏';
      case 'line': return '💬';
      default: return '🔗';
    }
  };

  const getPlatformColor = (platformId: string, isActive: boolean) => {
    if (!isActive) {
      return "bg-white/30 border-[#8c7c6c]/15 text-[#8c7c6c] hover:bg-white/60 hover:border-[#8c7c6c]/30 hover:text-[#5d4037] transition-all";
    }
    switch (platformId) {
      case 'discord':
        return "bg-[#5865F2]/12 border-[#5865F2] text-[#5865F2] shadow-[0_4px_12px_rgba(88,101,242,0.15)] scale-[1.02]";
      case 'steam':
        return "bg-[#171a21]/10 border-[#171a21]/40 text-[#3e2723] shadow-[0_4px_12px_rgba(23,26,33,0.05)] scale-[1.02]";
      case 'x':
        return "bg-[#0f1419]/10 border-[#0f1419]/40 text-[#3e2723] shadow-[0_4px_12px_rgba(15,20,25,0.05)] scale-[1.02]";
      case 'line':
        return "bg-[#06C755]/12 border-[#06C755] text-[#06b34c] shadow-[0_4px_12px_rgba(6,199,85,0.15)] scale-[1.02]";
      default:
        return "bg-[#82b7cc]/12 border-[#82b7cc] text-[#82b7cc]";
    }
  };

  // 儲存名片 handler
  const handleSaveCard = async () => {
    if (!user) return;
    setErrorMsg(null);
    
    if (!cardData.battle_tag || !cardData.battle_tag.trim()) {
      setErrorMsg("請填寫您的 BattleTag！");
      return;
    }

    const activeSocials = Object.entries(cardData.social_channels || {}).filter(
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

    setSaving(true);
    const result = await saveProfile(cardData);
    setSaving(false);
    if (result.error) {
      setErrorMsg(result.error);
      return;
    }
    setSaved(true);
    // 🌟 儲存成功時，自動彈出分享對話框 Modal
    setShowShareModal(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // 移除 authLoading spinner：LoginModal show={!authLoading && !user} 已足夠守門
  // 不再阻擋整個頁面渲染，避免 Supabase 連線慢時卡在 spinner

  // 1. 渲染：主入口 UserProfile Hub
  if (activeSection === "hub") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-12">
        <TopBar />
        {/* 頂部 Hub 標題 */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-extrabold tracking-tight text-[#3e2723] flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <Gamepad2 className="text-[#82b7cc] animate-pulse" /> 特工帳戶主控台
            </h1>
            <p className="text-[#8c7c6c] mt-1 font-semibold text-sm">
              管理您的通用帳戶，並在「遊戲檔案庫」中整理歸檔多款遊戲的名片。
            </p>
          </div>
        </div>

        {/* 上半部：通用個人檔案編輯區 */}
        <Card className="glass-panel text-[#5d4037] overflow-hidden relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#82b7cc]/15 to-transparent rounded-bl-full pointer-events-none" />
          <CardContent className="p-6 md:p-8">
            <h2 className="font-extrabold text-base tracking-widest text-[#82b7cc] uppercase mb-6 flex items-center gap-2 border-b border-[#8c7c6c]/10 pb-2">
              👤 通用個人檔案
            </h2>
            
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* 智慧 InteractiveAvatar 元件 */}
              <div className="shrink-0">
                <InteractiveAvatar
                  currentAvatarUrl={userProfile.avatar_url}
                  onAvatarChange={handleAvatarChange}
                  displayName={userProfile.display_name}
                />
                <p className="text-[10px] text-center text-[#8c7c6c]/80 mt-2 font-bold tracking-wider">
                  💡 點選頭像更換
                </p>
              </div>

              {/* 暱稱與簡介編輯表單 */}
              <div className="flex-1 w-full space-y-4">
                <div>
                  <label className="text-xs font-black text-[#8c7c6c] mb-1.5 block">通用帳戶暱稱</label>
                  <Input
                    placeholder="請輸入平台暱稱..."
                    className="bg-white/60 border-[#8c7c6c]/20 focus:border-[#82b7cc] text-[#5d4037] font-black text-sm rounded-xl focus:ring-1 focus:ring-[#82b7cc]/30"
                    value={userProfile.display_name}
                    onChange={(e) => {
                      setUserProfile({ ...userProfile, display_name: e.target.value });
                    }}
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-[#8c7c6c] mb-1.5 block">全域個人簡介</label>
                  <Textarea
                    placeholder="輸入一句話自我介紹，這將展現在所有關聯的名片上..."
                    className="bg-white/60 border-[#8c7c6c]/20 focus:border-[#82b7cc] text-[#5d4037] resize-none text-sm rounded-xl"
                    rows={2}
                    value={userProfile.bio || ""}
                    onChange={(e) => {
                      setUserProfile({ ...userProfile, bio: e.target.value });
                    }}
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <Button
                    onClick={handleSaveHub}
                    className="bg-[#82b7cc] hover:bg-[#82b7cc]/90 text-white font-extrabold text-xs px-6 py-4.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <Save size={13} />
                    {hubSaved ? "✓ 儲存成功" : "儲存帳戶設定"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 下半部：我的遊戲檔案庫 (歸檔卡片) */}
        <div className="space-y-4">
          <h2 className="font-extrabold text-base tracking-widest text-[#8c7c6c] uppercase px-1">
            🗂️ 我的遊戲檔案庫
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. 鬥陣特工名片 - 已啟用且可編輯 */}
            <div className="bg-gradient-to-br from-[#f5d46b]/12 via-white/70 to-[#82b7cc]/12 backdrop-blur-md border border-[#f5d46b]/35 hover:border-[#82b7cc]/50 rounded-[24px] p-5 shadow-sm hover:shadow-[#82b7cc]/10 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[20px] filter saturate-100 group-hover:scale-110 transition-transform">🥞</span>
                  <span className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider flex items-center gap-1 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    已綁定
                  </span>
                </div>
                
                <h3 className="text-sm font-black text-[#3e2723]">鬥陣特工名片</h3>
                <p className="text-[10px] text-[#8c7c6c] font-semibold mt-0.5">Overwatch Card Hub</p>
                
                <div className="my-5 bg-white/40 border border-[#8c7c6c]/10 rounded-xl p-3 space-y-1 shadow-sm">
                  <div className="text-[10px] font-extrabold text-[#8c7c6c] uppercase">當前綁定玩家</div>
                  <div className="text-xs font-black text-[#5d4037] truncate">{cardData.battle_tag || "未設定"}</div>
                  
                  {/* 小型英雄簡介預覽 */}
                  <div className="flex gap-1.5 mt-2.5">
                    {cardData.selected_heroes.map((heroId) => (
                      <div key={heroId} className="w-6 h-6 rounded-full overflow-hidden border border-[#8c7c6c]/15 bg-white shadow-sm flex items-center justify-center shrink-0">
                        <img
                          src={`/images/heroes/avatars/${heroId}.png`}
                          alt={heroId}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/heroes/silhouette.png';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <Button
                onClick={() => setActiveSection("ow-edit")}
                className="w-full bg-[#82b7cc]/12 hover:bg-[#82b7cc] border border-[#82b7cc]/25 text-[#82b7cc] hover:text-white py-2.5 text-xs font-black rounded-xl transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
              >
                點擊編輯遊戲名片
              </Button>
            </div>

            {/* 2. 特戰英豪名片 - 灰階佔位卡 */}
            <div className="bg-white/40 backdrop-blur-sm border border-[#a0a29f]/20 rounded-[24px] p-5 flex flex-col justify-between filter grayscale opacity-70 hover:opacity-85 transition-all duration-300">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[20px]">🎯</span>
                  <span className="bg-[#8c7c6c]/12 border border-[#8c7c6c]/20 text-[#8c7c6c] px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider shadow-sm">
                    即將推出
                  </span>
                </div>
                
                <h3 className="text-sm font-black text-[#8c7c6c]">特戰英豪名片</h3>
                <p className="text-[10px] text-[#8c7c6c]/70 font-semibold mt-0.5">Valorant Card Hub</p>
                
                <div className="my-5 bg-[#e0e0e0]/20 border border-[#a0a29f]/10 rounded-xl p-3 space-y-1 shadow-sm">
                  <div className="text-[10px] font-extrabold text-[#8c7c6c]/60 uppercase">當前綁定玩家</div>
                  <div className="text-xs font-black text-[#8c7c6c]/50 truncate">{userProfile.display_name}#VAL</div>
                  <div className="w-full h-1 bg-[#8c7c6c]/10 rounded-full mt-3 animate-pulse" />
                </div>
              </div>
              
              <Button
                disabled
                className="w-full bg-[#8c7c6c]/5 border border-[#8c7c6c]/15 text-[#8c7c6c]/60 py-2.5 text-xs font-black rounded-xl cursor-not-allowed shadow-none"
              >
                連結名片（即將推出）
              </Button>
            </div>

            {/* 3. 英雄聯盟名片 - 灰階佔位卡 */}
            <div className="bg-white/40 backdrop-blur-sm border border-[#a0a29f]/20 rounded-[24px] p-5 flex flex-col justify-between filter grayscale opacity-70 hover:opacity-85 transition-all duration-300">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[20px]">👑</span>
                  <span className="bg-[#8c7c6c]/12 border border-[#8c7c6c]/20 text-[#8c7c6c] px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider shadow-sm">
                    即將推出
                  </span>
                </div>
                
                <h3 className="text-sm font-black text-[#8c7c6c]">英雄聯盟名片</h3>
                <p className="text-[10px] text-[#8c7c6c]/70 font-semibold mt-0.5">League of Legends Card</p>
                
                <div className="my-5 bg-[#e0e0e0]/20 border border-[#a0a29f]/10 rounded-xl p-3 space-y-1 shadow-sm">
                  <div className="text-[10px] font-extrabold text-[#8c7c6c]/60 uppercase">當前綁定玩家</div>
                  <div className="text-xs font-black text-[#8c7c6c]/50 truncate">{userProfile.display_name}#TW</div>
                  <div className="w-full h-1 bg-[#8c7c6c]/10 rounded-full mt-3 animate-pulse" />
                </div>
              </div>
              
              <Button
                disabled
                className="w-full bg-[#8c7c6c]/5 border border-[#8c7c6c]/15 text-[#8c7c6c]/60 py-2.5 text-xs font-black rounded-xl cursor-not-allowed shadow-none"
              >
                連結名片（即將推出）
              </Button>
            </div>
          </div>
        </div>

        {/* 未登入限制 */}
        <LoginModal
          show={!authLoading && !user}
          closable={false}
          title="登入後才能使用主控台"
          description="以 Google 帳號登入，快速管理你的多遊戲社交卡片與個人頭像"
        />
      </div>
    );
  }

  // 2. 渲染：鬥陣特工名片編輯表單 (ow-edit 段落)
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <TopBar />
      {/* 返回 Hub 的控制面板 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <button
          onClick={() => {
            setErrorMsg(null);
            setActiveSection("hub");
          }}
          className="inline-flex items-center gap-2 bg-white/60 hover:bg-white border border-[#8c7c6c]/20 hover:border-[#82b7cc]/50 text-[#5d4037] hover:text-[#82b7cc] px-4 py-2.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          <ArrowLeft size={14} className="stroke-[3]" />
          <span>返回特工主控台</span>
        </button>

        <div className="bg-[#82b7cc]/10 border border-[#82b7cc]/25 rounded-2xl py-2 px-3 text-xs text-[#82b7cc] flex items-center gap-2 shadow-sm">
          <span>正在自訂：《鬥陣特工》專屬戰力名片</span>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-700 px-4 py-3 rounded-2xl flex items-center gap-3 text-sm animate-shake">
          <AlertTriangle className="text-red-500 shrink-0" size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 左右分割版面 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* 左側：名片即時預覽 */}
        <div className="lg:col-span-5 flex flex-col items-center gap-4 lg:sticky lg:top-24">
          <h2 className="text-sm font-bold tracking-widest text-[#8c7c6c] uppercase">即時名片預覽</h2>
          <OWCard cardData={cardData} isLoggedIn={true} isEditable={true} customAlignments={heroAlignments} />
          <p className="text-xs text-[#8c7c6c]/80 italic text-center max-w-[320px] font-semibold">
            ✨ 卡片效果將會同步更新，這也是其他玩家在廣場上看到的最終樣貌。
          </p>
        </div>

        {/* 右側：編輯表單 */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="glass-panel text-[#5d4037]">
            <CardContent className="pt-6 space-y-5">
              <h2 className="font-extrabold text-lg text-[#82b7cc] border-b border-[#8c7c6c]/10 pb-2 flex items-center gap-2">
                🥞 玩家基礎設定
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#8c7c6c] mb-1.5 block">BattleTag (遊戲ID)</label>
                  <Input
                    placeholder="例如: 愛喝奶茶#3342"
                    className="bg-white/50 border-[#8c7c6c]/20 focus:border-[#82b7cc] text-[#5d4037] font-mono rounded-xl focus:ring-1 focus:ring-[#82b7cc]/20"
                    value={cardData.battle_tag}
                    onChange={(e) => {
                      setErrorMsg(null);
                      setCardData({ ...cardData, battle_tag: e.target.value });
                    }}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#8c7c6c] mb-1.5 block">遊玩伺服器</label>
                  <select
                    className="w-full bg-white/50 border border-[#8c7c6c]/20 rounded-xl py-2 px-3 text-sm focus:border-[#82b7cc] text-[#5d4037] font-semibold"
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

              <div className="bg-white/40 p-4.5 rounded-2xl border border-[#8c7c6c]/12 flex justify-between items-center shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                <div className="space-y-0.5 max-w-[80%]">
                  <span className="text-xs font-black text-[#3e2723] block">直接隱藏卡片</span>
                  <span className="text-[10px] text-[#8c7c6c] font-semibold block leading-relaxed">
                    開啟後，您的特工名片將直接從交友廣場（河道）中消失，其他玩家將無法瀏覽到您的任何資訊。
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setCardData({ ...cardData, is_tag_visible: !cardData.is_tag_visible })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 cursor-pointer shadow-sm ${
                    !cardData.is_tag_visible ? "bg-[#82b7cc]" : "bg-[#a0a29f]/40"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      !cardData.is_tag_visible ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-[#8c7c6c] block">自我介紹留言 (限100字)</label>
                  <span className={`text-[10px] font-bold ${cardData.message.length > 100 ? "text-red-500" : "text-[#8c7c6c]/50"}`}>
                    {cardData.message.length} / 100
                  </span>
                </div>
                <Textarea
                  placeholder="GGWP！一起加油，推車到底啦 🚀"
                  className="bg-white/50 border-[#8c7c6c]/20 focus:border-[#82b7cc] text-[#5d4037] resize-none text-sm rounded-xl"
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
                <label className="text-xs font-bold text-[#8c7c6c] mb-2 block">語音溝通狀態</label>
                <div className="grid grid-cols-3 gap-2">
                  {MIC_OPTIONS.map((opt) => (
                    <Button
                      key={opt.value}
                      type="button"
                      variant="secondary"
                      onClick={() => setCardData({ ...cardData, mic_status: opt.value as OWPlayerCard["mic_status"] })}
                      className={`text-xs font-bold py-2 rounded-xl border transition-all duration-300 active:scale-95 cursor-pointer shadow-sm ${
                        cardData.mic_status === opt.value
                          ? "bg-[#82b7cc] border-[#82b7cc] text-white"
                          : "bg-white/40 border-[#8c7c6c]/15 hover:bg-white text-[#8c7c6c] hover:text-[#3e2723]"
                      }`}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-[#8c7c6c] block">溝通語言 (最多 3 個)</label>
                    <span className="text-[9px] font-black text-[#8c7c6c]/70 bg-white/40 px-2 py-0.5 rounded-lg border border-[#8c7c6c]/15 shadow-sm">
                      已選 {cardData.languages.length} / 3
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {LANGUAGE_OPTIONS.map((lang) => {
                      const isSelected = cardData.languages.includes(lang);
                      return (
                        <Badge
                          key={lang}
                          onClick={() => handleToggleLanguage(lang)}
                          className={`cursor-pointer px-2.5 py-1 text-xs transition-all duration-300 rounded shadow-sm border ${
                            isSelected
                              ? "bg-[#82b7cc] hover:bg-[#82b7cc]/90 text-white border-[#82b7cc]"
                              : "bg-white/40 text-[#8c7c6c] hover:bg-white border-[#8c7c6c]/15"
                          }`}
                        >
                          {lang}
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#8c7c6c] mb-1.5 block">MBTI 人格特質 (可選)</label>
                  <select
                    className="w-full bg-white/50 border border-[#8c7c6c]/20 rounded-xl py-2 px-3 text-sm focus:border-[#82b7cc] text-[#5d4037] font-semibold"
                    value={cardData.mbti || ""}
                    onChange={(e) => setCardData({ ...cardData, mbti: e.target.value || undefined })}
                  >
                    <option value="" className="text-[#8c7c6c]">不公開</option>
                    {MBTI_OPTIONS.map((opt) => (
                      <option key={opt} value={opt} className="text-[#5d4037]">
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 常用英雄選擇 */}
          <Card className="glass-panel text-[#5d4037]">
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between items-center border-b border-[#8c7c6c]/10 pb-2">
                <h2 className="font-extrabold text-lg text-[#82b7cc] flex items-center gap-2">
                  🛡️ 常用英雄展示 (最多 3 個)
                </h2>
                <span className="text-[9px] font-black text-[#8c7c6c]/70 bg-white/40 px-2 py-0.5 rounded-lg border border-[#8c7c6c]/15 shadow-sm">
                  已選 {cardData.selected_heroes.length} / 3
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 pb-3 border-b border-[#8c7c6c]/10">
                {heroRoleTabs.map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setHeroRoleFilter(tab.value)}
                    className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors border cursor-pointer ${
                      heroRoleFilter === tab.value
                        ? "bg-[#82b7cc] border-[#82b7cc] text-white"
                        : "bg-white/40 border-[#8c7c6c]/15 text-[#8c7c6c] hover:bg-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 max-h-[300px] overflow-y-auto pr-1">
                {HEROES_CONFIG.filter(
                  (hero) => heroRoleFilter === "all" || hero.role === heroRoleFilter
                ).map((hero) => {
                  const isSelected = cardData.selected_heroes.includes(hero.id);
                  return (
                    <button
                      key={hero.id}
                      type="button"
                      onClick={() => handleToggleHero(hero.id)}
                      className={`relative p-2 rounded-xl flex flex-col items-center justify-center border transition-all duration-300 group cursor-pointer ${
                        isSelected
                          ? "bg-[#82b7cc]/15 border-[#82b7cc] text-[#3e2723]"
                          : "bg-white/40 border-[#8c7c6c]/15 text-[#8c7c6c] hover:bg-white"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-[#8c7c6c]/15 bg-white/60 flex justify-center items-center group-hover:scale-105 transition-transform mb-1.5 select-none shadow-sm">
                        <img 
                          src={`/images/heroes/avatars/${hero.id}.png`} 
                          alt={hero.name} 
                          className="w-full h-full object-cover select-none"
                          draggable="false"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/heroes/silhouette.png';
                          }}
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
          <Card className="glass-panel text-[#5d4037]">
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between items-center border-b border-[#8c7c6c]/10 pb-2">
                <h2 className="font-extrabold text-lg text-[#82b7cc] flex items-center gap-2">
                  🏷️ 特色標籤選擇 (最多 3 個)
                </h2>
                <span className="text-[9px] font-black text-[#8c7c6c]/70 bg-white/40 px-2 py-0.5 rounded-lg border border-[#8c7c6c]/15 shadow-sm">
                  已選 {cardData.tags.length} / 3
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {dbTags.map((tag) => {
                  const isSelected = cardData.tags.includes(tag.tag_name);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleToggleTag(tag.tag_name)}
                      className={`cursor-pointer px-3 py-1.5 text-xs font-extrabold rounded-full border shadow-sm transition-all duration-300 ${
                        isSelected
                          ? `${tag.style_class} scale-105 shadow-inner`
                          : "bg-white/40 text-[#8c7c6c] hover:bg-white border-[#8c7c6c]/15"
                      }`}
                    >
                      #{tag.tag_name}
                    </button>
                  );
                })}
                {dbTags.length === 0 && (
                  <span className="text-xs text-[#8c7c6c]/60 italic font-semibold">載入特色標籤中...</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 常用聯絡管道 */}
          <Card className="glass-panel text-[#5d4037]">
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between items-center border-b border-[#8c7c6c]/10 pb-2">
                <h2 className="font-extrabold text-lg text-[#82b7cc] flex items-center gap-2">
                  💬 常用聯絡管道設定 (1~3 個)
                </h2>
                <span className="text-[9px] font-black text-[#8c7c6c]/70 bg-white/40 px-2 py-0.5 rounded-lg border border-[#8c7c6c]/15 shadow-sm">
                  已選 {Object.keys(cardData.social_channels || {}).length} / 3
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {SOCIAL_PLATFORMS.map((platform) => {
                  const isActive = !!(cardData.social_channels || {})[platform.id as keyof typeof cardData.social_channels];
                  
                  return (
                    <button
                      key={platform.id}
                      type="button"
                      onClick={() => handleToggleSocial(platform.id)}
                      className={`p-3 rounded-xl border flex items-center gap-3 transition-all duration-300 cursor-pointer ${getPlatformColor(platform.id, isActive)}`}
                    >
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{
                        backgroundColor: isActive ? undefined : "rgba(255, 255, 255, 0.4)",
                        color: isActive ? "#fff" : "#8c7c6c"
                      }}>
                        <SocialIcon platform={platform.id} className="w-5 h-5" />
                      </div>
                      <div className="text-left min-w-0 flex-1">
                        <span className="text-sm font-bold truncate text-[#3e2723] block">{platform.label}</span>
                        <span className="text-[10px] text-[#8c7c6c] block truncate font-semibold">
                          {isActive ? "已開啟展示" : "未開啟展示"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleSaveCard}
            className="w-full bg-[#82b7cc] hover:bg-[#82b7cc]/90 text-white py-6 text-base font-bold shadow-[0_6px_20px_rgba(130,183,204,0.3)] transition-all duration-300 active:scale-98 flex items-center justify-center gap-2 rounded-xl border border-[#82b7cc]/30 cursor-pointer"
          >
            <Save size={18} />
            {saving ? "正在儲存..." : saved ? "✓ 名片儲存成功！" : "儲存並發布我的名片"}
          </Button>
        </div>
      </div>

      {/* 🌟 儲存成功自動彈出的分享對話框 (Modal) */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm transition-all duration-300">
          <div className="glass-panel max-w-sm w-full p-6 text-center space-y-4 border border-white/60 relative shadow-2xl animate-[fadeInUp_0.3s_ease-out] rounded-[28px] bg-white/45">
            
            {/* 關閉按鈕 */}
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 text-[#8c7c6c]/70 hover:text-[#3e2723] font-bold text-sm transition-colors cursor-pointer w-6 h-6 rounded-full bg-white/50 hover:bg-white flex items-center justify-center shadow-sm"
            >
              ✕
            </button>

            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center mx-auto text-xl animate-bounce">
              🎉
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-[#3e2723]">特工名片發布成功！</h3>
              <p className="text-[11px] text-[#8c7c6c] leading-relaxed">
                您的最新遊戲名片已成功儲存並同步至廣場。快複製您的專屬連結分享，或將精美名片保存為圖片吧！
              </p>
            </div>

            {/* 分享連結複製區 */}
            <div className="bg-white/50 p-2.5 rounded-2xl border border-[#8c7c6c]/15 flex items-center justify-between gap-2 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
              <input
                type="text"
                readOnly
                value={typeof window !== "undefined" ? `${window.location.origin}/share/${user?.id || "mock-user-id"}` : ""}
                className="bg-transparent text-xs text-[#5d4037] font-mono outline-none flex-1 truncate select-all px-1.5"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <Button
                type="button"
                onClick={handleShareLink}
                disabled={sharing}
                className="bg-[#82b7cc] hover:bg-[#82b7cc]/90 text-white rounded-lg py-1 px-2.5 text-[10px] font-black h-7 tracking-wider transition-all active:scale-95 cursor-pointer shrink-0"
              >
                {shareSuccess ? "已複製" : "複製"}
              </Button>
            </div>

            {/* 動作按鈕 */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <Button
                type="button"
                onClick={handleExportImage}
                disabled={exportingImage}
                className="bg-white/60 hover:bg-white border border-[#8c7c6c]/20 hover:border-[#82b7cc]/50 text-[#5d4037] hover:text-[#82b7cc] rounded-xl py-2 px-3 text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>💾</span>
                <span>{exportingImage ? "導出中..." : "保存圖片"}</span>
              </Button>
              
              <Link
                href={`/share/${user?.id || "mock-user-id"}`}
                target="_blank"
                className="w-full"
              >
                <Button
                  type="button"
                  className="w-full border-none bg-[#82b7cc]/15 text-[#82b7cc] hover:bg-[#82b7cc] hover:text-white rounded-xl py-2 px-3 text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>🌐</span>
                  <span>前往分享頁</span>
                </Button>
              </Link>
            </div>

          </div>
        </div>
      )}

      {/* 未登入限制 */}
      <LoginModal
        show={!authLoading && !user}
        closable={false}
        title="登入後才能建立名片"
        description="以 Google 帳號登入，建立你的特工名片並公開到交友廣場"
      />
    </div>
  );
}
