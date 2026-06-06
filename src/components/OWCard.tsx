"use client";

import { useState } from "react";
import { OWPlayerCard } from "@/types/card";
import { HEROES_CONFIG, PRESET_TAGS } from "@/data/mockPlayers";
import { Copy, Eye, EyeOff, Mic, MicOff, Globe, Sparkles } from "lucide-react";
import { SocialIcon } from "@/components/ui/SocialIcons";
import { HERO_ALIGNMENTS, DEFAULT_ALIGNMENT } from "@/data/heroAlignments";
import { HeroCardBackground } from "./HeroCardBackground";
import { getHeroBackgroundConfig } from "@/data/heroBackgrounds";

interface OWCardProps {
  cardData: OWPlayerCard;
  isLoggedIn?: boolean;
  isEditable?: boolean;
  customAlignments?: Record<string, { scale: number; translateX: number; translateY: number }>;
  onLoginRequired?: () => void;
}

export default function OWCard({
  cardData,
  isLoggedIn = true,
  isEditable = false,
  customAlignments,
  onLoginRequired,
}: OWCardProps) {
  const [copiedTag, setCopiedTag] = useState(false);
  const [activeSocial, setActiveSocial] = useState<string | null>(null);
  const [copiedSocial, setCopiedSocial] = useState<string | null>(null);

  // 🛡️ [Mitigation] 強固解構，全面配置預設值，徹底阻斷型別缺失與空指針崩潰
  const {
    server = "Asia Server",
    battle_tag = "未知特工#0000",
    is_tag_visible = true,
    selected_heroes = [],
    tags = [],
    message = "",
    languages = [],
    mic_status = "mic-off",
    social_channels = {},
    mbti
  } = cardData || {};

  const handleCopyTag = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isEditable) {
      if (!battle_tag || battle_tag === "已隱藏#xxxx") return;
      navigator.clipboard.writeText(battle_tag);
      setCopiedTag(true);
      setTimeout(() => setCopiedTag(false), 2000);
      return;
    }

    if (!isLoggedIn) {
      onLoginRequired?.();
      return;
    }

    if (!is_tag_visible) return;
    if (!battle_tag || battle_tag === "已隱藏#xxxx") return;

    navigator.clipboard.writeText(battle_tag);
    setCopiedTag(true);
    setTimeout(() => setCopiedTag(false), 2000);
  };

  // 🛡️ [Mitigation] 複製社群帳號強固保護
  const handleCopySocial = (platform: string, account: string) => {
    if (!account) return;
    navigator.clipboard.writeText(account);
    setCopiedSocial(platform);
    setTimeout(() => setCopiedSocial(null), 2000);
  };

  // 🛡️ [Mitigation] 取得展示的 BattleTag (未登入遮罩 #****)
  const getDisplayBattleTag = () => {
    if (isEditable) return battle_tag;
    
    // 未登入狀態，物理遮罩 tag 數字
    if (!isLoggedIn) {
      if (battle_tag && battle_tag.includes("#")) {
        const [name] = battle_tag.split("#");
        return `${name}#****`;
      }
      return "未知特工#****";
    }

    // 已登入狀態下，若隱私設定為隱藏，顯示為已隱藏
    if (!is_tag_visible) {
      return "已隱藏#xxxx";
    }

    return battle_tag;
  };

  // 🛡️ [Mitigation] 常用英雄配置獲取強固邊界保護
  const getHeroInfo = (heroId: string) => {
    if (!heroId) return null;
    return HEROES_CONFIG.find((h) => h.id === heroId) || null;
  };

  const getTagType = (tagText: string) => {
    const preset = PRESET_TAGS.find((t) => t.text === tagText);
    const type = preset?.type || 'default';
    
    switch (type) {
      case 'info':
        return 'bg-[#82b7cc]/12 text-[#82b7cc] border-[#82b7cc]/20';
      case 'warning':
        return 'bg-[#d8a070]/12 text-[#d8a070] border-[#d8a070]/20';
      case 'success':
        return 'bg-emerald-500/8 text-emerald-600 border-emerald-500/15';
      case 'danger':
        return 'bg-red-500/8 text-red-600 border-red-500/15';
      default:
        return 'bg-[#8c7c6c]/8 text-[#8c7c6c] border-[#8c7c6c]/15';
    }
  };

  const getSocialIconStyle = (platform: string) => {
    switch (platform) {
      case 'discord':
        return 'bg-[#5865F2] hover:bg-[#4752c4] text-white';
      case 'steam': return 'bg-[#171a21] hover:bg-[#0c0e11] text-white';
      case 'x': return 'bg-[#0f1419] hover:bg-[#000000] text-white';
      case 'line': return 'bg-[#06C755] hover:bg-[#05b04b] text-white';
      default: return 'bg-gray-200 hover:bg-gray-300 text-gray-700';
    }
  };

  const getPlatformLabel = (platform: string) => {
    if (platform === 'x') return '𝕏';
    return platform.charAt(0).toUpperCase() + platform.slice(1);
  };



  return (
    <div 
      className="glass-card relative w-full max-w-[420px] mx-auto p-5 overflow-hidden flex flex-col justify-between group/card rounded-2xl border border-white/[0.05] hover:shadow-[0_0_30px_rgba(192,132,252,0.15)] transition-all duration-700" 
      style={{ fontFamily: "var(--theme-font-family), sans-serif" }}
    >
      {/* 頂部極光橘發光邊 */}
      <div className="absolute top-0 left-0 right-0 h-[2.5px] opacity-40 transition-opacity duration-700 group-hover/card:opacity-100 bg-amber-500"></div>

      {/* 浮水印 */}
      <div className="absolute right-[-20px] bottom-[-20px] w-[180px] h-[180px] text-white/[0.02] pointer-events-none select-none z-0">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-full h-full">
          <path d="M12 2a10 10 0 0 1 7.54 16.59l-3.23-3.23A5.5 5.5 0 0 0 12 7.5a5.5 5.5 0 0 0-4.31 7.86L4.46 18.59A10 10 0 0 1 12 2z" />
          <path d="M7.78 19.34a7.5 7.5 0 0 0 8.44 0L12 15.12z" />
        </svg>
      </div>

      {/* Header: Game Info */}
      <div className="flex justify-between items-center border-b border-white/[0.04] pb-3 mb-4 gap-2">
        <span className="text-zinc-400 font-bold text-[11px] sm:text-xs tracking-widest uppercase whitespace-nowrap shrink-0">Overwatch | 鬥陣特工</span>
        <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black tracking-widest whitespace-nowrap shrink-0 uppercase">
          {server}
        </span>
      </div>

      {/* Standalone UID Clipboard Box */}
      <div className="bg-black/40 border border-white/[0.03] rounded-xl p-3 flex items-center justify-between mb-4 relative z-10">
        <div className="flex flex-col">
          <span className="text-[9px] text-zinc-400 font-mono">UID</span>
          <span className="text-xs text-zinc-100 font-mono font-semibold select-all mt-0.5">{getDisplayBattleTag()}</span>
        </div>
        <div className="flex items-center gap-2">
          {(isEditable || is_tag_visible) && battle_tag !== "已隱藏#xxxx" && (
            <button
              onClick={handleCopyTag}
              className="p-1.5 rounded bg-white/[0.03] hover:bg-white/[0.08] text-zinc-300 hover:text-white transition-all border border-white/5 active:scale-95 flex items-center justify-center cursor-pointer relative"
              title="複製 BattleTag"
            >
              <Copy size={14} />
              {copiedTag && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded shadow-md whitespace-nowrap z-50">
                  複製成功！
                </span>
              )}
            </button>
          )}
          {isEditable && (
            <div className="flex items-center text-[10px] text-zinc-400 gap-1 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
              {is_tag_visible ? <Eye size={10} className="text-amber-400" /> : <EyeOff size={10} />}
              <span className="font-extrabold">{is_tag_visible ? "公開" : "隱藏"}</span>
            </div>
          )}
        </div>
      </div>

      {/* Hero Showcase Window */}
      <div className="relative w-full h-[180px] overflow-hidden mb-4 flex border border-white/[0.05] rounded-xl bg-black/20">
        {[0, 1, 2].map((index) => {
          const heroId = selected_heroes[index];
          const heroInfo = heroId ? getHeroInfo(heroId) : null;
          const adj = heroId ? (customAlignments?.[heroId] || HERO_ALIGNMENTS[heroId] || DEFAULT_ALIGNMENT) : DEFAULT_ALIGNMENT;
          const imgStyle = {
            transform: `scale(${adj.scale}) translate(${adj.translateX}%, ${adj.translateY}%)`,
            transformOrigin: "top center",
          };
          return (
            <div key={index} className="relative flex-1 h-full border-r border-white/[0.05] last:border-r-0 overflow-hidden group/hero flex flex-col justify-between">
              {heroInfo ? (
                <>
                  {(() => {
                    const bgConfig = getHeroBackgroundConfig(heroInfo.id, heroInfo.role);
                    return (
                      <>
                        <HeroCardBackground config={bgConfig} heroName={heroInfo.name} />
                        {/* 漸層底色遮罩，完美融合暗黑美學 */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10 pointer-events-none"></div>
                        {/* 懸浮角色名稱標籤 */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm border border-white/10 px-2 py-0.5 rounded-full text-center whitespace-nowrap z-20">
                          <span className="text-[8px] font-sans font-medium text-zinc-100 tracking-wide">{heroInfo.name}</span>
                        </div>
                      </>
                    );
                  })()}
                  <div className="relative w-full h-[90%] flex justify-center items-start select-none transition-transform duration-500 group-hover/hero:scale-[1.03] z-10">
                    <img
                      src={`/images/heroes/full/${heroInfo.id}.png`}
                      alt={heroInfo.name}
                      referrerPolicy="no-referrer"
                      style={imgStyle}
                      className="max-w-[185%] max-h-[135%] object-contain transition-all duration-500 filter drop-shadow-[0_6px_12px_rgba(0,0,0,0.5)] group-hover/hero:drop-shadow-[0_12px_24px_rgba(0,0,0,0.7)] select-none"
                      draggable="false"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/images/heroes/silhouette.png'; }}
                    />
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col justify-center items-center text-zinc-600 p-2 text-center bg-white/[0.005] opacity-60 hover:opacity-100 transition-opacity">
                  <span className="text-zinc-600 text-sm">✦</span>
                  <span className="text-[8px] font-mono text-zinc-400 tracking-wider mt-1">空欄位</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tags Section */}
      <div className="flex flex-wrap justify-center gap-1.5 mb-4 px-1 min-h-[34px] items-center">
        {tags.length > 0 ? (
          tags.map((tagText) => (
            <span
              key={tagText}
              className={`text-[9px] font-medium bg-zinc-800/40 border border-white/[0.04] text-zinc-200 rounded-full px-2.5 py-1 transition-all duration-300 hover:scale-[1.03]`}
              style={{ fontFamily: "var(--theme-font-family), sans-serif" }}
            >
              {tagText.startsWith('#') ? tagText : `#${tagText}`}
            </span>
          ))
        ) : (
          <span className="text-[10px] text-zinc-500 italic font-bold">尚未設定標籤</span>
        )}
      </div>

      {/* Whisper quote box */}
      <div className="bg-white/[0.015] border-l-2 border-auroraMint/40 p-3 rounded-r-lg mb-4 flex-grow flex flex-col justify-between">
        <div className="text-zinc-400 text-xs font-bold flex gap-1 items-start mb-1">
          <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-mono">留言 // Whisper</span>
        </div>
        <p className="text-zinc-200 text-[11px] leading-relaxed font-light font-sans italic px-1 break-words line-clamp-3">
          "{message || "這個玩家很慢速，什麼都沒有留下..."}"
        </p>
      </div>

      {/* Card Footer */}
      <div className="flex flex-col gap-3 pt-3 border-t border-white/[0.04] mt-auto">
        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-300 font-mono min-w-0">
            <span>🌐</span>
            <span className="inline-block truncate max-w-[140px] sm:max-w-[170px] align-middle text-zinc-400" title={languages.join('、')}>{languages.length > 0 ? languages.join('、') : "未設定"}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="flex items-center px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20 text-[8px] tracking-wide gap-1 select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span>
                {mic_status === 'mic-on' ? "可開麥" : mic_status === 'listen-only' ? "僅聽麥" : "不用麥"}
              </span>
            </div>
            {mbti && (
              <span className="bg-auroraMint/10 text-auroraMint border border-auroraMint/20 rounded px-1.5 py-0.5 text-[8px] font-bold font-mono">
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
                className={`w-7 h-7 rounded-full flex items-center justify-center shadow-sm border border-white/5 transition-all duration-300 hover:scale-110 select-none ${getSocialIconStyle(platform)}`}
                title={`我經常使用 ${getPlatformLabel(platform)} 交流！`}
              >
                <SocialIcon platform={platform} className="w-3.5 h-3.5" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
