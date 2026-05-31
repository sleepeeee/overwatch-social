import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

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
    <html lang="zh-TW" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-950 text-white">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="text-center py-4 text-gray-600 text-sm">
          © 2025 OW Social · 找到你的最佳隊友
        </footer>
      </body>
    </html>
  );
}
