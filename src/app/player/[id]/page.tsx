import { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { HEROES_CONFIG } from "@/data/mockPlayers";
import { ArrowLeft, Mic, MicOff, Globe } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

async function getPlayer(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("public_profiles")
    .select("*")
    .eq("user_id", id)
    .single();
  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const player = await getPlayer(id);
  if (!player) return { title: "玩家不存在 | After Midnight" };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const firstHero = (player.selected_heroes as string[])?.[0] ?? "ana";
  const ogImage = siteUrl ? `${siteUrl}/images/heroes/avatars/${firstHero}.png` : undefined;

  return {
    title: `${player.battle_tag} | After Midnight`,
    description: player.message || "查看這位深夜玩家的遊戲名片",
    openGraph: {
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
  };
}

export default async function PlayerDetailPage({ params }: Props) {
  const { id } = await params;
  const player = await getPlayer(id);

  if (!player) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-[#8c7c6c] font-semibold">玩家不存在或已將名片設為私密</p>
        <Link href="/browse" className="text-[#82b7cc] text-sm font-bold hover:underline">
          ← 返回廣場
        </Link>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // social_channels 從 profiles 表直接讀取（需登入；migration 008 的 RLS policy 允許讀取 is_tag_visible=true 的玩家）
  let socialChannels: Record<string, string> = {};
  if (user) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("social_channels")
      .eq("user_id", id)
      .single();
    socialChannels = (profileData?.social_channels as Record<string, string>) ?? {};
  }
  const hasSocial = Object.keys(socialChannels).length > 0;

  const heroConfigs = (player.selected_heroes as string[] ?? [])
    .map((id: string) => HEROES_CONFIG.find(h => h.id === id))
    .filter(Boolean);

  const micIcon = player.mic_status === "mic-on"
    ? <Mic size={14} className="text-emerald-500" />
    : player.mic_status === "mic-off"
    ? <MicOff size={14} className="text-[#8c7c6c]/50" />
    : <Mic size={14} className="text-[#d8a070]" />;

  const micLabel: Record<string, string> = {
    "mic-on": "有開麥",
    "mic-off": "不開麥",
    "listen-only": "只聽不說"
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* 導航按鈕列 */}
      <div className="flex items-center justify-between">
        <Link
          href="/browse"
          className="inline-flex items-center gap-1.5 text-[#8c7c6c] hover:text-[#5d4037] text-xs font-bold transition-colors"
        >
          <ArrowLeft size={14} />
          返回廣場
        </Link>
        <Link
          href={`/share/${id}`}
          className="inline-flex items-center gap-1.5 text-[#82b7cc] hover:text-[#5d9ab0] text-xs font-bold transition-colors"
        >
          分享名片 →
        </Link>
      </div>

      {/* 主卡片 */}
      <div className="glass-panel p-6 md:p-8 space-y-6">
        {/* 頂部：英雄立繪 + 基本資訊 */}
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          {/* 英雄立繪 */}
          <div className="flex gap-2 shrink-0">
            {heroConfigs.slice(0, 3).map((hero) => hero && (
              <div key={hero.id} className="w-16 h-16 rounded-2xl overflow-hidden border border-[#8c7c6c]/15 bg-white/60 shadow-sm">
                {/* Server Component 不可掛 onError 事件；hero 已經過 HEROES_CONFIG 過濾，頭像必定存在 */}
                <img
                  src={`/images/heroes/avatars/${hero.id}.png`}
                  alt={`鬥陣特攻英雄 ${hero.name} 常用英雄縮圖`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          {/* 基本資訊 */}
          <div className="flex-1 min-w-0 space-y-2">
            <h1 className="text-xl font-extrabold text-[#3e2723] tracking-wide truncate">
              {player.battle_tag}
            </h1>

            <div className="flex flex-wrap gap-2 text-[11px]">
              {player.server && (
                <span className="px-2.5 py-1 rounded-full bg-[#82b7cc]/12 border border-[#82b7cc]/25 text-[#2a454d] font-bold">
                  {player.server}
                </span>
              )}
              {player.mbti && (
                <span className="px-2.5 py-1 rounded-full bg-[#f5d46b]/15 border border-[#f5d46b]/30 text-[#5d4037] font-bold">
                  {player.mbti}
                </span>
              )}
              <span className="px-2.5 py-1 rounded-full bg-white/50 border border-[#8c7c6c]/15 text-[#8c7c6c] font-bold flex items-center gap-1">
                {micIcon}
                {micLabel[player.mic_status ?? ""] ?? player.mic_status}
              </span>
            </div>
          </div>
        </div>

        {/* 留言 */}
        {player.message && (
          <div className="bg-white/40 border border-white/60 rounded-2xl p-4">
            <p className="text-[#3e2723] text-sm leading-relaxed italic">
              &ldquo;{player.message}&rdquo;
            </p>
          </div>
        )}

        {/* 標籤 */}
        {(player.tags as string[] ?? []).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {(player.tags as string[]).map((tag) => (
              <span key={tag} className="text-[11px] font-bold px-3 py-1 rounded-full pastel-tag-blue">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* 語言 */}
        {(player.languages as string[] ?? []).length > 0 && (
          <div className="flex items-center gap-2 text-xs text-[#8c7c6c]">
            <Globe size={13} />
            <span className="font-semibold">{(player.languages as string[]).join("、")}</span>
          </div>
        )}

        {/* 聯絡方式 */}
        <div className="border-t border-[#8c7c6c]/10 pt-4">
          <h2 className="text-xs font-black text-[#8c7c6c] uppercase tracking-widest mb-3">
            聯絡方式
          </h2>

          {!user ? (
            <div className="text-center py-4">
              <p className="text-xs text-[#8c7c6c] mb-2">登入後才能查看聯絡方式</p>
              <Link
                href="/"
                className="text-[#82b7cc] text-xs font-bold hover:underline"
              >
                前往登入 →
              </Link>
            </div>
          ) : hasSocial ? (
            <div className="flex flex-wrap gap-3">
              {Object.entries(socialChannels).map(([platform, value]) => {
                if (!value) return null;
                return (
                  <div
                    key={platform}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/50 border border-[#8c7c6c]/15 text-xs font-bold text-[#5d4037]"
                  >
                    <span className="capitalize text-[#8c7c6c]">{platform}</span>
                    {value !== "true" && <span className="font-mono">{value}</span>}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-[#8c7c6c] italic">這位特工尚未填寫聯絡方式</p>
          )}
        </div>
      </div>
    </div>
  );
}
