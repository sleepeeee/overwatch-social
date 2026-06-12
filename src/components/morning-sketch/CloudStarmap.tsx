"use client";

import React from "react";
import type { AnnouncementItem } from "@/types/homepage";

interface CloudStarmapProps {
  isOpen: boolean;
  onClose: () => void;
  announcements: AnnouncementItem[];
}

const DEFAULT_ANNOUNCEMENTS = [
  {
    num: "01",
    tag: "ADMIN'S COLUMN",
    title: "站長隨筆手札 ✍️",
    message: "給深夜還在線上的硬派玩家。在這裡，我們用名片點亮孤單的星空，幫助你找到能在耳麥裡分享勝負的靈魂伴侶。",
  },
  {
    num: "02",
    tag: "CHANGELOG",
    title: "最新改版日誌 🚀",
    message: "v0.12.0 大改版：首頁全面解耦鬥陣特攻，支持跨遊戲大廳！新增『每日幸友翻牌』與『揪團活動行事曆』。",
  },
  {
    num: "03",
    tag: "CONTACT US",
    title: "加入玩家語音 ✉️",
    message: "Discord 全局官方語音群已就緒！點擊頭像即可前往，與各路特工、召喚師與休閒大師一同暢聊開黑。",
  }
];

export function CloudStarmap({ isOpen, onClose, announcements }: CloudStarmapProps) {
  const displayAnnouncements =
    announcements && announcements.length > 0 ? announcements : DEFAULT_ANNOUNCEMENTS;

  // 優化後的星系圍繞排版配置 (錯落定位與微旋轉)
  const panelsConfig = [
    {
      num: "03",
      className: "right-[118%] top-[-15%]", // 往左上更外推
      x2: "-18%",
      y2: "10%",
      dx: "140px",
      dy: "100px",
      rotate: "-1.2deg",
      delay: "0ms",
    },
    {
      num: "02",
      className: "left-[122%] top-[-5%]", // 往右延伸，中置對稱
      x2: "122%",
      y2: "20%",
      dx: "-140px",
      dy: "80px",
      rotate: "1.5deg",
      delay: "100ms",
    },
    {
      num: "01",
      className: "right-[110%] bottom-[-18%]", // 往左下低置收縮
      x2: "-10%",
      y2: "82%",
      dx: "120px",
      dy: "-100px",
      rotate: "-1.5deg",
      delay: "200ms",
    },
  ];

  return (
    <>
      {/* 桌面版點擊空白收回的遮罩 - 動態控制 pointer-events */}
      <div 
        className={`hidden md:block fixed inset-0 z-10 cursor-default transition-all duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`} 
        onClick={onClose} 
      />

      {/* 手機版遮罩 - 條件渲染 */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40 animate-fade-in" 
          onClick={onClose} 
        />
      )}

      {/* ==================== 桌面版星圖 (md 以上) ==================== */}
      <div className={`hidden md:block absolute inset-0 pointer-events-none z-20 overflow-visible transition-opacity duration-500 ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}>
        {/* SVG 星軌與流光線層 */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
          {panelsConfig.map((cfg) => {
            const dataItem = displayAnnouncements.find(a => a.num === cfg.num);
            if (!dataItem) return null;
            return (
              <g key={`line-group-${cfg.num}`}>
                {/* 1. 底層星軌虛線 */}
                <line
                  x1="46.25%"
                  y1="43.125%"
                  x2={cfg.x2}
                  y2={cfg.y2}
                  className={`starmap-orbit-line ${isOpen ? "active" : ""}`}
                  style={{
                    transitionDelay: isOpen ? cfg.delay : "0ms",
                  }}
                />
                {/* 2. 頂層發光流動粒子 */}
                <line
                  x1="46.25%"
                  y1="43.125%"
                  x2={cfg.x2}
                  y2={cfg.y2}
                  className={`starmap-flow-line ${isOpen ? "active" : ""}`}
                  style={{
                    transitionDelay: isOpen ? cfg.delay : "0ms",
                  }}
                />
              </g>
            );
          })}
        </svg>

        {/* 資訊面板層 */}
        {panelsConfig.map((cfg) => {
          const dataItem = displayAnnouncements.find(a => a.num === cfg.num);
          if (!dataItem) return null;

          return (
            <div
              key={`panel-${cfg.num}`}
              className={`absolute ${cfg.className} w-[265px] lg:w-[290px] p-5 rounded-2xl border border-purple-500/20 bg-zinc-950/90 shadow-[0_0_30px_rgba(139,92,246,0.15)] starmap-panel ${
                isOpen ? "active" : ""
              }`}
              style={{
                "--cloud-dx": cfg.dx,
                "--cloud-dy": cfg.dy,
                "--panel-rotate": cfg.rotate,
                transitionDelay: isOpen ? cfg.delay : "0ms",
              } as React.CSSProperties}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono text-purple-300/80 tracking-widest font-semibold uppercase">
                    {dataItem.tag || "ANNOUNCEMENT"}
                  </span>
                  <span className="text-[9px] font-mono text-purple-400/50">
                    #{cfg.num}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-white leading-snug">
                  {dataItem.title}
                </h4>
                <p className="text-xs text-zinc-300 font-light leading-relaxed max-h-[100px] overflow-y-auto line-clamp-4 pr-1">
                  {dataItem.message}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ==================== 手機版 Bottom Sheet (md 以下) ==================== */}
      <div 
        className={`md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#06040a]/95 border-t border-purple-500/20 rounded-t-3xl p-6 pb-10 flex flex-col gap-5 transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${
          isOpen ? "translate-y-0 opacity-100 pointer-events-auto" : "translate-y-full opacity-0 pointer-events-none"
        } max-h-[80vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1 bg-zinc-800 rounded-full mx-auto mb-1 cursor-pointer" onClick={onClose} />
        
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <h3 className="text-xs font-mono text-purple-300 tracking-[0.2em] uppercase font-bold">
            AFTER MIDNIGHT 星圖選單
          </h3>
          <button 
            onClick={onClose}
            className="text-[10px] text-zinc-500 hover:text-zinc-300 font-mono tracking-wider"
          >
            CLOSE
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {panelsConfig.map((cfg) => {
            const dataItem = displayAnnouncements.find(a => a.num === cfg.num);
            if (!dataItem) return null;

            return (
              <div 
                key={`mobile-card-${cfg.num}`}
                className="bg-white/[0.01] border border-white/5 rounded-xl p-4 flex flex-col gap-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-mono text-purple-400 tracking-wider uppercase">
                    {dataItem.tag}
                  </span>
                  <span className="text-[8px] font-mono text-purple-400/40">
                    #{cfg.num}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white">
                  {dataItem.title}
                </h4>
                <p className="text-[11px] text-zinc-300 leading-relaxed font-light">
                  {dataItem.message}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
