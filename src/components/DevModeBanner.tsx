"use client";

import { useDevMode } from "@/hooks/useDevMode";

export default function DevModeBanner() {
  const { isDeveloper, loading } = useDevMode();

  if (loading || !isDeveloper) return null;

  return (
    <div className="relative z-[100] w-full flex items-center justify-center gap-2 bg-amber-500/90 backdrop-blur-sm text-white text-xs font-bold tracking-widest uppercase py-1.5 px-4 shadow-md">
      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
      DEV MODE — 開發者模式
      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
    </div>
  );
}
