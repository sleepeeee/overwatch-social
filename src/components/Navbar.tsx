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

        <div className="flex items-center gap-1 md:gap-3">
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

          {/* 登入/登出區塊 */}
          {!loading && (
            user ? (
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-orange-500/20">
                <span className="text-xs text-gray-400 hidden md:block max-w-[120px] truncate">
                  {user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg border border-orange-500/30 text-orange-400 hover:bg-orange-500/10 transition-colors"
                >
                  登出
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="ml-2 flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white transition-all shadow-[0_0_12px_rgba(249,115,22,0.3)] hover:shadow-[0_0_20px_rgba(249,115,22,0.5)]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google 登入
              </button>
            )
          )}
        </div>
      </div>
    </nav>
  );
}
