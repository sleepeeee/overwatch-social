"use client";

import { useState, useEffect } from "react";
import { OWPlayerCard, type UserProfile } from "@/types/card";
import {
  HEROES_CONFIG,
  SERVER_OPTIONS,
  MBTI_OPTIONS,
  MIC_OPTIONS,
  SOCIAL_PLATFORMS,
  LANGUAGE_OPTIONS
} from "@/data/mockPlayers";
import OWCard from "@/components/OWCard";
import { GAME_AVAILABILITY } from "@/lib/gameCatalog";
import InteractiveAvatar from "@/components/InteractiveAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ExternalLink, Gamepad2, AlertTriangle, LockKeyhole } from "lucide-react";
import { getMyProfile, saveProfile, provisionDefaultCard } from "@/app/actions/profile";
import { deleteMyAccount } from "@/app/actions/account";
import { getMyUserProfile, saveNickname } from "@/app/actions/userProfile";
import { getGameSpecialTags } from "@/app/actions/tags";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { SocialIcon } from "@/components/ui/SocialIcons";

const DEFAULT_CARD: OWPlayerCard = {
  card_id: "card-current-user",
  user_id: "user-current-user",
  server: "asia",
  battle_tag: "",
  is_tag_visible: true,
  is_card_visible: true,
  selected_heroes: [],
  tags: [],
  message: "GGWP！一起加油，推車到底啦 🚀",
  languages: ["繁體中文"],
  mic_status: "listen-only",
  social_channels: {},
  mbti: "INFJ"
};

interface SpecialTag {
  id: string;
  game_id: string;
  tag_name: string;
  style_class: string;
  created_at: string;
}

const VAL_HEROES = [
  { id: "omen", name: "歐門 (Omen)", role: "controller" },
  { id: "jett", name: "捷提 (Jett)", role: "duelist" },
  { id: "sage", name: "聖祈 (Sage)", role: "sentinel" },
  { id: "sova", name: "蘇法 (Sova)", role: "initiator" },
  { id: "reyna", name: "雷娜 (Reyna)", role: "duelist" },
  { id: "cypher", name: "瑟符 (Cypher)", role: "sentinel" },
];

const LOL_HEROES = [
  { id: "jhin", name: "燼 (Jhin)", role: "adc" },
  { id: "missfortune", name: "好運姐 (Miss Fortune)", role: "adc" },
  { id: "ahri", name: "阿璃 (Ahri)", role: "mage" },
  { id: "yasuo", name: "犽宿 (Yasuo)", role: "fighter" },
  { id: "lux", name: "拉克絲 (Lux)", role: "mage" },
  { id: "thresh", name: "瑟雷西 (Thresh)", role: "support" },
];

type EditableGame = "ow" | "val" | "lol";
type HeroRoleFilter = "All" | "Tank" | "Dps" | "Support";

const HERO_ROLE_FILTERS: HeroRoleFilter[] = ["All", "Tank", "Dps", "Support"];

const getGameDisplayName = (game: EditableGame) => {
  if (game === "ow") return "鬥陣特攻";
  if (game === "val") return "特戰英豪";
  return "英雄聯盟";
};

const getHeroDisplayNameById = (game: EditableGame, heroId: string) => {
  const heroList = game === "ow" ? HEROES_CONFIG : game === "val" ? VAL_HEROES : LOL_HEROES;
  return heroList.find((hero) => hero.id === heroId)?.name ?? heroId;
};

const getCharacterImageAlt = (game: EditableGame, heroName: string, purpose: string) => {
  return `${getGameDisplayName(game)}角色 ${heroName} ${purpose}`;
};

const getColorClasses = (game: "ow" | "val" | "lol" | null) => {
  switch (game) {
    case "val":
      return {
        name: "特戰英豪",
        englishName: "Valorant | 特戰英豪",
        primary: "rose",
        bg: "bg-theme-danger/20",
        text: "text-theme-danger-soft",
        border: "border-theme-danger/40",
        focusBorder: "focus:border-theme-danger focus:ring-theme-danger/30",
        accentBtn: "bg-theme-danger/10 hover:bg-theme-danger border-theme-danger/20 text-theme-danger-soft hover:text-white",
        saveBtn: "bg-theme-danger hover:bg-theme-danger text-white shadow-[0_6px_20px_rgba(244,63,94,0.3)] border-theme-danger/30",
        glow: "shadow-[0_0_10px_rgba(244,63,94,0.2)]",
        tagGlow: "shadow-[0_0_8px_rgba(244,63,94,0.15)]",
        headerGlow: "bg-theme-danger",
        badge: "bg-theme-danger/10 border border-theme-danger/20 text-theme-danger-soft",
        borderFocus: "focus:border-theme-danger focus:ring-theme-danger/30",
        textLight: "text-theme-danger-soft",
        tagBtnSelected: "bg-theme-danger/20 text-theme-danger-soft border-theme-danger/40",
        micBtnSelected: "bg-theme-danger/20 border-theme-danger/60 text-white",
        sidebarGlow: "from-theme-danger-deep/20 via-black/40 to-theme-danger-deep/10"
      };
    case "lol":
      return {
        name: "英雄聯盟",
        englishName: "League of Legends | 英雄聯盟",
        primary: "blue",
        bg: "bg-theme-info/20",
        text: "text-theme-info-soft",
        border: "border-theme-info/40",
        focusBorder: "focus:border-theme-info focus:ring-theme-info/30",
        accentBtn: "bg-theme-info/10 hover:bg-theme-info border-theme-info/20 text-theme-info-soft hover:text-white",
        saveBtn: "bg-theme-info hover:bg-theme-info text-white shadow-[0_6px_20px_rgba(59,130,246,0.3)] border-theme-info/30",
        glow: "shadow-[0_0_10px_rgba(59,130,246,0.2)]",
        tagGlow: "shadow-[0_0_8px_rgba(59,130,246,0.15)]",
        headerGlow: "bg-theme-info",
        badge: "bg-theme-info/10 border border-theme-info/20 text-theme-info-soft",
        borderFocus: "focus:border-theme-info focus:ring-theme-info/30",
        textLight: "text-theme-info-soft",
        tagBtnSelected: "bg-theme-info/20 text-theme-info-soft border-theme-info/40",
        micBtnSelected: "bg-theme-info/20 border-theme-info/60 text-white",
        sidebarGlow: "from-theme-info-deep/20 via-black/40 to-theme-info-deep/10"
      };
    case "ow":
    default:
      return {
        name: "鬥陣特攻",
        englishName: "Overwatch | 鬥陣特攻",
        primary: "amber",
        bg: "bg-theme-warning/20",
        text: "text-theme-warning-soft",
        border: "border-theme-warning/40",
        focusBorder: "focus:border-theme-warning focus:ring-theme-warning/30",
        accentBtn: "bg-theme-warning/10 hover:bg-theme-warning border-theme-warning/20 text-theme-warning-soft hover:text-white",
        saveBtn: "bg-theme-warning hover:bg-theme-warning/90 text-white shadow-[0_6px_20px_rgba(245,158,11,0.3)] border-theme-warning/30",
        glow: "shadow-[0_0_10px_rgba(245,158,11,0.2)]",
        tagGlow: "shadow-[0_0_8px_rgba(245,158,11,0.15)]",
        headerGlow: "bg-theme-warning",
        badge: "bg-theme-warning/10 border border-theme-warning/20 text-theme-warning-soft",
        borderFocus: "focus:border-theme-warning focus:ring-theme-warning/30",
        textLight: "text-theme-warning-soft",
        tagBtnSelected: "bg-theme-warning/20 text-theme-warning-soft border-theme-warning/40",
        micBtnSelected: "bg-theme-warning/20 border-theme-warning/60 text-white",
        sidebarGlow: "from-theme-warning-deep/20 via-black/40 to-theme-warning-deep/10"
      };
  }
};

function CosmicLivePreviewCard({
  cardData,
  gameType,
  colorClasses,
}: {
  cardData: OWPlayerCard;
  gameType: "val" | "lol";
  colorClasses: ReturnType<typeof getColorClasses>;
}) {
  const {
    server = "",
    battle_tag = "",
    selected_heroes = [],
    tags = [],
    message = "",
    mic_status = "listen-only",
    social_channels = {},
    mbti
  } = cardData;

  const displayTag = battle_tag || `${gameType === "val" ? "Valorant" : "League"}Player#0000`;

  return (
    <div
      className="glass-card relative w-full max-w-[420px] mx-auto p-5 overflow-hidden flex flex-col justify-between group/card rounded-2xl border border-white/[0.05] hover:shadow-[0_0_30px_rgba(192,132,252,0.15)] transition-all duration-700"
      style={{ fontFamily: "var(--theme-font-family), sans-serif" }}
    >
      {/* 頂部發光邊條 */}
      <div className={`absolute top-0 left-0 right-0 h-[2.5px] opacity-40 transition-opacity duration-700 group-hover/card:opacity-100 ${colorClasses.headerGlow}`}></div>

      {/* 浮水印 */}
      <div className="absolute right-[-20px] bottom-[-20px] w-[180px] h-[180px] text-white/[0.015] pointer-events-none select-none z-0">
        {gameType === "val" ? (
          <span className="text-[120px] font-black tracking-tighter opacity-10">VAL</span>
        ) : (
          <span className="text-[120px] font-black tracking-tighter opacity-10">LOL</span>
        )}
      </div>

      {/* Header */}
      <div className="flex justify-between items-center border-b border-white/[0.04] pb-3 mb-4 gap-2">
        <span className="text-theme-text-muted font-bold text-[11px] sm:text-xs tracking-widest uppercase whitespace-nowrap shrink-0">
          {gameType === "val" ? "Valorant | 特戰英豪" : "League of Legends | 英雄聯盟"}
        </span>
        <span className={`${colorClasses.bg} ${colorClasses.text} border ${colorClasses.border} px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black tracking-widest whitespace-nowrap shrink-0 uppercase`}>
          {server}
        </span>
      </div>

      {/* UID */}
      <div className="bg-black/40 border border-white/[0.03] rounded-xl p-3 flex items-center justify-between mb-4 relative z-10">
        <div className="flex flex-col">
          <span className="text-[9px] text-theme-text-muted font-mono">UID</span>
          <span className="text-xs text-theme-text-strong font-mono font-semibold mt-0.5">{displayTag}</span>
        </div>
      </div>

      {/* Hero Showcase Window */}
      <div className="relative w-full h-[180px] overflow-hidden mb-4 flex border border-white/[0.05] rounded-xl bg-black/20">
        {[0, 1, 2].map((index) => {
          const heroId = selected_heroes[index];
          const heroList = gameType === "val" ? VAL_HEROES : LOL_HEROES;
          const heroInfo = heroList.find(h => h.id === heroId);

          return (
            <div key={index} className="relative flex-1 h-full border-r border-white/[0.05] last:border-r-0 overflow-hidden group/hero flex flex-col justify-between">
              {heroInfo ? (
                <>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10 pointer-events-none"></div>
                  {/* 懸浮角色名稱標籤 */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm border border-white/10 px-2 py-0.5 rounded-full text-center whitespace-nowrap z-20">
                    <span className="text-[8px] font-sans font-medium text-theme-text-strong tracking-wide">{heroInfo.name.split(" ")[0]}</span>
                  </div>
                  <div className="relative w-full h-[90%] flex justify-center items-start select-none transition-transform duration-500 group-hover/hero:scale-[1.03] z-10 mt-2">
                    <img
                      src={`/images/heroes/full/${gameType}_${heroInfo.id}.png`}
                      alt={getCharacterImageAlt(gameType, heroInfo.name, "名片立繪")}
                      className="max-w-[150%] max-h-[120%] object-contain select-none filter drop-shadow-[0_6px_12px_rgba(0,0,0,0.5)]"
                      draggable="false"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/heroes/silhouette.png';
                      }}
                    />
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col justify-center items-center text-theme-text-faint p-2 text-center bg-white/[0.005] opacity-60 hover:opacity-100 transition-opacity">
                  <span className="text-theme-text-faint text-sm">✦</span>
                  <span className="text-[8px] font-mono text-theme-text-faint tracking-wider mt-1">空欄位</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tags Section */}
      <div className="flex flex-wrap justify-center gap-1.5 mb-4 px-1 min-h-[34px] items-center">
        {tags.length > 0 ? (
          tags.map((tagText: string) => (
            <span
              key={tagText}
              className={`text-[9px] font-medium bg-theme-surface-raised/40 border border-white/[0.04] text-theme-text-body rounded-full px-2.5 py-1 transition-all duration-300 hover:scale-[1.03]`}
            >
              #{tagText}
            </span>
          ))
        ) : (
          <span className="text-[10px] text-theme-text-faint italic font-bold">尚未設定標籤</span>
        )}
      </div>

      {/* Whisper quote box */}
      <div className={`bg-white/[0.015] border-l-2 ${colorClasses.border} p-3 rounded-r-lg mb-4 flex-grow flex flex-col justify-between`}>
        <div className="text-theme-text-muted text-xs font-bold flex gap-1 items-start mb-1">
          <span className="text-[9px] uppercase tracking-widest text-theme-text-faint font-mono">留言 // Whisper</span>
        </div>
        <p className="text-theme-text-body text-[11px] leading-relaxed font-light font-sans italic px-1 break-words line-clamp-3">
          &ldquo;{message || "這個玩家很慢速，什麼都沒有留下..."}&rdquo;
        </p>
      </div>

      {/* Card Footer */}
      <div className="flex flex-col gap-3 pt-3 border-t border-white/[0.04] mt-auto">
        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-1.5 text-[10px] text-theme-text-soft font-mono min-w-0">
            <span>🌐</span>
            <span className="inline-block truncate max-w-[140px] sm:max-w-[170px] align-middle text-theme-text-muted">繁體中文</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <div className={`flex items-center px-1.5 py-0.5 rounded ${colorClasses.bg} ${colorClasses.text} border ${colorClasses.border} text-[8px] tracking-wide gap-1 select-none`}>
              <span className="w-1.5 h-1.5 rounded-full bg-theme-success animate-pulse"></span>
              <span>
                {mic_status === 'mic-on' ? "可開麥" : mic_status === 'listen-only' ? "僅聽麥" : "不用麥"}
              </span>
            </div>
            {mbti && (
              <span className={`bg-white/5 text-theme-text-soft border border-white/10 rounded px-1.5 py-0.5 text-[8px] font-bold font-mono`}>
                {mbti}
              </span>
            )}
          </div>
        </div>

        {/* Social Platforms Links */}
        <div className="flex items-center gap-2">
          {social_channels && Object.entries(social_channels).map(([platform, isEnabled]) => {
            if (!isEnabled) return null;
            return (
              <div
                key={platform}
                className="w-7 h-7 rounded-full flex items-center justify-center shadow-sm border border-white/5 bg-white/[0.03] text-theme-text-soft"
              >
                <span className="text-[10px] text-theme-text-muted">
                  <SocialIcon platform={platform} className="w-3.5 h-3.5" />
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, authLoading, userProfile: authUserProfile } = useAuth();
  const [editingGame, setEditingGame] = useState<"ow" | "val" | "lol" | null>(null);
  const [mounted, setMounted] = useState(false);
  
  // 頂層 UserProfile 狀態
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: "user-current-user",
    display_name: "深夜觀察者",
    avatar_url: "/images/avatars/avatar_female_elegant_square.png",
    bio: "我在此處靜靜注視著夜空，收錄來自各個平行遊戲宇宙的玩家足跡。"
  });

  // 鬥陣名片狀態
  const [cardData, setCardData] = useState<OWPlayerCard>(DEFAULT_CARD);
  
  // 特戰英豪名片狀態
  const [valCardData, setValCardData] = useState<OWPlayerCard>({
    ...DEFAULT_CARD,
    card_id: "card-current-user-val",
    server: "亞太 (APAC)",
    selected_heroes: ["omen", "jett", ""],
    tags: ["慢節奏", "不計輸贏"],
    message: "喜歡在微弱的夜光下漫步。默默守候深夜防區。"
  });

  // 英雄聯盟名片狀態
  const [lolCardData, setLolCardData] = useState<OWPlayerCard>({
    ...DEFAULT_CARD,
    card_id: "card-current-user-lol",
    server: "台灣 (TW)",
    selected_heroes: ["jhin", "missfortune", ""],
    tags: ["孤寂流浪者", "浪漫主義"],
    message: "不追求大師段位，只想在深夜的召喚峽谷編織完美的華麗謝幕。"
  });

  const currentCard = editingGame === "ow" ? cardData : editingGame === "val" ? valCardData : lolCardData;
  const setCard = editingGame === "ow" ? setCardData : editingGame === "val" ? setValCardData : setLolCardData;
  const colorClasses = getColorClasses(editingGame);
  const currentHeroesConfig = editingGame === "ow" ? HEROES_CONFIG : editingGame === "val" ? VAL_HEROES : LOL_HEROES;

  // 各種 UI 控制狀態
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hubSaved, setHubSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [heroRoleFilter, setHeroRoleFilter] = useState<"All" | "Tank" | "Dps" | "Support">("All");
  const [dbTags, setDbTags] = useState<SpecialTag[]>([]);

  // 🌟 分享頁入口狀態
  const shareUrl = user?.id ? `/share/${user.id}` : "/profile";
  const [toast, setToast] = useState({ show: false, message: "" });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [owCardProvisioned, setOwCardProvisioned] = useState(false);

  // 進入 OW 編輯器：尚無名片時先自動建檔（草稿，不上廣場），保留隨機預設名稱
  const handleEnterOwEditor = () => {
    setEditingGame("ow");
    if (owCardProvisioned) return;
    setOwCardProvisioned(true);
    provisionDefaultCard("overwatch").then(card => {
      if (card) {
        setCardData({ ...card, social_channels: card.social_channels || {}, is_card_visible: true });
      }
    });
  };

  const triggerToast = (message: string) => {
    setToast({ show: false, message: "" });
    setTimeout(() => {
      setToast({ show: true, message });
    }, 50);
    setTimeout(() => {
      setToast(prev => prev.message === message ? { show: false, message: "" } : prev);
    }, 4000);
  };

  // 初始化：載入特色標籤
  useEffect(() => {
    getGameSpecialTags("overwatch").then(res => {
      if (res.success && res.data) {
        setDbTags(res.data);
      }
    });
    setMounted(true);
  }, []);

  // Auth seed：以 per-user localStorage 優先
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

  // user 變化時載入名片資料 + display_name + 載入本地暫存的多遊戲名片
  useEffect(() => {
    if (!user) return;
    getMyProfile("overwatch").then(profile => {
      if (profile) {
        const loadedCard = { ...DEFAULT_CARD, ...profile, social_channels: profile.social_channels || {} };
        // 草稿卡：編輯表單預設「公開」，第一次儲存即轉正並上廣場（除非用戶儲存前自行隱藏）
        if (loadedCard.is_draft) loadedCard.is_card_visible = true;
        setCardData(loadedCard);
        setOwCardProvisioned(true);
      } else {
        setCardData(DEFAULT_CARD);
        setOwCardProvisioned(false);
      }
    });
    getMyUserProfile().then(up => {
      if (up?.nickname) {
        setUserProfile(prev => {
          const updated = { ...prev, display_name: up.nickname! };
          const key = `user_profile_hub_${prev.id}`;
          localStorage.setItem(key, JSON.stringify(updated));
          return updated;
        });
      }
    });

    // 載入 Val & LoL 本地暫存名片
    const cachedVal = localStorage.getItem(`player_card_val_${user.id}`);
    if (cachedVal) {
      try { setValCardData(JSON.parse(cachedVal)); } catch {}
    }
    const cachedLol = localStorage.getItem(`player_card_lol_${user.id}`);
    if (cachedLol) {
      try { setLolCardData(JSON.parse(cachedLol)); } catch {}
    }
  }, [user?.id]);

  const handleAvatarChange = (newUrl: string) => {
    setUserProfile((prev) => {
      const updated = { ...prev, avatar_url: newUrl };
      const key = `user_profile_hub_${updated.id}`;
      localStorage.setItem(key, JSON.stringify(updated));
      return updated;
    });
  };

  const handleSaveHub = async () => {
    const key = `user_profile_hub_${userProfile.id}`;
    localStorage.setItem(key, JSON.stringify(userProfile));
    const result = await saveNickname(userProfile.display_name);
    if (result.error) {
      setErrorMsg(`暱稱儲存失敗：${result.error}`);
      return;
    }
    setHubSaved(true);
    triggerToast("玩家帳戶通用設定已成功儲存！");
    setTimeout(() => setHubSaved(false), 2000);
  };

  const handleToggleHero = (heroId: string) => {
    setErrorMsg(null);
    setCard((prev) => {
      let selected = [...(prev.selected_heroes || [])];
      while (selected.length < 3) {
        selected.push("");
      }
      selected = selected.slice(0, 3);

      if (selected.includes(heroId)) {
        return {
          ...prev,
          selected_heroes: selected.map(id => id === heroId ? "" : id)
        };
      } else {
        const firstEmptyIdx = selected.indexOf("");
        if (firstEmptyIdx === -1) {
          setErrorMsg("常用英雄最多只能選擇三個喔！");
          return prev;
        }
        selected[firstEmptyIdx] = heroId;
        return {
          ...prev,
          selected_heroes: selected
        };
      }
    });
  };

  const handleClearHeroSlot = (idx: number) => {
    setCard((prev) => {
      let selected = [...(prev.selected_heroes || [])];
      while (selected.length < 3) {
        selected.push("");
      }
      selected = selected.slice(0, 3);
      selected[idx] = "";
      return {
        ...prev,
        selected_heroes: selected
      };
    });
  };

  const handleToggleTag = (tagText: string) => {
    setErrorMsg(null);
    setCard((prev) => {
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
    setCard((prev) => {
      const currentChannels = { ...(prev.social_channels || {}) };
      const isActive = !!currentChannels[platformId as keyof typeof prev.social_channels];
      const activeCount = Object.keys(currentChannels).length;
      
      if (isActive) {
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
    setCard((prev) => {
      const current = prev.languages || [];
      if (current.includes(lang)) {
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

  const handleSaveCard = async () => {
    if (!user) return;
    setErrorMsg(null);
    
    if (!currentCard.battle_tag || !currentCard.battle_tag.trim()) {
      const message = "請填寫您的 遊戲 ID (BattleTag)！";
      setErrorMsg(message);
      triggerToast(`⚠️ ${message}`);
      return;
    }

    if (editingGame === "ow") {
      const [namePart, suffixPart] = currentCard.battle_tag.split("#");
      if (!namePart?.trim() || !suffixPart?.trim()) {
        const message = "請輸入完整 BattleTag，例如：芮萊突破者#1011";
        setErrorMsg(message);
        triggerToast(`⚠️ ${message}`);
        return;
      }
    }

    const activeSocials = Object.entries(currentCard.social_channels || {}).filter(
      ([, value]) => !!value && value.trim() !== ""
    );
    
    if (activeSocials.length === 0) {
      const message = "為保障聯絡暢通，最少必須填寫一個聯絡管道！";
      setErrorMsg(message);
      triggerToast(`⚠️ ${message}`);
      return;
    }

    setSaving(true);
    try {
      if (editingGame === "ow") {
        const result = await saveProfile(cardData);
        if (result.error) {
          setErrorMsg(result.error);
          triggerToast(`⚠️ ${result.error}`);
          return;
        }
        setSaved(true);
        triggerToast("特工名片已成功儲存並同步至廣場！✨");
        setTimeout(() => setSaved(false), 2000);
      } else {
        // 本地暫存特戰英豪與英雄聯盟
        const key = `player_card_${editingGame}_${user.id}`;
        localStorage.setItem(key, JSON.stringify(currentCard));
        setSaved(true);
        triggerToast(`您的《${editingGame === "val" ? "特戰英豪" : "英雄聯盟"}》名片設定已成功儲存！✨`);
        setTimeout(() => {
          setSaved(false);
          setEditingGame(null);
        }, 1500);
      }
    } catch (error) {
      console.error("保存名片資料失敗:", error);
      setErrorMsg("名片資料保存失敗，請稍後再試");
      triggerToast("⚠️ 名片資料保存失敗，請稍後再試");
    } finally {
      setSaving(false);
    }
  };

  const handleGoogleLogin = async () => {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const handleGoogleLogout = async () => {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      const result = await deleteMyAccount();
      if (result.error) {
        setShowDeleteConfirm(false);
        triggerToast(`⚠️ ${result.error}`);
        return;
      }
      window.location.href = "/";
    } catch {
      setShowDeleteConfirm(false);
      triggerToast("⚠️ 刪除失敗，請稍後再試");
    } finally {
      setDeletingAccount(false);
    }
  };

  // ================= 0. 避免 SSR 水合不一致 =================
  if (!mounted) {
    return (
      <div className="relative min-h-screen flex flex-col justify-between z-10 selection:bg-auroraMint/30 text-theme-text-strong max-w-4xl mx-auto px-4 py-8 space-y-12">
        <div className="flex items-center justify-center py-20 relative z-10">
          <div className="w-8 h-8 rounded-full border border-theme-text-faint border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  // ================= 1. 未登入守門狀態：顯示優雅的 Continue with Google 🔒 面板 =================
  if (!user && !authLoading) {
    return (
      <div className="relative min-h-screen flex flex-col justify-between z-10 selection:bg-auroraMint/30 text-theme-text-strong">
        <div className="fixed inset-0 ambient-space-glows pointer-events-none z-0"></div>
        
        <main className="atmosphere-content p-6 md:p-8 min-h-screen w-full max-w-7xl mx-auto px-4 md:px-8 pt-6 relative z-10">
          <div className="max-w-md mx-auto py-16 px-4 text-center space-y-6 animate-fade-in text-left">
            <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-auroraMint/10 blur-xl"></div>
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-auroraMint/25 bg-[#0b0914]/80 text-auroraMint shadow-[0_0_24px_rgba(192,132,252,0.22)]">
                <LockKeyhole size={24} strokeWidth={2.2} />
              </div>
            </div>
            
            <div className="space-y-2 text-center">
              <h2 className="font-sans font-bold text-2xl text-white tracking-wide">進入全域身份工作室</h2>
              <p className="text-xs text-theme-text-muted font-light leading-relaxed max-w-sm mx-auto">
                工作室為私人名片創作空間。為了安全歸檔您的慢速玩家名片、頭像與常用英雄立繪，請先對接您的 Google 帳戶星軌。
              </p>
            </div>

            <div className="flex justify-center pt-2">
              <button 
                onClick={handleGoogleLogin}
                className="flex items-center space-x-2.5 h-10 px-6 rounded-full text-xs tracking-wide transition-all duration-300 font-sans text-white hover:text-white border border-white/10 hover:border-auroraMint/30 bg-white/[0.02] hover:bg-auroraMint/5 shadow-[0_4px_20px_rgba(0,0,0,0.4)] cursor-pointer"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                <span className="font-semibold">Continue with Google</span>
              </button>
            </div>

            <div className="pt-4 text-center text-[10px] text-theme-text-faint font-mono tracking-widest">
              SECURE SESSION • PRIVATE WORKSPACE
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ================= 2. 已登入的主入口狀態：玩家帳戶主控台 (editingGame === null) =================
  if (editingGame === null) {
    return (
      <div className="relative min-h-screen z-10 selection:bg-auroraMint/30 text-theme-text-strong max-w-4xl mx-auto px-4 py-8 space-y-12">
        <div className="fixed inset-0 ambient-space-glows pointer-events-none z-0"></div>

        <div className="relative z-10 space-y-12 w-full">
          {/* Toast */}
          {toast.show && (
            <div className="fixed bottom-6 right-6 z-50 max-w-md animate-fade-in">
              <div className="glass-panel border-auroraMint/30 p-4 rounded-xl shadow-[0_10px_30px_rgba(139,92,246,0.15)] flex items-start space-x-3 bg-[#050409]/95">
                <div className="w-5 h-5 rounded-full bg-auroraTeal/20 border border-auroraMint/50 flex items-center justify-center text-auroraMint mt-0.5 text-xs">✓</div>
                <div className="flex-1">
                  <p className="text-[10px] text-theme-text-muted font-mono tracking-widest">COSMIC SIGNAL</p>
                  <p className="text-xs text-white mt-1 font-sans leading-relaxed">{toast.message}</p>
                </div>
              </div>
            </div>
          )}

          {/* 頂部 Hub 標題 */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-black tracking-wider text-white flex items-center justify-center sm:justify-start gap-2.5">
                <Gamepad2 className="text-auroraMint animate-pulse" /> 玩家帳戶主控台
              </h1>
              <p className="text-theme-text-muted mt-1 text-xs font-mono tracking-wide uppercase">
                PLAYER IDENTITY STUDIO
              </p>
            </div>
          </div>

          {/* 上半部：通用個人檔案編輯區 */}
          <div className="glass-panel rounded-[24px] overflow-hidden relative border border-white/[0.03] p-6 md:p-8">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-auroraTeal/10 to-transparent rounded-bl-full pointer-events-none" />
            <h2 className="font-sans font-bold text-sm tracking-widest text-auroraMint uppercase mb-6 flex items-center gap-2 border-b border-white/5 pb-2">
              👤 通用個人檔案 // Global Profile
            </h2>
            
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* InteractiveAvatar 元件 */}
              <div className="shrink-0 flex flex-col items-center">
                <InteractiveAvatar
                  currentAvatarUrl={userProfile.avatar_url}
                  onAvatarChange={handleAvatarChange}
                  displayName={userProfile.display_name}
                />
                <p className="text-[10px] text-theme-text-muted mt-2 font-bold tracking-wider">
                  💡 點選頭像更換
                </p>
              </div>

              {/* 暱稱與簡介編輯表單 */}
              <div className="flex-1 w-full space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-theme-text-muted mb-1.5 block font-mono">通用帳戶暱稱</label>
                  <Input
                    placeholder="請輸入平台暱稱..."
                    className="bg-black/40 border-white/10 focus:border-auroraMint text-theme-text-body font-semibold text-sm rounded-xl focus:ring-1 focus:ring-auroraMint/30 h-10"
                    value={userProfile.display_name}
                    onChange={(e) => {
                      setUserProfile({ ...userProfile, display_name: e.target.value });
                    }}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-theme-text-muted mb-1.5 block font-mono">全域個人簡介</label>
                  <Textarea
                    placeholder="輸入一句話自我介紹，這將展現在所有關聯的名片上..."
                    className="bg-black/40 border-white/10 focus:border-auroraMint text-theme-text-body resize-none text-sm rounded-xl"
                    rows={2}
                    value={userProfile.bio || ""}
                    onChange={(e) => {
                      setUserProfile({ ...userProfile, bio: e.target.value });
                    }}
                  />
                </div>

                <div className="flex justify-between items-center pt-1">
                  <div className="flex items-center gap-2">
                    {/* Google 登出按鈕 */}
                    <button
                      onClick={handleGoogleLogout}
                      className="px-4 py-2 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-theme-danger-deep/20 hover:border-theme-danger/20 text-theme-danger-soft transition-all text-xs font-mono flex items-center gap-1.5 cursor-pointer"
                    >
                      LOGOUT / 登出
                    </button>

                    {/* 刪除帳號入口 */}
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-3 py-2 rounded-xl text-theme-text-faint hover:text-theme-danger-soft hover:bg-theme-danger-deep/10 transition-all text-[10px] font-mono cursor-pointer"
                    >
                      刪除帳號
                    </button>
                  </div>

                  <Button
                    onClick={handleSaveHub}
                    className="bg-auroraTeal hover:bg-auroraTeal/90 text-white font-extrabold text-xs px-6 py-4.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 border-none"
                  >
                    {hubSaved ? "✓ 儲存成功" : "儲存帳戶設定"}
                  </Button>
                </div>

                {/* 刪除帳號二次確認面板 */}
                {showDeleteConfirm && (
                  <div className="mt-3 rounded-xl border border-theme-danger/25 bg-theme-danger-deep/15 p-4 space-y-3">
                    <p className="text-xs text-theme-danger-soft font-bold">確定要刪除帳號嗎？</p>
                    <p className="text-[11px] text-theme-text-muted leading-relaxed">
                      這會永久刪除你的所有名片、暱稱與 Google 帳號連結，無法復原。
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleDeleteAccount}
                        disabled={deletingAccount}
                        className="px-4 py-2 rounded-xl bg-theme-danger hover:bg-theme-danger disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition-all cursor-pointer"
                      >
                        {deletingAccount ? "刪除中..." : "確認永久刪除"}
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={deletingAccount}
                        className="px-4 py-2 rounded-xl border border-white/10 text-theme-text-soft hover:bg-white/5 text-xs font-mono transition-all cursor-pointer"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 下半部：我的遊戲檔案庫 */}
          <div className="space-y-4">
            <h2 className="font-sans font-bold text-sm tracking-widest text-theme-text-soft uppercase px-1 font-mono">
              🗂️ 我的遊戲檔案庫 // Games Library
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 1. 🥞 鬥陣特工名片 - 已啟用且可編輯 */}
              <div className="glass-card border border-white/5 hover:border-auroraMint/30 rounded-[24px] p-5 shadow-sm hover:shadow-[0_0_20px_rgba(192,132,252,0.15)] hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between group cursor-default">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[20px] filter saturate-100 group-hover:scale-110 transition-transform">🥞</span>
                    <span className="bg-theme-success/10 border border-theme-success/25 text-theme-success-soft px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wider flex items-center gap-1 shadow-sm font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-theme-success animate-pulse" />
                      ACTIVE
                    </span>
                  </div>
                  
                  <h3 className="text-sm font-black text-theme-text-strong">鬥陣特工名片</h3>
                  <p className="text-[10px] text-theme-text-muted font-semibold mt-0.5 font-mono">Overwatch Identity</p>
                  
                  <div className="my-5 bg-black/40 border border-white/5 rounded-xl p-3 space-y-1 shadow-sm">
                    <div className="text-[9px] font-bold text-theme-text-muted uppercase font-mono">當前綁定玩家 // UID</div>
                    <div className="text-xs font-semibold text-theme-text-body truncate">{cardData.battle_tag || "未設定 (請點擊編輯)"}</div>
                    
                    {/* 英雄頭像預覽 */}
                    <div className="flex gap-1.5 mt-3">
                      {cardData.selected_heroes.filter(Boolean).map((heroId) => (
                        <div key={heroId} className="w-6 h-6 rounded-full overflow-hidden border border-white/10 bg-black/40 flex items-center justify-center shrink-0">
                          <img
                            src={`/images/heroes/avatars/${heroId}.png`}
                            alt={getCharacterImageAlt("ow", getHeroDisplayNameById("ow", heroId), "常用英雄縮圖")}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/heroes/silhouette.png';
                            }}
                          />
                        </div>
                      ))}
                      {cardData.selected_heroes.filter(Boolean).length === 0 && (
                        <span className="text-[9px] text-theme-text-faint italic font-mono">No heroes configured</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <Button
                  onClick={handleEnterOwEditor}
                  className="w-full bg-auroraTeal/10 hover:bg-auroraTeal border border-auroraTeal/20 text-auroraTeal hover:text-white py-2.5 text-xs font-bold rounded-xl transition-all duration-300 shadow-sm cursor-pointer"
                >
                  點擊編輯遊戲名片
                </Button>
              </div>

              {/* 2. 🎯 特戰英豪名片 - 尚未開放（GAME_AVAILABILITY.valorant） */}
              <div className="glass-card border border-white/5 hover:border-theme-danger/30 rounded-[24px] p-5 shadow-sm hover:shadow-[0_0_20px_rgba(244,63,94,0.15)] hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between group cursor-default">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[20px] filter saturate-100 group-hover:scale-110 transition-transform">🎯</span>
                    {GAME_AVAILABILITY.valorant ? (
                      <span className="bg-theme-danger/10 border border-theme-danger/25 text-theme-danger-soft px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wider flex items-center gap-1 shadow-sm font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-theme-danger animate-pulse" />
                        ACTIVE
                      </span>
                    ) : (
                      <span className="bg-white/5 border border-white/10 text-theme-text-faint px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wider flex items-center gap-1 shadow-sm font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-theme-text-faint" />
                        COMING SOON
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-sm font-black text-theme-text-strong">特戰英豪名片</h3>
                  <p className="text-[10px] text-theme-text-muted font-semibold mt-0.5 font-mono">Valorant Identity</p>

                  {GAME_AVAILABILITY.valorant ? (
                    <div className="my-5 bg-black/40 border border-white/5 rounded-xl p-3 space-y-1 shadow-sm">
                      <div className="text-[9px] font-bold text-theme-text-muted uppercase font-mono">當前綁定玩家 // UID</div>
                      <div className="text-xs font-semibold text-theme-text-body truncate">{valCardData.battle_tag || "未設定 (請點擊編輯)"}</div>

                      {/* 英雄頭像預覽 */}
                      <div className="flex gap-1.5 mt-3">
                        {valCardData.selected_heroes.filter(Boolean).map((heroId) => (
                          <div key={heroId} className="w-6 h-6 rounded-full overflow-hidden border border-white/10 bg-black/40 flex items-center justify-center shrink-0">
                            <img
                              src={`/images/heroes/avatars/val_${heroId}.png`}
                              alt={getCharacterImageAlt("val", getHeroDisplayNameById("val", heroId), "常用角色縮圖")}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/images/heroes/silhouette.png';
                              }}
                            />
                          </div>
                        ))}
                        {valCardData.selected_heroes.filter(Boolean).length === 0 && (
                          <span className="text-[9px] text-theme-text-faint italic font-mono">No agents configured</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="my-5 bg-black/20 border border-white/5 rounded-xl p-3 shadow-sm">
                      <p className="text-[10px] text-theme-text-faint font-semibold leading-relaxed font-sans">
                        新遊戲陣地建設中，敬請期待後續開放。
                      </p>
                    </div>
                  )}
                </div>
                
                {GAME_AVAILABILITY.valorant ? (
                  <Button
                    onClick={() => setEditingGame("val")}
                    className="w-full bg-theme-danger/10 hover:bg-theme-danger border border-theme-danger/20 text-theme-danger-soft hover:text-white py-2.5 text-xs font-bold rounded-xl transition-all duration-300 shadow-sm cursor-pointer"
                  >
                    點擊編輯遊戲名片
                  </Button>
                ) : (
                  <Button
                    disabled
                    className="w-full bg-white/[0.03] border border-white/10 text-theme-text-faint py-2.5 text-xs font-bold rounded-xl shadow-sm cursor-not-allowed"
                  >
                    敬請期待 // COMING SOON
                  </Button>
                )}
              </div>

              {/* 3. 👑 英雄聯盟名片 - 尚未開放（GAME_AVAILABILITY.lol） */}
              <div className="glass-card border border-white/5 hover:border-theme-info/30 rounded-[24px] p-5 shadow-sm hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between group cursor-default">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[20px] filter saturate-100 group-hover:scale-110 transition-transform">👑</span>
                    {GAME_AVAILABILITY.lol ? (
                      <span className="bg-theme-info/10 border border-theme-info/25 text-theme-info-soft px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wider flex items-center gap-1 shadow-sm font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-theme-info animate-pulse" />
                        ACTIVE
                      </span>
                    ) : (
                      <span className="bg-white/5 border border-white/10 text-theme-text-faint px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wider flex items-center gap-1 shadow-sm font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-theme-text-faint" />
                        COMING SOON
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-sm font-black text-theme-text-strong">英雄聯盟名片</h3>
                  <p className="text-[10px] text-theme-text-muted font-semibold mt-0.5 font-mono">League of Legends</p>

                  {GAME_AVAILABILITY.lol ? (
                    <div className="my-5 bg-black/40 border border-white/5 rounded-xl p-3 space-y-1 shadow-sm">
                      <div className="text-[9px] font-bold text-theme-text-muted uppercase font-mono">當前綁定玩家 // UID</div>
                      <div className="text-xs font-semibold text-theme-text-body truncate">{lolCardData.battle_tag || "未設定 (請點擊編輯)"}</div>

                      {/* 英雄頭像預覽 */}
                      <div className="flex gap-1.5 mt-3">
                        {lolCardData.selected_heroes.filter(Boolean).map((heroId) => (
                          <div key={heroId} className="w-6 h-6 rounded-full overflow-hidden border border-white/10 bg-black/40 flex items-center justify-center shrink-0">
                            <img
                              src={`/images/heroes/avatars/lol_${heroId}.png`}
                              alt={getCharacterImageAlt("lol", getHeroDisplayNameById("lol", heroId), "常用英雄縮圖")}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/images/heroes/silhouette.png';
                              }}
                            />
                          </div>
                        ))}
                        {lolCardData.selected_heroes.filter(Boolean).length === 0 && (
                          <span className="text-[9px] text-theme-text-faint italic font-mono">No champions configured</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="my-5 bg-black/20 border border-white/5 rounded-xl p-3 shadow-sm">
                      <p className="text-[10px] text-theme-text-faint font-semibold leading-relaxed font-sans">
                        新遊戲陣地建設中，敬請期待後續開放。
                      </p>
                    </div>
                  )}
                </div>
                
                {GAME_AVAILABILITY.lol ? (
                  <Button
                    onClick={() => setEditingGame("lol")}
                    className="w-full bg-theme-info/10 hover:bg-theme-info border border-theme-info/20 text-theme-info-soft hover:text-white py-2.5 text-xs font-bold rounded-xl transition-all duration-300 shadow-sm cursor-pointer"
                  >
                    點擊編輯遊戲名片
                  </Button>
                ) : (
                  <Button
                    disabled
                    className="w-full bg-white/[0.03] border border-white/10 text-theme-text-faint py-2.5 text-xs font-bold rounded-xl shadow-sm cursor-not-allowed"
                  >
                    敬請期待 // COMING SOON
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ================= 3. 進入特定名片編輯狀態 (editingGame !== null) =================
  return (
    <div className="relative min-h-screen z-10 selection:bg-auroraMint/30 text-theme-text-strong max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="fixed inset-0 ambient-space-glows pointer-events-none z-0"></div>

      {/* Toast */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md animate-fade-in">
          <div className="glass-panel border-auroraMint/30 p-4 rounded-xl shadow-[0_10px_30px_rgba(139,92,246,0.15)] flex items-start space-x-3 bg-[#050409]/95">
            <div className="w-5 h-5 rounded-full bg-auroraTeal/20 border border-auroraMint/50 flex items-center justify-center text-auroraMint mt-0.5 text-xs">✓</div>
            <div className="flex-1">
              <p className="text-[10px] text-theme-text-muted font-mono tracking-widest">COSMIC SIGNAL</p>
              <p className="text-xs text-white mt-1 font-sans leading-relaxed">{toast.message}</p>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 space-y-6 w-full">
        {/* 控制面板 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
          <button
            onClick={() => {
              setErrorMsg(null);
              setEditingGame(null);
            }}
            className={`inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-${colorClasses.primary}-500/50 text-theme-text-soft hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-all shadow-sm active:scale-95 cursor-pointer font-mono`}
          >
            <ArrowLeft size={14} className="stroke-[3]" />
            <span>返回帳戶主控台</span>
          </button>

          <div className={`${colorClasses.bg} border ${colorClasses.border} rounded-xl py-2 px-3 text-xs ${colorClasses.text} flex items-center gap-2 shadow-sm font-mono`}>
            <span>正在自訂：《{colorClasses.name}》專屬戰力名片</span>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-theme-danger/10 border border-theme-danger/20 text-theme-danger-soft px-4 py-3 rounded-2xl flex items-center gap-3 text-sm animate-shake">
            <AlertTriangle className="text-theme-danger shrink-0" size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 左右分割排版 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
          {/* 左側：名片即時預覽 */}
          <div className="lg:col-span-4 flex flex-col items-center gap-4 lg:sticky lg:top-24">
            <h2 className="text-[10px] font-bold tracking-widest text-theme-text-muted uppercase font-mono">即時名片預覽 // Live Preview</h2>
            
            <div className="share-card-export-surface rounded-[28px] overflow-hidden relative w-full max-w-[340px]">
              {editingGame === "ow" ? (
                <OWCard
                  cardData={cardData}
                  isLoggedIn={true}
                  isEditable={true}
                  renderMode="interactive"
                />
              ) : (
                <CosmicLivePreviewCard cardData={currentCard} gameType={editingGame} colorClasses={colorClasses} />
              )}
              
              {/* 點擊清空英雄立繪插槽按鈕 Overlay (專門對接 3 格常用立繪的✕清空) */}
              <div className="absolute top-[176px] left-5 right-5 grid grid-cols-3 h-[180px] pointer-events-none">
                {[0, 1, 2].map((idx) => {
                  const heroId = currentCard.selected_heroes[idx];
                  if (!heroId) return <div key={idx} />;
                  return (
                    <div key={idx} className="relative h-full w-full">
                      <button
                        type="button"
                        onClick={() => handleClearHeroSlot(idx)}
                        className="pointer-events-auto absolute top-2 right-2 z-40 w-5 h-5 bg-[#07040c]/90 text-[10px] text-theme-danger-soft hover:text-white rounded-full flex items-center justify-center border border-theme-danger/35 hover:border-theme-danger shadow-[0_0_10px_rgba(0,0,0,0.65)] active:scale-90 transition-all font-sans cursor-pointer"
                        title="清空此位置"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 保存與分享入口 */}
            <div className="w-full max-w-[340px] mt-2">
              <Link href={shareUrl} className="block w-full">
              <Button
                type="button"
                disabled={!user?.id}
                className="w-full bg-gradient-to-r from-auroraTeal to-auroraMint hover:from-auroraMint hover:to-auroraTeal border border-auroraMint/45 text-white rounded-xl py-3 px-3 text-xs font-black transition-all shadow-[0_0_22px_rgba(34,211,238,0.24)] hover:shadow-[0_0_30px_rgba(34,211,238,0.38)] active:scale-95 cursor-pointer flex items-center justify-center gap-2 font-mono"
              >
                <ExternalLink size={14} className="shrink-0" />
                <span>前往保存與分享</span>
              </Button>
              </Link>
            </div>

            <p className="text-[10px] text-theme-text-faint italic text-center max-w-[320px] mt-1 font-semibold leading-relaxed">
              ✨ 點擊預覽圖中英雄插槽右上角的「✕」可將其移去。
            </p>
          </div>

          {/* 右側：編輯表單 */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* SECTION 1: 玩家基礎設定 */}
            <div className="glass-panel p-6 rounded-2xl space-y-4 text-left border border-white/[0.03]">
              <h3 className="text-[10px] font-bold text-theme-text-muted uppercase tracking-widest border-b border-white/[0.04] pb-2 font-mono">
                🦁 玩家基礎設定 // Base Configs
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-theme-text-muted mb-1.5 block font-mono">BattleTag (遊戲ID)</label>
                  <Input
                    placeholder="例如: 愛喝奶茶#3342"
                    className={`bg-black/40 border-white/10 ${colorClasses.focusBorder} text-theme-text-body font-mono rounded-xl focus:ring-1 h-10`}
                    value={currentCard.battle_tag}
                    onChange={(e) => {
                      setErrorMsg(null);
                      setCard({ ...currentCard, battle_tag: e.target.value });
                    }}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-theme-text-muted mb-1.5 block font-mono">遊玩伺服器</label>
                  <select
                    className={`w-full bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-xs ${colorClasses.focusBorder} text-theme-text-body font-semibold h-10 focus:outline-none`}
                    value={currentCard.server}
                    onChange={(e) => setCard({ ...currentCard, server: e.target.value })}
                  >
                    {(editingGame === "ow" ? SERVER_OPTIONS : []).map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-obsidian text-theme-text-body font-semibold">
                        {opt.label}
                      </option>
                    ))}
                    {editingGame === "val" && ["亞太 (APAC)", "北美 (NA)", "歐洲 (EU)"].map((opt) => (
                      <option key={opt} value={opt} className="bg-obsidian text-theme-text-body font-semibold">
                        {opt}
                      </option>
                    ))}
                    {editingGame === "lol" && ["台灣 (TW)", "韓國 (KR)", "北美 (NA)"].map((opt) => (
                      <option key={opt} value={opt} className="bg-obsidian text-theme-text-body font-semibold">
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 「隱藏 BattleTag」開關暫不開放（is_tag_visible 欄位與遮蔽鏈保留，未來開放時加回 UI 即可） */}

              {/* 直接隱藏卡片（整張卡從廣場消失） */}
              <div className="bg-black/20 p-4.5 rounded-2xl border border-white/5 flex justify-between items-center shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                <div className="space-y-0.5 max-w-[80%]">
                  <span className="text-xs font-bold text-theme-text-body block font-sans">直接隱藏卡片 // Hidden Card</span>
                  <span className="text-[9px] text-theme-text-muted font-semibold block leading-relaxed font-sans">
                    開啟後，您的特工名片將直接從交友廣場（河道）中消失，其他玩家將無法瀏覽到您的任何資訊。
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setCard({ ...currentCard, is_card_visible: !(currentCard.is_card_visible ?? true) })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 cursor-pointer shadow-sm ${
                    currentCard.is_card_visible === false ? `bg-${colorClasses.primary}-500` : "bg-white/10"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      currentCard.is_card_visible === false ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[10px] font-bold text-theme-text-muted block font-mono">自我介紹留言 (限100字)</label>
                  <span className={`text-[9px] font-bold font-mono ${currentCard.message.length > 100 ? "text-theme-danger" : "text-theme-text-faint"}`}>
                    {currentCard.message.length} / 100
                  </span>
                </div>
                <Textarea
                  placeholder="GGWP！一起加油，推車到底啦 🚀"
                  className={`bg-black/40 border-white/10 ${colorClasses.focusBorder} text-theme-text-body resize-none text-xs rounded-xl`}
                  rows={2}
                  value={currentCard.message}
                  onChange={(e) => {
                    if (e.target.value.length <= 110) {
                      setCard({ ...currentCard, message: e.target.value });
                    }
                  }}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-theme-text-muted mb-2 block font-mono">語音溝通狀態</label>
                <div className="grid grid-cols-3 gap-2">
                  {MIC_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setCard({ ...currentCard, mic_status: opt.value as OWPlayerCard["mic_status"] })}
                      className={`text-[10px] font-bold py-2 rounded-xl border transition-all duration-300 cursor-pointer shadow-sm font-mono ${
                        currentCard.mic_status === opt.value
                          ? `${colorClasses.bg} ${colorClasses.border} text-white font-semibold`
                          : "bg-black/30 border-white/[0.04] text-theme-text-muted hover:text-white"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-theme-text-muted mb-1.5 block font-mono">MBTI 人格特質 (可選)</label>
                  <select
                    className={`w-full bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-xs ${colorClasses.focusBorder} text-theme-text-body font-semibold h-10 focus:outline-none`}
                    value={currentCard.mbti || ""}
                    onChange={(e) => setCard({ ...currentCard, mbti: e.target.value || undefined })}
                  >
                    <option value="" className="bg-obsidian text-theme-text-muted font-semibold">不公開 // Secret</option>
                    {MBTI_OPTIONS.map((opt) => (
                      <option key={opt} value={opt} className="bg-obsidian text-theme-text-body font-semibold">
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-[10px] font-bold text-theme-text-muted block font-mono">溝通語言 (最多 3 個)</label>
                    <span className="text-[9px] text-theme-text-faint font-normal font-mono">
                      已選 {(currentCard.languages || []).length} / 3
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {LANGUAGE_OPTIONS.map((lang) => {
                      const isSelected = (currentCard.languages || []).includes(lang);
                      return (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => handleToggleLanguage(lang)}
                          className={`text-[10px] font-bold px-2.5 py-1.5 rounded-xl border transition-all duration-300 cursor-pointer shadow-sm font-mono ${
                            isSelected
                              ? `${colorClasses.bg} ${colorClasses.border} text-white font-semibold`
                              : "bg-black/30 border-white/[0.04] text-theme-text-muted hover:text-white"
                          }`}
                        >
                          {lang}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: 常用英雄展示 (點擊填入插槽) */}
            <div className="glass-panel p-6 rounded-2xl space-y-4 text-left border border-white/[0.03]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/[0.04] pb-2">
                <h3 className="text-[10px] font-bold text-theme-text-muted uppercase tracking-widest flex items-center gap-1.5 font-mono">
                  <span>🛡️ 常用英雄展示 (最多 3 個) // Favorite Heroes</span>
                </h3>
                {/* 篩選標籤 */}
                {editingGame === "ow" && (
                  <div className="flex space-x-1 bg-black/40 p-0.5 rounded border border-white/5 text-[9px] font-mono">
                    {HERO_ROLE_FILTERS.map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setHeroRoleFilter(role)}
                        className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                          heroRoleFilter === role ? "bg-white/10 text-white font-bold" : "text-theme-text-muted hover:text-white"
                        }`}
                      >
                        {role === "All" ? "全部" : role === "Tank" ? "肉盾 🛡️" : role === "Dps" ? "攻擊 ⚔️" : "支援 ➕"}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 英雄頭像網格 */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 max-h-[320px] overflow-y-auto pr-1">
                {currentHeroesConfig.filter((hero) => {
                  if (editingGame !== "ow") return true;
                  if (heroRoleFilter === "All") return true;
                  if (heroRoleFilter === "Tank") return hero.role === "tank";
                  if (heroRoleFilter === "Dps") return hero.role === "damage";
                  return hero.role === "support";
                }).map((hero) => {
                  const isSelected = currentCard.selected_heroes.includes(hero.id);
                  return (
                    <button
                      key={hero.id}
                      type="button"
                      onClick={() => handleToggleHero(hero.id)}
                      className={`p-2 rounded-xl border flex flex-col items-center justify-center space-y-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? `${colorClasses.bg} ${colorClasses.border} text-white ${colorClasses.glow}`
                          : "bg-black/30 border-white/[0.03] text-theme-text-muted hover:text-white hover:border-white/10"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 bg-black/40 flex justify-center items-center shadow-sm">
                        <img 
                          src={editingGame === "ow" ? `/images/heroes/avatars/${hero.id}.png` : `/images/heroes/avatars/${editingGame}_${hero.id}.png`} 
                          alt={getCharacterImageAlt(editingGame, hero.name, "選擇縮圖")} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/heroes/silhouette.png';
                          }}
                        />
                      </div>
                      <span className="text-[9px] font-sans truncate w-full text-center tracking-wide">{hero.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECTION 3: 特色標籤選擇 */}
            <div className="glass-panel p-6 rounded-2xl space-y-3 text-left border border-white/[0.03]">
              <div className="flex justify-between text-[10px] font-bold text-theme-text-muted border-b border-white/[0.04] pb-2 font-mono">
                <span className="uppercase tracking-widest">🏷️ 特色標籤選擇 (最多 3 個) // Styles Labels</span>
                <span className="text-[9px] text-theme-text-faint font-normal font-mono">已選 {currentCard.tags.length}/3</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(editingGame === "ow" ? dbTags.map((tag) => tag.tag_name) : (editingGame === "val" ? ["慢節奏", "不計輸贏", "槍法流", "身法怪", "幽默特工", "深夜寂靜"] : ["孤寂流浪者", "浪漫主義", "歡樂ARAM", "峽谷隱士", "專精單線", "只玩大亂鬥"])).map((tagName) => {
                  const isSelected = currentCard.tags.includes(tagName);
                  return (
                    <button
                      key={tagName}
                      type="button"
                      onClick={() => handleToggleTag(tagName)}
                      className={`text-[10px] font-mono px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                        isSelected
                          ? `${colorClasses.bg} ${colorClasses.text} ${colorClasses.border} font-bold ${colorClasses.tagGlow}`
                          : "bg-white/[0.01] border-white/[0.06] text-theme-text-muted hover:text-white"
                      }`}
                    >
                      #{tagName}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECTION 4: 常用聯絡管道設定 */}
            <div className="glass-panel p-6 rounded-2xl space-y-3 text-left border border-white/[0.03]">
              <div className="flex justify-between text-[10px] font-bold text-theme-text-muted border-b border-white/[0.04] pb-2 font-mono">
                <span className="uppercase tracking-widest">💬 常用聯絡管道設定 (1~3個) // Contact Platforms</span>
                <span className="text-[9px] text-theme-text-faint font-normal font-mono">已選 {Object.keys(currentCard.social_channels || {}).length}/3</span>
              </div>
              <p className="text-[9px] text-theme-text-muted leading-relaxed">
                為落實寂靜低侵入社交宣言，系統在名片上僅以「展示發光圖標」呈現，不公開聯絡 ID 文字，以保護您的通訊隱私。點選即可啟動對應聯絡管道展示。
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {SOCIAL_PLATFORMS.map((platform) => {
                  const isActive = !!(currentCard.social_channels || {})[platform.id as keyof typeof currentCard.social_channels];
                  return (
                    <div
                      key={platform.id}
                      onClick={() => handleToggleSocial(platform.id)}
                      className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isActive
                          ? "bg-theme-accent-brand-deep/20 border-theme-accent-brand/50 shadow-[0_0_10px_rgba(168,85,247,0.1)]"
                          : "bg-black/30 border-white/[0.04] opacity-50 hover:opacity-80"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-base text-theme-accent-brand drop-shadow-[0_0_4px_rgba(168,85,247,0.4)]">
                          <SocialIcon platform={platform.id} className="w-5 h-5" />
                        </span>
                        <span className="text-xs text-theme-text-strong font-bold font-mono">{platform.label}</span>
                      </div>
                      <span className="text-[8px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-theme-text-muted font-mono">
                        {isActive ? "ACTIVE / 展示中" : "INACTIVE"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 儲存名片按鈕 */}
            <Button
              onClick={handleSaveCard}
              className={`w-full ${colorClasses.saveBtn} py-6 text-sm font-bold transition-all duration-300 active:scale-98 flex items-center justify-center gap-2 rounded-xl cursor-pointer`}
            >
              {saving ? "正在同步資料庫..." : saved ? "✓ 名片儲存成功！" : `儲存並發布我的${colorClasses.name}名片`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
