"use client";

import React, { useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Camera, X, Check } from "lucide-react";

interface InteractiveAvatarProps {
  currentAvatarUrl: string;
  onAvatarChange: (newUrl: string) => void;
  displayName?: string;
}

const PRESET_AVATARS = [
  {
    url: "/images/avatars/avatar_female_elegant_square.png",
    name: "優雅玫瑰",
    description: "高貴冷豔的玫瑰藝術氣息",
  },
  {
    url: "/images/avatars/avatar_female_cheerful_square.png",
    name: "開朗女孩",
    description: "活潑耀眼的陽光插畫少女",
  },
  {
    url: "/images/avatars/avatar_male_calm_square.png",
    name: "沉靜型男",
    description: "冷靜專注的深邃氣質畫家",
  },
  {
    url: "/images/avatars/avatar_male_sunny_square.png",
    name: "陽光男孩",
    description: "溫暖爽朗的橘金色調特工",
  },
];

export default function InteractiveAvatar({
  currentAvatarUrl,
  onAvatarChange,
  displayName = "特工",
}: InteractiveAvatarProps) {
  const [open, setOpen] = useState(false);
  const [hoveredAvatar, setHoveredAvatar] = useState<string | null>(null);

  const handleSelectAvatar = (url: string) => {
    onAvatarChange(url);
    // 平滑關閉彈窗
    setTimeout(() => {
      setOpen(false);
    }, 200);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {/* 頭像 Trigger */}
      <Dialog.Trigger className="outline-none border-none bg-transparent p-0 cursor-pointer block group/avatar focus:ring-2 focus:ring-[#82b7cc]/50 focus:rounded-full">
        <div className="relative w-32 h-32 md:w-36 md:h-36 rounded-full p-1 bg-gradient-to-tr from-[#8c7c6c]/20 via-[#82b7cc]/40 to-[#f5d46b]/40 shadow-lg hover:shadow-[#82b7cc]/15 hover:scale-[1.03] transition-all duration-500">
          <div className="w-full h-full rounded-full overflow-hidden border border-white bg-white/40 backdrop-blur-md relative">
            <img
              src={currentAvatarUrl}
              alt={`玩家頭像：${displayName}`}
              className="w-full h-full object-cover select-none transition-transform duration-500 group-hover/avatar:scale-110"
              draggable="false"
            />
            {/* Hover 遮罩 */}
            <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px] opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center text-white transition-opacity duration-300">
              <Camera size={18} className="animate-bounce text-[#f5d46b]" />
              <span className="text-[10px] font-black tracking-widest mt-1 uppercase text-[#fdfaf3]">
                更換頭貼
              </span>
            </div>
          </div>
        </div>
      </Dialog.Trigger>

      {/* dialog 彈窗 */}
      <Dialog.Portal>
        {/* 背景遮罩 */}
        <Dialog.Backdrop className="fixed inset-0 bg-black/40 backdrop-blur-[4px] z-50 transition-opacity duration-300 data-[state=closed]:opacity-0 data-[state=open]:opacity-100" />
        
        {/* 彈窗主體 */}
        <Dialog.Popup className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md bg-white/70 backdrop-blur-2xl border border-[#8c7c6c]/20 rounded-[28px] p-6 shadow-[0_25px_60px_rgba(93,64,55,0.18)] z-50 transition-all duration-300 data-[state=closed]:opacity-0 data-[state=closed]:scale-95 data-[state=open]:opacity-100 data-[state=open]:scale-100 focus:outline-none">
          <div className="flex justify-between items-center mb-6">
            <div>
              <Dialog.Title className="text-lg font-extrabold text-[#3e2723] tracking-tight">
                更換特工頭像
              </Dialog.Title>
              <Dialog.Description className="text-xs text-[#8c7c6c] mt-0.5 font-semibold">
                選擇一張最符合您目前心情與氛圍的預設頭貼
              </Dialog.Description>
            </div>
            <Dialog.Close className="p-1.5 rounded-full bg-[#8c7c6c]/10 text-[#8c7c6c] hover:bg-red-50 hover:text-red-600 transition-colors border-none cursor-pointer focus:ring-1 focus:ring-red-300">
              <X size={16} />
            </Dialog.Close>
          </div>

          {/* 預設頭貼 4 欄 Grid */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {PRESET_AVATARS.map((avatar) => {
              const isSelected = currentAvatarUrl === avatar.url;
              return (
                <button
                  key={avatar.url}
                  onClick={() => handleSelectAvatar(avatar.url)}
                  onMouseEnter={() => setHoveredAvatar(avatar.url)}
                  onMouseLeave={() => setHoveredAvatar(null)}
                  className={`relative p-2.5 rounded-2xl border bg-white/40 transition-all duration-300 text-left cursor-pointer group flex flex-col items-center justify-center text-center outline-none ${
                    isSelected
                      ? "border-[#82b7cc] bg-white/80 shadow-md shadow-[#82b7cc]/10"
                      : "border-[#8c7c6c]/12 hover:border-[#82b7cc]/50 hover:bg-white/60"
                  }`}
                >
                  <div className="relative w-18 h-18 rounded-full overflow-hidden border border-white bg-white/50 mb-2">
                    <img
                      src={avatar.url}
                      alt={`玩家頭像選項：${avatar.name}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      draggable="false"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-[#82b7cc]/30 flex items-center justify-center">
                        <div className="bg-[#82b7cc] text-white p-0.5 rounded-full">
                          <Check size={12} className="stroke-[3]" />
                        </div>
                      </div>
                    )}
                  </div>
                  <span className={`text-xs font-black tracking-tight transition-colors duration-200 ${
                    isSelected ? "text-[#82b7cc]" : "text-[#5d4037]"
                  }`}>
                    {avatar.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 智慧預覽說明面板 */}
          <div className="bg-[#fcf9f2]/90 border border-[#8c7c6c]/10 rounded-2xl p-3 min-h-[56px] transition-all duration-300 flex flex-col justify-center">
            {hoveredAvatar ? (
              (() => {
                const info = PRESET_AVATARS.find((a) => a.url === hoveredAvatar);
                return (
                  <>
                    <span className="text-[10px] font-black tracking-wider text-[#82b7cc] uppercase">智慧預覽</span>
                    <p className="text-[11px] font-semibold text-[#8c7c6c] mt-0.5">{info?.description}</p>
                  </>
                );
              })()
            ) : (
              <>
                <span className="text-[10px] font-black tracking-wider text-[#8c7c6c] uppercase">當前選擇</span>
                <p className="text-[11px] font-semibold text-[#8c7c6c] mt-0.5">
                  {PRESET_AVATARS.find((a) => a.url === currentAvatarUrl)?.description || "無頭貼說明"}
                </p>
              </>
            )}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
