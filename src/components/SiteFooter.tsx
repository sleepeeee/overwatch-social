"use client";

import { usePathname } from "next/navigation";
import { FooterMinimalNodeIcon } from "@/components/CosmicParticlesBackground";

export default function SiteFooter() {
  const pathname = usePathname();

  if (pathname !== "/") {
    return null;
  }

  return (
    <footer className="site-footer fluid-gap-footer border-t border-white/[0.03] py-12 text-center text-[11px] font-mono relative z-10 bg-transparent">
      <div className="flex justify-center mb-5 opacity-40 hover:opacity-100 transition-opacity duration-[800ms]">
        <FooterMinimalNodeIcon className="w-10 h-10 filter drop-shadow-[0_0_6px_rgba(192,132,252,0.25)]" />
      </div>
      <p className="tracking-[0.2em] text-zinc-300 font-semibold">
        AFTER MIDNIGHT • 慢速、低侵入、可收藏的玩家名片宇宙
      </p>
      <p className="mt-2 text-zinc-400 opacity-90 leading-relaxed max-w-md mx-auto">
        No pressure. No active radars. Just stars quietly sharing their orbital keys.
      </p>
    </footer>
  );
}
