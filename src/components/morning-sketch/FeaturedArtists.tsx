"use client";

import React, { useState } from "react";
import { Heart, Copy, Check, ArrowRight } from "lucide-react";

interface Artist {
  name: string;
  tag: string;
  role: string;
  img: string;
  color: string;
}

interface FeaturedArtistsProps {
  styleMode: "A" | "B" | "AB";
}

export default function FeaturedArtists({ styleMode }: FeaturedArtistsProps) {
  const [likes, setLikes] = useState<Record<string, boolean>>({});
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const artists: Artist[] = [
    { name: "Hevelius", tag: "@hevelius", role: "Watercolor Artist", img: "/images/artist_hevelius.png", color: "from-[#82b7cc]/20 to-transparent" },
    { name: "Solange Riddle", tag: "@solangeriddle", role: "Illustrator", img: "/images/artist_solange.png", color: "from-rose-400/10 to-transparent" },
    { name: "Aurum Soleil", tag: "@aurumsoleil", role: "Concept Artist", img: "/images/artist_aurum.png", color: "from-[#f5d46b]/15 to-transparent" }
  ];

  const paletteColors = [
    { hex: "#8c7c6c", name: "暖灰沙" },
    { hex: "#a0a29f", name: "中灰水泥" },
    { hex: "#82b7cc", name: "莫蘭迪柔藍" },
    { hex: "#f5d46b", name: "薑黃" }
  ];

  const handleLike = (name: string) => {
    setLikes(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const handleCopyColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 1500);
  };

  const isStyleA = styleMode === "A";

  return (
    <div className="space-y-6 w-full">
      {/* 🌸 精選藝術家面板 */}
      <div 
        className="glass-panel p-6 w-full"
        style={{
          boxShadow: "0 10px 40px -10px rgba(var(--theme-accent-rgb), 0.08)"
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-sm font-black text-[#3e2723] uppercase tracking-widest leading-none">
              {isStyleA ? "FEATURED PROFILES" : "FEATURED ARTISTS"}
            </h2>
            <p className="text-[10px] font-black text-[#8c7c6c]/60 uppercase tracking-widest mt-1">
              {isStyleA ? "FEBRUARY MONTH FEATURED" : "View all active artists"}
            </p>
          </div>
          {!isStyleA && (
            <button className="text-[10px] font-black text-[#82b7cc] hover:text-[#82b7cc]/80 tracking-widest uppercase flex items-center gap-1.5 transition-colors">
              View All <ArrowRight size={10} />
            </button>
          )}
        </div>

        {/* 藝術家列表 */}
        <div className="space-y-4">
          {artists.map((artist) => {
            const isLiked = !!likes[artist.name];

            return (
              <div 
                key={artist.name}
                className="relative overflow-hidden rounded-2xl border border-[#8c7c6c]/10 bg-white/20 p-4 flex items-center justify-between transition-all duration-300 hover:border-[#82b7cc]/30 hover:bg-white/40 group shadow-[0_2px_8px_rgba(0,0,0,0.01)]"
              >
                {/* 漸變底色 */}
                <div className={`absolute inset-0 bg-gradient-to-r ${artist.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

                <div className="relative z-10 flex items-center gap-3.5">
                  {/* 精美水彩頭像 */}
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#8c7c6c]/10 shadow-sm relative">
                    <img 
                      src={artist.img} 
                      alt={artist.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>

                  <div>
                    <h3 className="text-xs font-black text-[#5d4037] tracking-wider leading-none">
                      {artist.name}
                    </h3>
                    <span className="text-[9px] font-extrabold text-[#8c7c6c]/60 tracking-wider">
                      {artist.tag}
                    </span>
                    {!isStyleA && (
                      <p className="text-[8px] font-black text-[#82b7cc] tracking-widest uppercase mt-1">
                        {artist.role}
                      </p>
                    )}
                  </div>
                </div>

                {/* 互動按鈕 */}
                <div className="relative z-10">
                  {isStyleA ? (
                    <button 
                      onClick={() => handleLike(artist.name)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-300 ${
                        isLiked 
                          ? "bg-rose-500/10 border-rose-500/30 text-rose-500 scale-110 shadow-sm" 
                          : "bg-white/40 border-[#8c7c6c]/15 text-[#8c7c6c] hover:border-[#8c7c6c]/40 hover:bg-white"
                      }`}
                    >
                      <Heart size={12} fill={isLiked ? "currentColor" : "none"} className={isLiked ? "animate-pulse" : ""} />
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleLike(artist.name)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[8px] font-black tracking-widest uppercase transition-all duration-300 ${
                        isLiked 
                          ? "bg-rose-500/10 border-rose-500/30 text-rose-500 scale-105 shadow-sm" 
                          : "bg-white/40 border-[#8c7c6c]/15 text-[#8c7c6c] hover:border-[#8c7c6c]/40 hover:bg-white"
                      }`}
                    >
                      <Heart size={10} fill={isLiked ? "currentColor" : "none"} />
                      {isLiked ? "Liked" : "Like"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 🎨 [風格 B/AB 專用] 實體色譜色塊展示卡片 */}
      {!isStyleA && (
        <div 
          className="glass-panel p-6 w-full relative overflow-hidden"
          style={{
            boxShadow: "0 10px 40px -10px rgba(var(--theme-accent-rgb), 0.08)"
          }}
        >
          <div className="space-y-1 mb-4">
            <h2 className="text-sm font-black text-[#3e2723] uppercase tracking-widest leading-none">
              Today's Palette
            </h2>
            <p className="text-[9px] font-black text-[#8c7c6c]/60 uppercase tracking-widest">
              點擊色塊複製 Hex 色碼
            </p>
          </div>

          {/* 色塊展示格格 */}
          <div className="grid grid-cols-4 gap-2.5">
            {paletteColors.map((color) => {
              const isCopied = copiedColor === color.hex;

              return (
                <button
                  key={color.hex}
                  onClick={() => handleCopyColor(color.hex)}
                  className="flex flex-col items-center gap-1.5 focus:outline-none group"
                >
                  <div 
                    className="w-full h-11 rounded-xl shadow-sm border border-[#8c7c6c]/10 relative flex items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md group-hover:scale-105"
                    style={{ backgroundColor: color.hex }}
                  >
                    {/* 懸浮時的複製標記 */}
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center text-white">
                      {isCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={12} />}
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-[8px] font-black text-[#3e2723] truncate w-[55px] tracking-wider leading-none">
                      {color.name}
                    </p>
                    <p className="text-[7.5px] font-mono font-bold text-[#8c7c6c]/80 uppercase mt-0.5 tracking-tighter">
                      {color.hex}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* 複製成功的 Toast 提示 */}
          {copiedColor && (
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-slate-900/80 text-white text-[9px] font-black tracking-wider uppercase backdrop-blur-sm border border-white/10 shadow-md animate-bounce">
              色碼 {copiedColor} 已複製！
            </div>
          )}
        </div>
      )}
    </div>
  );
}
