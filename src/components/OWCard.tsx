"use client";

import { useState } from "react";
import { OWPlayerCard } from "@/types/card";
import { HEROES_CONFIG, PRESET_TAGS } from "@/data/mockPlayers";
import { Copy, Eye, EyeOff, Mic, MicOff, Globe, Sparkles } from "lucide-react";
import { SocialIcon } from "@/components/ui/SocialIcons";
import { HERO_ALIGNMENTS, DEFAULT_ALIGNMENT } from "@/data/heroAlignments";
import { HeroCardBackground } from "./HeroCardBackground";
import { getHeroBackgroundConfig } from "@/data/heroBackgrounds";
import { useTheme } from "@/context/ThemeContext";

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
  const { theme } = useTheme();

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



  if (theme === "paper-card-social") {
    return (
      <div className="theme-card relative w-full max-w-[420px] mx-auto p-5 overflow-hidden flex flex-col justify-between group/card bg-[#FCFAF6] border-2 border-[#4A3E3D]" style={{ fontFamily: "var(--theme-font-family), sans-serif" }}>
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-20 h-5 bg-[#D4A373]/30 border-x-2 border-b-2 border-dashed border-[#4A3E3D] z-20 pointer-events-none" />
        <div className="flex justify-between items-center border-b-2 border-[#4A3E3D] pb-2 mb-3">
          <span className="font-extrabold text-[10px] tracking-wider text-[#4A3E3D]">特工手札 ID</span>
          <span className="theme-tag bg-[#E07A5F]/10 text-[#E07A5F] border border-[#4A3E3D] px-2 py-0.5 text-[9px] font-bold rounded">{server}</span>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {selected_heroes.slice(0, 3).map((heroId, index) => {
            const heroInfo = heroId ? getHeroInfo(heroId) : null;
            return (
              <div key={index} className="bg-white border border-[#4A3E3D] p-1 shadow-[2px_2px_0px_#4A3E3D] flex flex-col justify-between h-[120px] relative select-none">
                <div className="relative w-full h-[78%] bg-stone-100 overflow-hidden border border-stone-200">
                  {heroInfo ? (
                    <img src={`/images/heroes/full/${heroInfo.id}.png`} alt={heroInfo.name} className="w-full h-full object-cover scale-[1.6] translate-y-[12%]" draggable="false" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300"><Sparkles size={12} /></div>
                  )}
                </div>
                <span className="text-[9px] font-bold text-[#4A3E3D] text-center truncate pt-0.5">{heroInfo?.name || "待解鎖"}</span>
              </div>
            );
          })}
        </div>
        <div className="mb-2.5">
          <h4 className="font-extrabold text-xs text-[#4A3E3D] tracking-tight">玩家暱稱: {getDisplayBattleTag()}</h4>
        </div>
        <div className="theme-inner-panel relative bg-[#FAF0D7] border border-[#4A3E3D] p-3 mb-3.5 shadow-[2px_2px_0px_#4A3E3D] rotate-[-0.5deg]">
          <div className="absolute top-[-5px] left-3 w-3 h-3 rounded-full bg-red-500 border border-[#4A3E3D] shadow-sm" />
          <p className="text-[11px] font-bold text-[#4A3E3D] leading-relaxed pt-1">&ldquo;{message || "這裡空空如也，等特工寫下字跡..."}&rdquo;</p>
        </div>
        <div className="flex flex-wrap gap-1 mb-3.5 min-h-[26px] items-center">
          {tags.length > 0 ? tags.map((tagText) => (
            <span key={tagText} className="theme-tag bg-white border border-[#4A3E3D] px-2 py-0.5 text-[9px] font-bold shadow-[1px_1px_0px_#4A3E3D] hover:scale-105 rounded-sm">#{tagText}</span>
          )) : <span className="text-[9px] text-[#7c6d6c]/60 italic font-bold">未貼貼紙</span>}
        </div>
        <div className="flex justify-between items-center border-t border-[#4A3E3D] pt-2.5 mt-auto">
          <span className="text-[9px] font-bold text-[#4A3E3D]">🎤 {mic_status === "mic-on" ? "語音: 可開麥" : "語音: 不用麥"}</span>
          {(isEditable || is_tag_visible) && battle_tag !== "已隱藏#xxxx" && (
            <button onClick={handleCopyTag} className="theme-btn px-3 py-1 bg-[#E07A5F] hover:bg-[#D16B50] text-white text-[9px] font-black border border-[#4A3E3D] shadow-[2px_2px_0px_#4A3E3D] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[0px_0px_0px_#4A3E3D] relative transition-all cursor-pointer rounded-sm">
              {copiedTag ? "已蓋印章" : "複製資料"}
              {copiedTag && <span className="absolute -top-8 right-0 bg-gray-900 text-white text-[9px] py-1 px-2 rounded shadow-md whitespace-nowrap z-50">複製成功！</span>}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (theme === "cyber-matchmaking-hub") {
    const primaryHeroId = selected_heroes[0];
    const primaryHeroInfo = primaryHeroId ? getHeroInfo(primaryHeroId) : null;
    return (
      <div className="theme-card relative w-full max-w-[420px] mx-auto p-4 flex flex-col justify-between group/card bg-[#161b22] border border-[#30363d] rounded-none" style={{ fontFamily: "var(--theme-font-family), sans-serif" }}>
        <div className="cyber-corner-tl" />
        <div className="cyber-corner-tr" />
        <div className="cyber-corner-bl" />
        <div className="cyber-corner-br" />
        <div className="flex justify-between items-center text-[8px] border-b border-[#30363d] pb-1.5 mb-3 text-[#58a6ff] font-mono">
          <span>[SYS_MATCH: ACTIVE]</span>
          <span>LOC: {server.toUpperCase()}</span>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-3 border border-[#30363d] p-2 bg-[#0d1117]/60">
          <div className="flex flex-col gap-1 border-r border-[#30363d] pr-2">
            <div className="relative w-full h-[84px] bg-black/40 border border-[#30363d] overflow-hidden select-none">
              {primaryHeroInfo ? (
                <img src={`/images/heroes/full/${primaryHeroInfo.id}.png`} alt="主玩英雄" className="w-full h-full object-cover scale-[1.5] translate-y-[10%]" draggable="false" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#58a6ff]/20 text-[9px] font-mono">N/A</div>
              )}
              <div className="absolute inset-x-0 h-[1.5px] bg-[#58a6ff]/40 top-0 animate-[scan-animation_2s_linear_infinite]" />
            </div>
            <span className="text-[9px] font-bold text-slate-300 truncate pt-1 font-mono">ID: {getDisplayBattleTag()}</span>
          </div>
          <div className="flex flex-col justify-between text-[8px] gap-1 pl-1 font-mono">
            <div className="flex justify-between"><span className="text-[#8b949e]">GAME:</span><span className="text-slate-200">OW_2</span></div>
            <div className="flex justify-between"><span className="text-[#8b949e]">ROLE:</span><span className="text-slate-200 truncate max-w-[60px]">{primaryHeroInfo ? primaryHeroInfo.role.toUpperCase() : "UNKNOWN"}</span></div>
            <div className="flex justify-between"><span className="text-[#8b949e]">MBTI:</span><span className="text-[#58a6ff]">{mbti?.toUpperCase() || "UNKNOWN"}</span></div>
            <div className="flex justify-between"><span className="text-[#8b949e]">MIC:</span><span className={mic_status === "mic-on" ? "text-emerald-400" : "text-amber-500"}>{mic_status === "mic-on" ? "ON" : "OFF"}</span></div>
            <div className="flex justify-between border-t border-[#30363d] pt-1 mt-0.5"><span className="text-[#8b949e]">COMPAT:</span><span className="text-emerald-400 font-bold">96%</span></div>
          </div>
        </div>
        <div className="bg-[#0d1117] border border-[#30363d] p-2 text-[9px] mb-3 leading-relaxed min-h-[54px]">
          <span className="text-[#8b949e] block text-[7px] mb-0.5 font-mono">[LOG_MSG]</span>
          <p className="text-[#c9d1d9] font-sans">{message || "No console messages recorded..."}</p>
        </div>
        <div className="flex flex-wrap gap-1 mb-3.5 min-h-[24px] items-center font-mono">
          {tags.length > 0 ? tags.map((t) => (
            <span key={t} className="theme-tag text-[8px] border border-[#30363d] px-1.5 py-0.5 text-[#58a6ff]">[{t.toUpperCase()}]</span>
          )) : <span className="text-[8px] text-slate-600">[NO_TAGS]</span>}
        </div>
        <div className="w-full mt-auto">
          {(isEditable || is_tag_visible) && battle_tag !== "已隱藏#xxxx" && (
            <button onClick={handleCopyTag} className="theme-btn w-full py-1 text-center bg-transparent border border-[#58a6ff] hover:bg-[#58a6ff] hover:text-[#0d1117] text-[#58a6ff] text-[9px] font-bold uppercase transition-all tracking-wider relative cursor-pointer font-mono">
              {copiedTag ? "> COPY_SUCCESS <" : "> EXECUTE_CONNECT <"}
              {copiedTag && <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] py-1 px-2 rounded shadow-md whitespace-nowrap z-50 font-sans normal-case">複製成功！</span>}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="theme-card relative w-full max-w-[420px] mx-auto p-5 overflow-hidden flex flex-col justify-between group/card" style={{ fontFamily: "var(--theme-font-family), sans-serif" }}>
      <div className="absolute right-[-20px] bottom-[-20px] w-[180px] h-[180px] text-muted-foreground/5 pointer-events-none select-none z-0">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-full h-full">
          <path d="M12 2a10 10 0 0 1 7.54 16.59l-3.23-3.23A5.5 5.5 0 0 0 12 7.5a5.5 5.5 0 0 0-4.31 7.86L4.46 18.59A10 10 0 0 1 12 2z" />
          <path d="M7.78 19.34a7.5 7.5 0 0 0 8.44 0L12 15.12z" />
        </svg>
      </div>
      <div className="flex justify-between items-center border-b border-dashed border-border pb-3 mb-4 gap-2">
        <span className="text-muted-foreground/80 font-extrabold text-[11px] sm:text-xs tracking-widest uppercase whitespace-nowrap shrink-0">Overwatch | 鬥陣特工</span>
        <span className="bg-[#82b7cc]/12 text-[#82b7cc] border border-[#82b7cc]/20 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black tracking-widest whitespace-nowrap shrink-0 uppercase">
          {server}
        </span>
      </div>
      <div className="flex justify-between items-center mb-4 px-1">
        <div className="flex items-center gap-2">
          <span className="text-foreground font-extrabold text-base md:text-lg tracking-tight">
            <span className="text-[#82b7cc] font-black">UID: </span>{getDisplayBattleTag()}
          </span>
          {(isEditable || is_tag_visible) && battle_tag !== "已隱藏#xxxx" && (
            <button
              onClick={handleCopyTag}
              className="p-1 rounded-lg hover:bg-[#82b7cc]/10 text-muted-foreground hover:text-[#82b7cc] transition-colors relative cursor-pointer border-none bg-transparent"
              title="複製 BattleTag"
            >
              <Copy size={16} />
              {copiedTag && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded shadow-md whitespace-nowrap z-50">
                  複製成功！
                </span>
              )}
            </button>
          )}
        </div>
        {isEditable && (
          <div className="flex items-center text-xs text-muted-foreground gap-1 bg-muted/40 px-2.5 py-1 rounded-full border border-border">
            {is_tag_visible ? <Eye size={12} className="text-[#82b7cc]" /> : <EyeOff size={12} />}
            <span className="font-extrabold">{is_tag_visible ? "公開" : "隱藏"}</span>
          </div>
        )}
      </div>
      <div className="theme-inner-panel relative w-full h-[180px] overflow-hidden mb-4 flex watercolor-avatar-bg">
        {[0, 1, 2].map((index) => {
          const heroId = selected_heroes[index];
          const heroInfo = heroId ? getHeroInfo(heroId) : null;
          const adj = heroId ? (customAlignments?.[heroId] || HERO_ALIGNMENTS[heroId] || DEFAULT_ALIGNMENT) : DEFAULT_ALIGNMENT;
          const imgStyle = {
            transform: `scale(${adj.scale}) translate(${adj.translateX}%, ${adj.translateY}%)`,
            transformOrigin: "top center",
          };
          return (
            <div key={index} className="relative flex-1 h-full border-r border-dashed border-border last:border-r-0 overflow-hidden group/hero flex flex-col justify-between">
              {heroInfo ? (
                <>
                  {(() => {
                    const bgConfig = getHeroBackgroundConfig(heroInfo.id, heroInfo.role);
                    const badgeClass = bgConfig.theme === 'dark'
                      ? "absolute bottom-2.5 left-2.5 text-[10px] font-extrabold text-white bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10 shadow-sm z-20 transition-all duration-300 group-hover/hero:bg-[#82b7cc] group-hover/hero:border-[#82b7cc]"
                      : "absolute bottom-2.5 left-2.5 text-[10px] font-extrabold text-foreground bg-card/85 px-2 py-0.5 rounded-lg border border-border shadow-sm z-20 transition-all duration-300 group-hover/hero:bg-[#82b7cc] group-hover/hero:text-white group-hover/hero:border-[#82b7cc]";
                    return (
                      <>
                        <HeroCardBackground config={bgConfig} heroName={heroInfo.name} />
                        <span className={badgeClass}>{heroInfo.name}</span>
                      </>
                    );
                  })()}
                  <div className="relative w-full h-[90%] flex justify-center items-start select-none transition-transform duration-500 group-hover/hero:scale-[1.03] z-10">
                    <img
                      src={`/images/heroes/full/${heroInfo.id}.png`}
                      alt={heroInfo.name}
                      referrerPolicy="no-referrer"
                      style={imgStyle}
                      className="max-w-[185%] max-h-[135%] object-contain transition-all duration-500 filter drop-shadow-[0_6px_12px_rgba(0,0,0,0.18)] group-hover/hero:drop-shadow-[0_12px_24px_rgba(0,0,0,0.32)] select-none"
                      draggable="false"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/images/heroes/silhouette.png'; }}
                    />
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col justify-center items-center text-muted-foreground/30 p-2 text-center bg-card/10 backdrop-blur-[1px]">
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
          tags.map((tagText) => (
            <span
              key={tagText}
              className={`theme-tag inline-flex items-center text-xs font-black px-3 py-1 transition-all duration-300 hover:scale-[1.03] ${getTagType(tagText)}`}
              style={{ fontFamily: "var(--theme-font-family), sans-serif" }}
            >
              {tagText.startsWith('#') ? tagText : `#${tagText}`}
            </span>
          ))
        ) : (
          <span className="text-xs text-muted-foreground/60 italic font-bold">尚未設定標籤</span>
        )}
      </div>
      <div className="theme-inner-panel relative bg-card/95 p-3.5 mb-4 flex-grow flex flex-col justify-between">
        <div className="text-muted-foreground text-xs font-bold flex gap-1 items-start mb-2">
          <span className="text-sm leading-none">💬</span>
          <span className="text-[11px] uppercase tracking-widest text-muted-foreground/80 font-black">留言</span>
        </div>
        <p className="text-foreground text-sm font-semibold leading-relaxed px-1 break-words line-clamp-3">
          {message || "這個玩家很懶，什麼都沒有留下..."}
        </p>
      </div>
      <div className="flex flex-col gap-3 pt-3 border-t border-dashed border-border mt-auto">
        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-foreground font-bold min-w-0">
            <Globe size={14} className="text-muted-foreground shrink-0" />
            <span className="inline-block truncate max-w-[140px] sm:max-w-[170px] align-middle text-muted-foreground" title={languages.join('、')}>{languages.length > 0 ? languages.join('、') : "未設定"}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <div className={`flex items-center px-2 py-0.5 rounded-full text-[10px] font-black border transition-all select-none ${mic_status === 'mic-on' ? "bg-emerald-500/8 text-emerald-600 border-emerald-500/15" : mic_status === 'listen-only' ? "bg-blue-500/8 text-blue-600 border-blue-500/15" : "bg-gray-500/8 text-gray-500 border-gray-500/15"}`}>
              {mic_status === 'mic-on' ? <><Mic size={11} className="mr-0.5 shrink-0" /><span>可開麥</span></> : mic_status === 'listen-only' ? <><Mic size={11} className="mr-0.5 shrink-0" /><span>僅聽麥</span></> : <><MicOff size={11} className="mr-0.5 shrink-0" /><span>不用麥</span></>}
            </div>
            {mbti && <span className="bg-[#82b7cc]/12 border border-[#82b7cc]/25 text-[#82b7cc] px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase">{mbti}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {social_channels && Object.entries(social_channels).map(([platform, isEnabled]) => {
            if (!isEnabled) return null;
            return (
              <div 
                key={platform} 
                className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm border border-border transition-all duration-300 hover:scale-110 select-none ${getSocialIconStyle(platform)}`}
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
