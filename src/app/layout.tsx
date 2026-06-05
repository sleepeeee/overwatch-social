import type { Metadata } from "next";
import "./globals.css";
import FloatingDock from "@/components/morning-sketch/FloatingDock";
import ArtOrnament from "@/components/morning-sketch/ArtOrnament";
import DevModeBanner from "@/components/DevModeBanner";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = { variable: "--font-geist-sans" };
const notoSansTC = { variable: "--font-noto-sans-tc" };

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

export const metadata: Metadata = {
  title: "aftermidnight-gg",
  description: "找到你的最佳隊友！鬥陣特工主題交友社群",
  openGraph: {
    siteName: "OW Social",
    locale: "zh_TW",
    type: "website",
    ...(siteUrl ? { images: [{ url: `${siteUrl}/images/heroes/avatars/ana.png` }] } : {}),
  },
  twitter: { card: "summary" },
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
          background: "var(--theme-bg-gradient)",
          fontFamily: "var(--font-noto-sans-tc), var(--font-geist-sans), sans-serif"
        }}
      >
        <ThemeProvider>
          {/* 全站底層藝術裝飾 */}
          <ArtOrnament />

          <AuthProvider>
            {/* 開發者模式 banner（需要在 AuthProvider 內，因為使用 useAuth()）*/}
            <DevModeBanner />
            <main className="site-main flex-1 relative z-10">{children}</main>
            <footer className="site-footer text-center py-5 text-gray-400/50 text-xs pb-24 relative z-10">
              © 2026 OW Social · 找到你的最佳特工戰友
            </footer>
            {/* 全局常駐的高質感毛玻璃懸浮導航列 */}
            <FloatingDock />
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      {/* impeccable-live-start */}
<script src="http://localhost:8400/live.js"></script>
{/* impeccable-live-end */}
</body>
    </html>
  );
}
