import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import FloatingDock from "@/components/morning-sketch/FloatingDock";
import ArtOrnament from "@/components/morning-sketch/ArtOrnament";
import DevModeBanner from "@/components/DevModeBanner";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OW Social - 鬥陣特工交友平台",
  description: "找到你的最佳隊友！鬥陣特工主題交友社群",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" data-style="A" className={`${geistSans.variable} h-full antialiased`}>
      <body 
        className="min-h-full flex flex-col text-[#5d4037] relative"
        style={{
          background: "var(--theme-bg-gradient)",
          fontFamily: "var(--font-sans), sans-serif"
        }}
      >
        {/* 開發者模式 banner（Server Component，不需要 auth）*/}
        <DevModeBanner />
        {/* 全站底層藝術裝飾 */}
        <ArtOrnament />

        <AuthProvider>
          <main className="flex-1 relative z-10">{children}</main>
          <footer className="text-center py-4 text-gray-600 text-sm pb-24 relative z-10">
            © 2026 OW Social · 找到你的最佳特工戰友
          </footer>
          {/* 全局常駐的高質感毛玻璃懸浮導航列 */}
          <FloatingDock />
        </AuthProvider>
      </body>
    </html>
  );
}


