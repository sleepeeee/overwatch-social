"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FooterMinimalNodeIcon } from "@/components/CosmicParticlesBackground";

export default function SiteFooter() {
  const pathname = usePathname();
  const isReportPage = pathname === "/report";

  return (
    <footer className="site-footer fluid-gap-footer border-t border-white/[0.03] px-4 py-10 text-center text-[11px] relative z-10 bg-transparent sm:py-12">
      <div className="flex justify-center mb-5 opacity-40 hover:opacity-100 transition-opacity duration-[800ms]">
        <FooterMinimalNodeIcon className="w-10 h-10 filter drop-shadow-[0_0_6px_rgba(192,132,252,0.25)]" />
      </div>
      <p className="font-sans text-xs font-medium leading-6 tracking-[0.04em] text-zinc-300">
        AFTER MIDNIGHT • 給玩家放名片、看名片、慢慢找隊友的地方
      </p>
      <p className="mt-2 max-w-md mx-auto font-mono text-[11px] leading-relaxed text-zinc-400 opacity-90">
        Player cards first. Contact only when it feels right.
      </p>
      <nav aria-label="支援連結" className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <Link
          href="/report"
          aria-current={isReportPage ? "page" : undefined}
          className={`rounded-full border px-3 py-1.5 tracking-[0.16em] transition-all duration-300 ${
            isReportPage
              ? "border-auroraMint/35 bg-auroraMint/10 text-auroraMint"
              : "border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:border-auroraMint/30 hover:text-zinc-200"
          }`}
        >
          回報問題
        </Link>
      </nav>
    </footer>
  );
}
