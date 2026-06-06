"use client";

import { useEffect } from "react";
import Link from "next/link";
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
    <Link
      href="/developer"
      aria-label="進入開發者後台"
      title="進入開發者後台"
      className="fixed top-0 left-0 right-0 z-[100] w-full flex items-center justify-center gap-2 border-b border-auroraMint/20 bg-[#07040f]/90 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-zinc-100 shadow-[0_0_22px_rgba(192,132,252,0.16)] backdrop-blur-md transition-all duration-300 hover:border-auroraMint/45 hover:bg-[#0b0914]/95 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-auroraMint/60 focus-visible:ring-offset-0"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-auroraMint shadow-[0_0_10px_rgba(192,132,252,0.9)] animate-pulse" />
      DEV MODE - 開發者模式
      <span className="w-1.5 h-1.5 rounded-full bg-auroraMint shadow-[0_0_10px_rgba(192,132,252,0.9)] animate-pulse" />
    </Link>
  );
}
