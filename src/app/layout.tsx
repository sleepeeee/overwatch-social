import type { Metadata } from "next";
import { Geist, Noto_Sans_TC } from "next/font/google";
import "./globals.css";
import ArtOrnament from "@/components/morning-sketch/ArtOrnament";
import DevModeBanner from "@/components/DevModeBanner";
import TopBar from "@/components/TopBar";
import SiteFooter from "@/components/SiteFooter";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { CosmicParticlesBackground } from "@/components/CosmicParticlesBackground";
import SelectionUnlocker from "@/components/SelectionUnlocker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const notoSansTC = Noto_Sans_TC({
  variable: "--font-noto-sans-tc",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

export const metadata: Metadata = {
  title: {
    default: "After Midnight | 深夜玩家名片展示館",
    template: "%s | After Midnight",
  },
  description: "低侵入、可收藏的玩家名片宇宙。建立你的名片，遇見深夜還在線上的靈魂隊友。",
  alternates: {
    canonical: siteUrl || "https://aftermidnight-gg.vercel.app",
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    siteName: "After Midnight",
    locale: "zh_TW",
    type: "website",
    title: "After Midnight | 深夜玩家名片展示館",
    description: "低侵入、可收藏的玩家名片宇宙。建立你的名片，遇見深夜還在線上的靈魂隊友。",
    ...(siteUrl
      ? {
          images: [
            {
              url: `${siteUrl}/images/og-default.png`,
              width: 1512,
              height: 756,
              alt: "After Midnight — 深夜玩家名片展示館",
            },
          ],
        }
      : {}),
  },
  twitter: {
    card: "summary_large_image",
    title: "After Midnight | 深夜玩家名片展示館",
    description: "低侵入、可收藏的玩家名片宇宙。建立你的名片，遇見深夜還在線上的靈魂隊友。",
    ...(siteUrl ? { images: [`${siteUrl}/images/og-default.png`] } : {}),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" className={`${geistSans.variable} ${notoSansTC.variable} antialiased`}>
      <body
        className="min-h-screen flex flex-col text-foreground relative pt-[var(--dev-banner-height,0px)]"
        style={{
          backgroundColor: "var(--background, #030206)",
          backgroundImage: "var(--theme-bg-gradient)",
          fontFamily: "var(--font-noto-sans-tc), var(--font-geist-sans), sans-serif"
        }}
      >
        <SelectionUnlocker />
        <ThemeProvider>
          {/* 全站常駐高質感星空粒子背景 */}
          <CosmicParticlesBackground />

          {/* 全站底層藝術裝飾 */}
          <ArtOrnament />

          <AuthProvider>
            {/* 開發者模式 banner（需要在 AuthProvider 內，因為使用 useAuth()）*/}
            <DevModeBanner />
            <TopBar />
            <main className="site-main flex-1 relative z-10">{children}</main>
            <SiteFooter />
            {/* 主題預覽切換器（ThemeSwitcher.tsx）暫不掛載——使用者裁示隱藏入口、保留基礎建設
                （add-standalone-theme-style）。要啟用：import 後在此處掛 <ThemeSwitcher /> */}
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
