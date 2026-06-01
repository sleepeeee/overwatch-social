"use client";

import { useState } from "react";
import { OWPlayerCard } from "@/types/card";
import { HEROES_CONFIG, PRESET_TAGS } from "@/data/mockPlayers";
import { Copy, Eye, EyeOff, Mic, MicOff, Globe, Sparkles } from "lucide-react";
import { SocialIcon } from "@/components/ui/SocialIcons";
import { HERO_ALIGNMENTS, DEFAULT_ALIGNMENT } from "@/data/heroAlignments";

interface OWCardProps {
  cardData: OWPlayerCard;
  isLoggedIn?: boolean;
  isEditable?: boolean;
  customAlignments?: Record<string, { scale: number; translateX: number; translateY: number }>;
}

export default function OWCard({ 
  cardData, 
  isLoggedIn = true, 
  isEditable = false,
  customAlignments
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

  // 🛡️ [Mitigation] 複製 BattleTag 強固保護
  const [copiedTagError, setCopiedTagError] = useState(false);

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
      // 未登入，阻斷複製，並顯示警告提示
      setCopiedTagError(true);
      setTimeout(() => setCopiedTagError(false), 2000);
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
      case 'steam':
        return 'bg-[#171a21] hover:bg-[#0c0e11] text-white';
      case 'x':
        return 'bg-[#0f1419] hover:bg-[#000000] text-white';
      case 'line':
        return 'bg-[#06C755] hover:bg-[#05b04b] text-white';
      default:
        return 'bg-gray-200 hover:bg-gray-300 text-gray-700';
    }
  };

  const getPlatformLabel = (platform: string) => {
    if (platform === 'x') return '𝕏';
    return platform.charAt(0).toUpperCase() + platform.slice(1);
  };

  return (
    <div className="relative w-full max-w-[420px] mx-auto bg-white/70 backdrop-blur-md border border-[#8c7c6c]/18 rounded-[24px] shadow-[0_15px_45px_rgba(140,124,108,0.06)] p-5 overflow-hidden transition-all duration-500 hover:border-[#82b7cc]/40 hover:shadow-[0_20px_50px_rgba(130,183,204,0.18)] hover:-translate-y-2 hover:scale-[1.015] flex flex-col justify-between group/card" style={{ fontFamily: "var(--font-sans), sans-serif" }}>
      
      {/* 頂部全息發光高光線 */}
      <div className="absolute top-0 right-0 h-[3px] w-24 bg-gradient-to-l from-[#82b7cc] via-[#f5d46b] to-transparent pointer-events-none" />

      <div className="flex justify-between items-center border-b border-dashed border-[#8c7c6c]/15 pb-3 mb-4 gap-2">
        <span className="text-[#8c7c6c]/80 font-extrabold text-[11px] sm:text-xs tracking-widest uppercase whitespace-nowrap shrink-0">Overwatch | 鬥陣特工</span>
        <span className="bg-[#82b7cc]/12 text-[#82b7cc] border border-[#82b7cc]/20 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black tracking-widest whitespace-nowrap shrink-0 uppercase">
          {server}
        </span>
      </div>

      <div className="flex justify-between items-center mb-4 px-1">
        <div className="flex items-center gap-2">
          <span className="text-[#5d4037] font-extrabold text-base md:text-lg tracking-tight">
            <span className="text-[#82b7cc] font-black">UID: </span>{getDisplayBattleTag()}
          </span>
          {/* 只要公開或是自己編輯，我們均提供複製按鈕（未登入時點擊會做安全攔截與登入暗示） */}
          {(isEditable || is_tag_visible) && battle_tag !== "已隱藏#xxxx" && (
            <button
              onClick={handleCopyTag}
              className="p-1 rounded-lg hover:bg-[#82b7cc]/10 text-[#8c7c6c] hover:text-[#82b7cc] transition-colors relative"
              title="複製 BattleTag"
            >
              <Copy size={16} />
              {copiedTag && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded shadow-md whitespace-nowrap z-50">
                  複製成功！
                </span>
              )}
              {copiedTagError && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] py-1 px-2 rounded shadow-md whitespace-nowrap z-50">
                  ⚠️ 請先登入帳號
                </span>
              )}
            </button>
          )}
        </div>
        
        {isEditable && (
          <div className="flex items-center text-xs text-[#8c7c6c] gap-1 bg-[#8c7c6c]/8 px-2.5 py-1 rounded-full border border-[#8c7c6c]/15">
            {is_tag_visible ? <Eye size={12} className="text-[#82b7cc]" /> : <EyeOff size={12} />}
            <span className="font-extrabold">{is_tag_visible ? "公開" : "隱藏"}</span>
          </div>
        )}
      </div>

      {/* 常用英雄展示區安全迴圈渲染 */}
      <div className="relative w-full h-[180px] bg-[#fdfaf3]/60 backdrop-blur-sm border border-[#8c7c6c]/10 rounded-2xl overflow-hidden mb-4 flex shadow-[inset_0_2px_8px_rgba(140,124,108,0.02)]">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(45deg, #8c7c6c 0, #8c7c6c 1px, transparent 0, transparent 50%)", backgroundSize: "10px 10px" }} />
        
        {[0, 1, 2].map((index) => {
          const heroId = selected_heroes[index];
          const heroInfo = heroId ? getHeroInfo(heroId) : null;
          const adj = heroId ? (customAlignments?.[heroId] || HERO_ALIGNMENTS[heroId] || DEFAULT_ALIGNMENT) : DEFAULT_ALIGNMENT;
          
          const imgStyle = {
            transform: `scale(${adj.scale}) translate(${adj.translateX}%, ${adj.translateY}%)`,
            transformOrigin: "top center",
          };
          
          return (
            <div key={index} className="relative flex-1 h-full border-r border-[#8c7c6c]/10 last:border-r-0 overflow-hidden group/hero">
              {heroInfo ? (
                <>
                  <span className="absolute bottom-2.5 left-2.5 text-[10px] font-extrabold text-[#5d4037] bg-white/85 px-2 py-0.5 rounded-lg border border-[#8c7c6c]/12 shadow-sm z-20 transition-all duration-300 group-hover/hero:bg-[#82b7cc] group-hover/hero:text-white group-hover/hero:border-[#82b7cc]">
                    {heroInfo.name}
                  </span>
                  
                  <div className="relative w-full h-[90%] flex justify-center items-start select-none transition-transform duration-500 group-hover/hero:scale-[1.05]">
                    <img
                      src={`/images/heroes/full/${heroInfo.id}.png`}
                      alt={heroInfo.name}
                      referrerPolicy="no-referrer"
                      style={imgStyle}
                      className="max-w-[185%] max-h-[135%] object-contain transition-all duration-500 z-10 filter drop-shadow-[0_4px_8px_rgba(140,124,108,0.15)] group-hover/hero:drop-shadow-[0_6px_12px_rgba(130,183,204,0.3)] select-none"
                      draggable="false"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/heroes/silhouette.png';
                      }}
                    />
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col justify-center items-center text-[#8c7c6c]/30 p-2 text-center">
                  <Sparkles size={20} className="mb-1 animate-pulse" />
                  <span className="text-[10px] font-bold">空欄位</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-4 px-1 min-h-[34px] items-center">
        {tags.length > 0 ? (
          tags.map((tagText, idx) => {
            const rotation = idx === 0 ? '-rotate-1' : idx === 1 ? 'rotate-1' : 'rotate-0';
            return (
              <span
                key={tagText}
                className={`inline-flex items-center text-xs font-black px-3 py-1 rounded-lg border shadow-sm transition-all duration-300 hover:scale-105 hover:rotate-0 ${rotation} ${getTagType(tagText)}`}
                style={{ fontFamily: "var(--font-sans), sans-serif" }}
              >
                {tagText.startsWith('#') ? tagText : `#${tagText}`}
              </span>
            );
          })
        ) : (
          <span className="text-xs text-[#8c7c6c]/60 italic font-bold">尚未設定標籤</span>
        )}
      </div>

      <div className="relative bg-[#fcf9f2]/90 border border-[#8c7c6c]/10 rounded-2xl p-3.5 mb-4 flex-grow flex flex-col justify-between shadow-[inset_0_1px_4px_rgba(140,124,108,0.02)]">
        <div className="text-[#8c7c6c] text-xs font-bold flex gap-1 items-start mb-2">
          <span className="text-sm leading-none">💬</span>
          <span className="text-[11px] uppercase tracking-widest text-[#8c7c6c]/80 font-black">留言</span>
        </div>
        <p className="text-[#5d4037] text-sm font-semibold leading-relaxed px-1 break-words line-clamp-3">
          {message || "這個玩家很懶，什麼都沒有留下..."}
        </p>
      </div>

      <div className="flex flex-col gap-3 pt-3 border-t border-dashed border-[#8c7c6c]/15 mt-auto">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1 text-xs text-[#5d4037] font-bold">
            <Globe size={14} className="text-[#8c7c6c] shrink-0" />
            <span className="inline-block truncate max-w-[110px] sm:max-w-[140px] align-middle text-[#8c7c6c]" title={languages.join('、')}>
              {languages.length > 0 ? languages.join('、') : "未設定"}
            </span>
            <div className="ml-1 pl-2 border-l border-[#8c7c6c]/15 flex items-center">
              {mic_status === 'mic-on' ? (
                <Mic size={14} className="text-emerald-600" aria-label="可開麥交流" />
              ) : mic_status === 'listen-only' ? (
                <Mic size={14} className="text-blue-500" aria-label="僅能聽麥" />
              ) : (
                <MicOff size={14} className="text-gray-400" aria-label="不用語音" />
              )}
            </div>
          </div>

          {mbti && (
            <span className="bg-[#82b7cc]/12 border border-[#82b7cc]/25 text-[#82b7cc] px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase">
              {mbti}
            </span>
          )}
        </div>

        {/* 🛡️ [Mitigation] 社交圖示安全容錯展示 (僅告知常用管道，不展示明文) */}
        <div className="flex items-center gap-2">
          {social_channels && Object.entries(social_channels).map(([platform, isEnabled]) => {
            if (!isEnabled) return null;
            
            return (
              <div 
                key={platform} 
                className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm border border-[#8c7c6c]/10 transition-all duration-300 hover:scale-110 select-none social-glow-btn social-glow-btn-${platform} ${getSocialIconStyle(platform)}`}
                title={`我經常使用 ${getPlatformLabel(platform)} 交流！`}
              >
                <SocialIcon platform={platform} className="w-4 h-4" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
