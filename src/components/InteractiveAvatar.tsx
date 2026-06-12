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
    name: "靜夜",
  },
  {
    url: "/images/avatars/avatar_female_cheerful_square.png",
    name: "暖燈",
  },
  {
    url: "/images/avatars/avatar_male_calm_square.png",
    name: "沉夜",
  },
  {
    url: "/images/avatars/avatar_male_sunny_square.png",
    name: "白夜",
  },
];

export default function InteractiveAvatar({
  currentAvatarUrl,
  onAvatarChange,
  displayName = "特工",
}: InteractiveAvatarProps) {
  const [open, setOpen] = useState(false);

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
      <Dialog.Trigger className="outline-none border-none bg-transparent p-0 cursor-pointer block group/avatar focus:ring-2 focus:ring-violet-300/45 focus:rounded-full">
        <div className="relative w-32 h-32 md:w-36 md:h-36 rounded-full p-1 bg-gradient-to-tr from-white/10 via-violet-300/35 to-fuchsia-300/20 shadow-lg hover:shadow-violet-500/18 hover:scale-[1.03] transition-all duration-500">
          <div className="w-full h-full rounded-full overflow-hidden border border-white/12 bg-[#070611]/70 backdrop-blur-md relative">
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
        <Dialog.Backdrop className="fixed inset-0 bg-[#030206]/72 backdrop-blur-[6px] z-50 transition-opacity duration-300 data-[state=closed]:opacity-0 data-[state=open]:opacity-100" />
        
        {/* 彈窗主體 */}
        <Dialog.Popup className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md bg-[#070611]/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-[0_24px_70px_rgba(0,0,0,0.58)] z-50 transition-all duration-300 data-[state=closed]:opacity-0 data-[state=closed]:scale-95 data-[state=open]:opacity-100 data-[state=open]:scale-100 focus:outline-none">
          <div className="flex justify-between items-center mb-5">
            <div className="min-w-0">
              <Dialog.Title className="text-base font-bold text-zinc-100 tracking-tight">
                選擇頭貼
              </Dialog.Title>
              <Dialog.Description className="sr-only">
                從四張預設頭貼中選擇一張作為目前玩家頭像。
              </Dialog.Description>
            </div>
            <Dialog.Close className="p-2 rounded-full bg-white/[0.06] text-theme-text-muted hover:bg-white/[0.1] hover:text-theme-text-strong transition-colors border border-white/[0.04] cursor-pointer focus:outline-none focus:ring-2 focus:ring-theme-accent-brand/40">
              <X size={16} />
            </Dialog.Close>
          </div>

          {/* 預設頭貼 4 欄 Grid */}
          <div className="grid grid-cols-2 gap-3">
            {PRESET_AVATARS.map((avatar) => {
              const isSelected = currentAvatarUrl === avatar.url;
              return (
                <button
                  key={avatar.url}
                  onClick={() => handleSelectAvatar(avatar.url)}
                  className={`relative p-3 rounded-2xl border transition-all duration-200 text-left cursor-pointer group flex flex-col items-center justify-center text-center outline-none ${
                    isSelected
                      ? "border-violet-300/65 bg-violet-300/[0.12] shadow-[0_0_0_1px_rgba(196,181,253,0.14),0_12px_30px_rgba(91,33,182,0.22)]"
                      : "border-white/[0.07] bg-white/[0.035] hover:border-violet-200/35 hover:bg-white/[0.07]"
                  }`}
                >
                  <div className={`relative w-20 h-20 rounded-full overflow-hidden border mb-2.5 transition-transform duration-200 group-hover:scale-[1.03] ${
                    isSelected ? "border-violet-200/80" : "border-white/15"
                  }`}>
                    <img
                      src={avatar.url}
                      alt={`玩家頭像選項：${avatar.name}`}
                      className="w-full h-full object-cover"
                      draggable="false"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-[#080610]/34 flex items-center justify-center">
                        <div className="bg-violet-300 text-[#080610] p-1 rounded-full shadow-[0_0_18px_rgba(196,181,253,0.55)]">
                          <Check size={12} className="stroke-[3]" />
                        </div>
                      </div>
                    )}
                  </div>
                  <span className={`text-xs font-black tracking-tight transition-colors duration-200 ${
                    isSelected ? "text-violet-200" : "text-zinc-300"
                  }`}>
                    {avatar.name}
                  </span>
                </button>
              );
            })}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
