import type { NextConfig } from "next";

if (!process.env.NEXT_PUBLIC_SITE_URL) {
  console.warn("⚠ NEXT_PUBLIC_SITE_URL 未設定，Share 頁 OG 圖片將使用預設 fallback（https://overwatch-social.vercel.app）");
}

const nextConfig: NextConfig = {};

export default nextConfig;
