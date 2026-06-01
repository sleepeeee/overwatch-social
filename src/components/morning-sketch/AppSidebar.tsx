"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, MessageSquare, MapPin, AtSign, RefreshCw, Settings, LogOut, Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface SidebarProps {
  styleMode: "A" | "B" | "AB";
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function AppSidebar({ styleMode, activeTab, setActiveTab }: SidebarProps) {
  const isStyleB = styleMode === "B";
  const router = useRouter();

  const menuItems = [
    { id: "dashboard", label: "DASHBOARD", icon: LayoutDashboard, badge: null },
    { id: "messages", label: "MESSAGES", icon: MessageSquare, badge: "10+" },
    { id: "location", label: "LOCATION", icon: MapPin, badge: null },
    { id: "mentions", label: "MENTIONS", icon: AtSign, badge: null },
    { id: "update", label: "UPDATE", icon: RefreshCw, badge: null }
  ];

  const handleLogout = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("登出失敗:", error.message);
      return;
    }
    router.refresh();
  };

  // 當風格為 B 時，我們收窄側邊欄，如第二張圖
  return (
    <aside 
      className={`fixed top-0 left-0 h-screen transition-all duration-500 ease-out z-40 bg-gradient-to-b from-[#faf8f5]/65 to-white/45 border-r border-[#8c7c6c]/10 backdrop-blur-2xl ${
        isStyleB ? "w-20" : "w-64"
      }`}
      style={{
        clipPath: isStyleB ? "none" : "url(#sidebar-curve)",
        boxShadow: "10px 0 30px -15px rgba(var(--theme-accent-rgb), 0.08)"
      }}
    >
      {/* 側邊欄頂部 Logo */}
      <div className="p-6 flex flex-col items-center justify-center border-b border-[#8c7c6c]/10 gap-2 min-h-[100px]">
        {/* 精緻蓮花圖標 */}
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#82b7cc]/15 to-[#f5d46b]/15 flex items-center justify-center border border-[#82b7cc]/30 shadow-sm animate-pulse">
          <svg viewBox="0 0 100 100" className="w-6 h-6 text-[#82b7cc]">
            <path d="M 50,75 C 34,68 36,55 50,35 C 64,55 66,68 50,75 Z" fill="currentColor" />
          </svg>
        </div>
        
        {!isStyleB && (
          <span className="text-sm font-black tracking-widest text-[#3e2723] uppercase">
            LOTUS
          </span>
        )}
      </div>

      {/* 側邊欄導航選單 */}
      <nav className="p-4.5 space-y-2 mt-4 flex flex-col justify-between h-[calc(100vh-220px)]">
        <div className="space-y-1.5">
          {!isStyleB && (
            <span className="px-3.5 text-[9px] font-black text-[#8c7c6c]/50 tracking-widest uppercase">
              MY PAGE / SERVICES
            </span>
          )}

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-xs font-black tracking-wider transition-all duration-300 relative group overflow-hidden ${
                  isActive 
                    ? "bg-[#82b7cc]/12 text-[#3e2723] shadow-[inset_0_0_8px_rgba(130,183,204,0.1)]" 
                    : "text-[#8c7c6c] hover:bg-[#faf8f5]/80 hover:text-[#3e2723]"
                } ${isStyleB ? "justify-center" : ""}`}
              >
                {/* 側邊選中發光小標記 */}
                {isActive && (
                  <div className="absolute left-0 top-1/4 h-1/2 w-1 bg-[#82b7cc] rounded-r-full" />
                )}

                <Icon 
                  size={16} 
                  className={`transition-transform group-hover:scale-110 duration-200 ${
                    isActive ? "text-[#82b7cc]" : ""
                  }`} 
                />

                {!isStyleB && (
                  <>
                    <span className="flex-grow text-left">{item.label}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 rounded-lg bg-orange-400/15 text-orange-500 text-[9px] font-extrabold tracking-tighter">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
                
                {/* Style B 窄版懸浮文字氣泡 */}
                {isStyleB && (
                  <span className="absolute left-22 scale-0 group-hover:scale-100 px-2.5 py-1 text-[9px] font-black text-white bg-slate-800/80 rounded-md backdrop-blur-sm pointer-events-none transition-transform origin-left duration-200 whitespace-nowrap z-50 shadow-sm">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 底部設置與登出 */}
        <div className="space-y-1.5 pt-4 border-t border-[#8c7c6c]/10">
          <button
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-xs font-black tracking-wider text-[#8c7c6c] hover:bg-[#faf8f5]/80 hover:text-[#3e2723] transition-all duration-300 group relative ${
              isStyleB ? "justify-center" : ""
            }`}
          >
            <Settings size={16} className="transition-transform group-hover:rotate-45 duration-300" />
            {!isStyleB && <span className="flex-grow text-left">SETTINGS</span>}
            {isStyleB && (
              <span className="absolute left-22 scale-0 group-hover:scale-100 px-2.5 py-1 text-[9px] font-black text-white bg-slate-800/80 rounded-md backdrop-blur-sm pointer-events-none transition-transform origin-left duration-200 whitespace-nowrap z-50 shadow-sm">
                SETTINGS
              </span>
            )}
          </button>

          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-xs font-black tracking-wider text-rose-500/80 hover:bg-rose-500/10 transition-all duration-300 group relative ${
              isStyleB ? "justify-center" : ""
            }`}
          >
            <LogOut size={16} className="transition-transform group-hover:translate-x-1 duration-200" />
            {!isStyleB && <span className="flex-grow text-left">LOGOUT</span>}
            {isStyleB && (
              <span className="absolute left-22 scale-0 group-hover:scale-100 px-2.5 py-1 text-[9px] font-black text-white bg-slate-800/80 rounded-md backdrop-blur-sm pointer-events-none transition-transform origin-left duration-200 whitespace-nowrap z-50 shadow-sm">
                LOGOUT
              </span>
            )}
          </button>
        </div>
      </nav>
    </aside>
  );
}
