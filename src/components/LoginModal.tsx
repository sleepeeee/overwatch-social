"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "@/context/ThemeContext";

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
  const { theme } = useTheme();

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

  // 配置各主題樣式
  let closeBtnClass = "absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-lg text-[#8c7c6c]/50 hover:text-[#5d4037] hover:bg-[#8c7c6c]/8 transition-all";
  let iconWrapperClass = "w-11 h-11 rounded-2xl bg-[#82b7cc]/12 border border-[#82b7cc]/25 flex items-center justify-center mx-auto text-[#82b7cc]";
  let titleClass = "text-sm font-bold text-[#3e2723] tracking-wide";
  let descClass = "text-[10.5px] text-[#8c7c6c] leading-relaxed";
  let loginBtnClass = "w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border border-[#8c7c6c]/20 bg-white/40 text-[10px] font-bold tracking-widest uppercase text-[#5d4037] hover:bg-white hover:border-[#82b7cc]/40 shadow-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed";

  if (theme === "soft-midnight-lounge") {
    closeBtnClass = "absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all";
    iconWrapperClass = "w-11 h-11 rounded-full bg-[#a78bfa]/10 border border-[#a78bfa]/25 flex items-center justify-center mx-auto text-[#a78bfa]";
    titleClass = "text-sm font-bold text-slate-200 tracking-wider";
    descClass = "text-[10.5px] text-slate-400 leading-relaxed";
    loginBtnClass = "w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-[#a78bfa]/40 bg-transparent text-[10px] font-bold tracking-widest uppercase text-[#a78bfa] hover:bg-[#a78bfa]/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed";
  } else if (theme === "paper-card-social") {
    closeBtnClass = "absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-sm text-[#4A3E3D]/50 hover:text-[#4A3E3D] hover:bg-[#FAF0D7] transition-all border border-transparent hover:border-[#4A3E3D]";
    iconWrapperClass = "w-11 h-11 rounded-sm bg-[#E07A5F]/10 border-2 border-[#4A3E3D] flex items-center justify-center mx-auto text-[#E07A5F]";
    titleClass = "text-sm font-extrabold text-[#4A3E3D] tracking-tight";
    descClass = "text-[10.5px] text-[#7C6D6C] leading-relaxed font-bold";
    loginBtnClass = "w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-sm border-2 border-[#4A3E3D] bg-[#E07A5F] text-[10px] font-black tracking-widest uppercase text-white hover:bg-[#D16B50] shadow-[2px_2px_0px_#4A3E3D] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#4A3E3D] transition-all disabled:opacity-50 disabled:cursor-not-allowed";
  } else if (theme === "cyber-matchmaking-hub") {
    closeBtnClass = "absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-none text-[#8b949e] hover:text-[#58a6ff] hover:bg-[#1f242c] transition-all border border-transparent hover:border-[#30363d]";
    iconWrapperClass = "w-11 h-11 rounded-none bg-[#58a6ff]/10 border border-[#30363d] flex items-center justify-center mx-auto text-[#58a6ff]";
    titleClass = "text-sm font-bold text-[#c9d1d9] tracking-wider font-mono";
    descClass = "text-[10.5px] text-[#8b949e] leading-relaxed font-mono";
    loginBtnClass = "w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-none border border-[#58a6ff] bg-transparent text-[10px] font-bold tracking-widest uppercase text-[#58a6ff] hover:bg-[#58a6ff] hover:text-[#0d1117] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-mono";
  }

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
