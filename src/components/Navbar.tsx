"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const links = [
  { href: "/", label: "首頁" },
  { href: "/browse", label: "名片交友廣場" },
  { href: "/profile", label: "個人名片設定" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/profile`,
      },
    });
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[#8c7c6c]/15 bg-white/75 backdrop-blur-md shadow-[0_4px_30px_rgba(140,124,108,0.06)]">
      <div className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-[#82b7cc]/40 to-transparent animate-pulse" />

      <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
        <Link href="/" className="text-[#3e2723] font-extrabold text-xl tracking-wider flex items-center gap-2 group transition-all duration-300">
          <span className="bg-gradient-to-r from-[#82b7cc] via-[#d8a070] to-[#f5d46b] text-transparent bg-clip-text drop-shadow-[0_0_8px_rgba(130,183,204,0.25)] group-hover:scale-105 transition-transform duration-300">
            OW SOCIAL
          </span>
          <span className="text-[9px] bg-[#82b7cc] text-white font-black px-1.5 py-0.5 rounded-full tracking-widest uppercase scale-90">
            BETA
          </span>
        </Link>

        <div className="flex items-center gap-1 md:gap-3">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative text-xs md:text-sm font-extrabold tracking-wide px-3.5 py-2 rounded-xl transition-all duration-300 ow-tech-btn flex items-center gap-1.5 ${
                  isActive
                    ? "text-[#82b7cc] bg-[#82b7cc]/8 border border-[#82b7cc]/25 shadow-sm"
                    : "text-[#8c7c6c]/80 hover:text-[#5d4037] hover:bg-[#8c7c6c]/5 border border-transparent"
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[3px] bg-[#82b7cc] rounded-t-full drop-shadow-[0_0_5px_#82b7cc]" />
                )}
              </Link>
            );
          })}

          {/* 登入/登出區塊 */}
          {!loading && (
            user ? (
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-[#8c7c6c]/20">
                <span className="text-xs text-[#8c7c6c]/70 hidden md:block max-w-[120px] truncate">
                  {user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl border border-[#8c7c6c]/30 text-[#8c7c6c] hover:bg-[#8c7c6c]/5 hover:text-[#5d4037] transition-all"
                >
                  登出
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="text-xs font-extrabold px-4 py-2 bg-gradient-to-r from-[#82b7cc] to-[#82b7cc]/85 text-white rounded-xl shadow-[0_4px_12px_rgba(130,183,204,0.25)] hover:shadow-[0_6px_16px_rgba(130,183,204,0.35)] active:scale-95 transition-all duration-300"
              >
                Google 登入
              </button>
            )
          )}
        </div>
      </div>
    </nav>
  );
}
