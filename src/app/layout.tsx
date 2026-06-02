import type { Metadata } from "next";
import { Geist, Noto_Sans_TC } from "next/font/google";
import "./globals.css";
import FloatingDock from "@/components/morning-sketch/FloatingDock";
import ArtOrnament from "@/components/morning-sketch/ArtOrnament";
import DevModeBanner from "@/components/DevModeBanner";
import { AuthProvider } from "@/context/AuthContext";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

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
  title: "OW Social - 鬥陣特工交友平台",
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
    <html lang="zh-TW" data-style="A" className={`${geistSans.variable} ${notoSansTC.variable} antialiased`}>
      <body
        className="min-h-screen flex flex-col text-[#5d4037] relative pt-[var(--dev-banner-height,0px)]"
        style={{
          background: "var(--theme-bg-gradient)",
          fontFamily: "var(--font-noto-sans-tc), var(--font-geist-sans), sans-serif"
        }}
      >
        {/* 全站底層藝術裝飾 */}
        <ArtOrnament />

        <AuthProvider>
          {/* 開發者模式 banner（需要在 AuthProvider 內，因為使用 useAuth()）*/}
          <DevModeBanner />
          <main className="flex-1 relative z-10">{children}</main>
          <footer className="text-center py-4 text-gray-600 text-sm pb-24 relative z-10">
            © 2026 OW Social · 找到你的最佳特工戰友
          </footer>
          {/* 全局常駐的高質感毛玻璃懸浮導航列 */}
          <FloatingDock />
        </AuthProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
