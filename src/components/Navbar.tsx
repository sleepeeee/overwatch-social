"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldAlert } from "lucide-react";

const links = [
  { href: "/", label: "首頁" },
  { href: "/browse", label: "名片交友廣場" },
  { href: "/profile", label: "個人名片設定" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[rgba(249,115,22,0.15)] bg-slate-950/60 backdrop-blur-md shadow-[0_5px_25px_rgba(0,0,0,0.6)]">
      <div className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-[#f97316]/50 to-transparent animate-pulse" />
      
      <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
        <Link href="/" className="text-white font-extrabold text-xl tracking-wider flex items-center gap-2 group transition-all duration-300">
          <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-transparent bg-clip-text drop-shadow-[0_0_8px_rgba(249,115,22,0.5)] group-hover:scale-105 transition-transform duration-300">
            OW SOCIAL
          </span>
          <span className="text-[10px] bg-orange-500 text-white font-black px-1.5 py-0.5 rounded tracking-widest uppercase scale-90 skew-x-[-10deg]">
            BETA
          </span>
        </Link>
        
        <div className="flex gap-1 md:gap-4">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative text-xs md:text-sm font-bold tracking-wide px-3.5 py-2 rounded-lg transition-all duration-300 ow-tech-btn flex items-center gap-1.5 ${
                  isActive
                    ? "text-[#f97316] bg-orange-500/10 shadow-[inset_0_0_8px_rgba(249,115,22,0.15)] border border-[#f97316]/30"
                    : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[3px] bg-[#f97316] rounded-t-full drop-shadow-[0_0_5px_#f97316]" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
