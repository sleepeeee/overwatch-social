"use client";

import { useEffect } from "react";
import { useDevMode } from "@/hooks/useDevMode";

export default function DevModeBanner() {
  const { isDeveloper, loading } = useDevMode();

  useEffect(() => {
    if (!loading && isDeveloper) {
      document.documentElement.style.setProperty("--dev-banner-height", "32px");
    } else {
      document.documentElement.style.setProperty("--dev-banner-height", "0px");
    }
    return () => {
      document.documentElement.style.setProperty("--dev-banner-height", "0px");
    };
  }, [isDeveloper, loading]);

  if (loading || !isDeveloper) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] w-full flex items-center justify-center gap-2 bg-amber-500/90 backdrop-blur-sm text-white text-xs font-bold tracking-widest uppercase py-1.5 px-4 shadow-md">
      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
      DEV MODE — 開發者模式
      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
    </div>
  );
}
