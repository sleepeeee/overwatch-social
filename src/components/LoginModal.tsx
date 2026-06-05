"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface LoginModalProps {
  show: boolean;
  onClose?: () => void;
  closable?: boolean;
  title?: string;
  description?: string;
}

export default function LoginModal({
  show,
  onClose,
  closable = true,
  title = "登入後才能使用此功能",
  description = "以 Google 帳號登入，建立你的特工名片並探索交友廣場",
}: LoginModalProps) {
  const [loginPending, setLoginPending] = useState(false);

  if (!show) return null;

  const handleLogin = async () => {
    if (loginPending) return;
    setLoginPending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      console.error("Google 登入失敗:", error.message);
      setLoginPending(false);
    }
  };

  // 配置主題樣式 (僅保留 Original / Baseline 樣式)
  let closeBtnClass = "absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-lg text-[#8c7c6c]/50 hover:text-[#5d4037] hover:bg-[#8c7c6c]/8 transition-all";
  let iconWrapperClass = "w-11 h-11 rounded-2xl bg-[#82b7cc]/12 border border-[#82b7cc]/25 flex items-center justify-center mx-auto text-[#82b7cc]";
  let titleClass = "text-sm font-bold text-[#3e2723] tracking-wide";
  let descClass = "text-[10.5px] text-[#8c7c6c] leading-relaxed";
  let loginBtnClass = "w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border border-[#8c7c6c]/20 bg-white/40 text-[10px] font-bold tracking-widest uppercase text-[#5d4037] hover:bg-white hover:border-[#82b7cc]/40 shadow-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={closable ? onClose : undefined}
      />

      {/* Modal 卡片 */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative glass-panel p-7 max-w-xs w-full space-y-4 text-center"
      >
        {closable && (
          <button
            onClick={onClose}
            className={closeBtnClass}
          >
            <X size={13} />
          </button>
        )}

        {/* 圖示 */}
        <div className={iconWrapperClass}>
          <svg viewBox="0 0 100 100" className="w-5 h-5 fill-current">
            <path d="M 50,75 C 34,68 36,55 50,35 C 64,55 66,68 50,75 Z" />
          </svg>
        </div>

        <div className="space-y-1.5">
          <h3 className={titleClass}>
            {title}
          </h3>
          <p className={descClass}>
            {description}
          </p>
        </div>

        <button
          onClick={handleLogin}
          disabled={loginPending}
          className={loginBtnClass}
        >
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.466 0-6.277-2.81-6.277-6.277 0-3.466 2.81-6.277 6.277-6.277 1.558 0 2.977.569 4.083 1.503l3.14-3.14C19.167 1.83 15.938 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.16 0 10.993-4.32 10.993-10.993 0-.616-.068-1.22-.178-1.78l-10.815-.422z" />
            <path fill="#4285F4" d="M23.055 10.422H12.24v3.978h6.887c-.287 1.071-.856 1.954-1.751 2.519l3.076 3.076c2.313-2.138 3.52-5.176 3.52-8.583 0-.312-.016-.65-.055-.99z" />
            <path fill="#34A853" d="M12.24 23.24c3.084 0 5.672-1.022 7.562-2.779l-3.076-3.076c-.856.574-1.954.915-3.076.915-2.519 0-4.662-1.704-5.413-4.114L5.033 17.26c1.879 3.543 5.568 5.98 9.878 5.98z" />
            <path fill="#FBBC05" d="M6.827 14.191c-.198-.574-.312-1.19-.312-1.83s.114-1.256.312-1.83L3.727 7.42C2.96 8.98 2.52 10.56 2.52 12.36s.44 3.38 1.207 4.94l3.1-3.109z" />
          </svg>
          {loginPending ? "跳轉中..." : "使用 Google 登入"}
        </button>
      </div>
    </div>
  );
}

