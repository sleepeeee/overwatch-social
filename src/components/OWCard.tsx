"use client";

import { useState } from "react";
import { OWPlayerCard } from "@/types/card";
import { HEROES_CONFIG, PRESET_TAGS } from "@/data/mockPlayers";
import { Copy, Eye, EyeOff, Mic, MicOff, Globe, Sparkles } from "lucide-react";

interface OWCardProps {
  cardData: OWPlayerCard;
  isLoggedIn?: boolean;
  isEditable?: boolean;
}

export default function OWCard({ cardData, isLoggedIn = true, isEditable = false }: OWCardProps) {
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
  const handleCopyTag = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoggedIn && !isEditable) return;
    if (!is_tag_visible && !isEditable) return;
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
        return 'bg-[#e0f2fe] text-[#0369a1] border-[#bae6fd]';
      case 'warning':
        return 'bg-[#fef3c7] text-[#b45309] border-[#fde68a]';
      case 'success':
        return 'bg-[#dcfce7] text-[#15803d] border-[#bbf7d0]';
      case 'danger':
        return 'bg-[#fee2e2] text-[#b91c1c] border-[#fecaca]';
      default:
        return 'bg-[#f3f4f6] text-[#374151] border-[#e5e7eb]';
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
    <div className="relative w-full max-w-[420px] mx-auto bg-[#f6ecd5] border-[3px] border-[#8d6e63] rounded-2xl shadow-xl p-5 overflow-hidden transition-all duration-500 hover:border-[#d87040] hover:shadow-[0_15px_35px_rgba(216,112,64,0.35)] hover:-translate-y-1.5 flex flex-col justify-between" style={{ fontFamily: "Georgia, serif" }}>
      
      <div className="flex justify-between items-center border-b border-dashed border-[#a1887f] pb-3 mb-4">
        <span className="text-[#5d4037] font-bold text-sm tracking-widest uppercase">Overwatch | 鬥陣特工</span>
        <span className="bg-[#8d6e63] text-[#f6ecd5] px-3 py-0.5 rounded-full text-xs font-semibold tracking-wide">
          {server}
        </span>
      </div>

      <div className="flex justify-between items-center mb-4 px-1">
        <div className="flex items-center gap-2">
          <span className="text-[#3e2723] font-extrabold text-lg md:text-xl tracking-tight">
            {is_tag_visible || isEditable ? (
              <>
                <span className="text-[#d87040]">UID: </span>{battle_tag}
              </>
            ) : (
              <>
                <span className="text-gray-500">UID: 已隱藏</span>
                <span className="text-gray-400 text-sm">#xxxx</span>
              </>
            )}
          </span>
          {(is_tag_visible || isEditable) && battle_tag !== "已隱藏#xxxx" && (isLoggedIn || isEditable) && (
            <button
              onClick={handleCopyTag}
              className="p-1 rounded-md hover:bg-[#e8dcbe] text-[#5d4037] transition-colors relative"
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
          <div className="flex items-center text-xs text-gray-500 gap-1 bg-[#e8dcbe] px-2 py-0.5 rounded-full">
            {is_tag_visible ? <Eye size={12} className="text-[#d87040]" /> : <EyeOff size={12} />}
            <span>{is_tag_visible ? "公開" : "隱藏"}</span>
          </div>
        )}
      </div>

      {/* 常用英雄展示區安全迴圈渲染 */}
      <div className="relative w-full h-[180px] bg-[#eedebc] border border-[#d7ccc8] rounded-xl overflow-hidden mb-4 flex">
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)", backgroundSize: "10px 10px" }} />
        
        {[0, 1, 2].map((index) => {
          const heroId = selected_heroes[index];
          const heroInfo = heroId ? getHeroInfo(heroId) : null;
          
          return (
            <div key={index} className="relative flex-1 h-full border-r border-[#d7ccc8] last:border-r-0 flex flex-col justify-end items-center pb-2 overflow-hidden group">
              {heroInfo ? (
                <>
                  <span className="absolute top-2 left-2 text-[10px] font-bold text-[#5d4037] bg-[#f6ecd5]/80 px-1.5 py-0.5 rounded border border-[#d7ccc8] z-20">
                    {heroInfo.name}
                  </span>
                  
                  <div className="relative w-full h-[90%] flex justify-center items-end select-none">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={heroInfo.imageUrl}
                      alt={heroInfo.name}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      decoding="async"
                      className="max-w-[140%] max-h-[110%] object-contain origin-bottom transition-all duration-300 group-hover:scale-105 z-10"
                      draggable="false"
                    />
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col justify-center items-center text-[#8d6e63]/40 p-2 text-center">
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
            const rotation = idx === 0 ? '-rotate-2' : idx === 1 ? 'rotate-1' : 'rotate-2';
            return (
              <span
                key={tagText}
                className={`inline-flex items-center text-xs font-bold px-3 py-1 rounded-md border-2 shadow-sm transition-transform duration-200 hover:scale-105 hover:rotate-0 ${rotation} ${getTagType(tagText)}`}
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {tagText.startsWith('#') ? tagText : `#${tagText}`}
              </span>
            );
          })
        ) : (
          <span className="text-xs text-gray-400 italic">尚未設定標籤</span>
        )}
      </div>

      <div className="relative bg-[#eedebc]/70 border border-[#d7ccc8] rounded-xl p-3 mb-4 flex-grow flex flex-col justify-between">
        <div className="text-[#4e342e] text-xs font-bold flex gap-1 items-start mb-2">
          <span className="text-base leading-none">💬</span>
          <span className="text-[11px] uppercase tracking-wider text-gray-500">留言</span>
        </div>
        <p className="text-[#3e2723] text-sm font-semibold leading-relaxed px-1 break-words line-clamp-3">
          {message || "這個玩家很懶，什麼都沒有留下..."}
        </p>
      </div>

      <div className="flex flex-col gap-3 pt-2 border-t border-dashed border-[#a1887f] mt-auto">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5 text-xs text-[#5d4037] font-bold">
            <Globe size={14} className="text-[#8d6e63]" />
            <span className="truncate max-w-[150px]">
              {languages.length > 0 ? languages.join('、') : "未設定"}
            </span>
            <div className="ml-1 pl-2 border-l border-[#a1887f] flex items-center">
              {mic_status === 'mic-on' ? (
                <Mic size={14} className="text-green-600" aria-label="可開麥交流" />
              ) : mic_status === 'listen-only' ? (
                <Mic size={14} className="text-blue-500" aria-label="僅能聽麥" />
              ) : (
                <MicOff size={14} className="text-gray-400" aria-label="不用語音" />
              )}
            </div>
          </div>

          {mbti && (
            <span className="bg-[#eedebc] border border-[#8d6e63] text-[#5d4037] px-2 py-0.5 rounded text-[11px] font-bold tracking-widest">
              {mbti}
            </span>
          )}
        </div>

        {/* 🛡️ [Mitigation] 社交圖示安全容錯與隱私保護渲染 */}
        <div className="flex items-center gap-2 relative">
          {social_channels && Object.entries(social_channels).map(([platform, account]) => {
            if (!account) return null;
            const isOpen = activeSocial === platform;
            
            return (
              <div key={platform} className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveSocial(isOpen ? null : platform);
                  }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center shadow transition-all duration-200 scale-100 hover:scale-110 active:scale-95 ${getSocialIconStyle(platform)}`}
                  title={`${getPlatformLabel(platform)} 帳號`}
                >
                  <span className="text-xs font-black">
                    {platform === 'discord' ? '👾' : platform === 'steam' ? '🎮' : platform === 'x' ? '𝕏' : '💬'}
                  </span>
                </button>

                {isOpen && (
                  <div 
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-gray-900 border border-gray-800 text-white rounded-lg shadow-2xl p-3 z-50 flex flex-col gap-2 min-w-[200px]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
                    
                    <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold border-b border-gray-800 pb-1">
                      <span>{getPlatformLabel(platform)} 聯絡管道</span>
                      <button 
                        onClick={() => setActiveSocial(null)}
                        className="text-gray-500 hover:text-white"
                      >
                        ✕
                      </button>
                    </div>

                    {isLoggedIn ? (
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-mono font-bold break-all select-all text-orange-400 bg-gray-950 px-2 py-1 rounded">
                          {account}
                        </span>
                        <button
                          onClick={() => handleCopySocial(platform, account)}
                          className="w-full bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-bold py-1 rounded transition-colors"
                        >
                          {copiedSocial === platform ? "✓ 複製成功！" : "一鍵複製"}
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-1">
                        <p className="text-[11px] text-yellow-500 font-bold">⚠️ 請先登入帳號</p>
                        <p className="text-[9px] text-gray-500 mt-0.5">登入後即可複製聯絡資訊</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {activeSocial && (
        <div 
          className="fixed inset-0 z-40 pointer-events-auto" 
          onClick={() => setActiveSocial(null)} 
        />
      )}
    </div>
  );
}
