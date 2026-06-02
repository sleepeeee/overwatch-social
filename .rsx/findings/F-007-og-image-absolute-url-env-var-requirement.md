---
id: F-007
title: "og:image 必須絕對 URL：NEXT_PUBLIC_SITE_URL 環境變數設計確認"
status: confirmed
change: share-page-completion
date: 2026-06-03
references_to: [REF-014, ADR-07]
referenced_by: [ADR-07]
supporting_refs: [REF-014]
---

## 結論 / 數據

- **根因**：社群平台爬蟲（Discord、LINE、Twitter）抓取 og:image 時，相對路徑（`/images/...`）無法解析——爬蟲不知道 domain，必須提供帶 scheme + host 的絕對 URL，否則預覽圖顯示破圖或完全省略。
- **量化影響**：若 `NEXT_PUBLIC_SITE_URL` 未設定或為空字串，`ogImage` 退化為相對路徑（或 undefined）：Discord 分享無預覽圖、LINE 預覽卡顯示預設佔位圖。生產環境（Vercel）設定後解決此問題，不影響 TypeScript 型別安全（og:image 為可選欄位，省略時 Next.js 不輸出該 meta tag）。
- **驗證方法**：
  - `npx tsc --noEmit` 無 error（N=1 次，TypeScript 層驗證）
  - `rg '"use client"' src/app/share/[id]/page.tsx` 無命中（Server Component 確認）
  - `grep -n "siteName.*OW Social" src/app/layout.tsx` 有命中（全站 og meta 確認）
  - Vercel env var `NEXT_PUBLIC_SITE_URL=https://overwatch-social.vercel.app` 已設定（生產驗收）

## 與既有 REF 一致或矛盾

與 **REF-014** 完全一致：REF-014 已記錄「og:image 必須是絕對 URL」及 `NEXT_PUBLIC_SITE_URL` 解決方案。本 Finding 為 REF-014 在實際 change 中的落地確認，提供具體的 undefined fallback 處理模式（`siteUrl ? ... : undefined`）作為補充，而非矛盾。

## 對後續影響

- **後續任何頁面補 og:image**：需同樣使用 `NEXT_PUBLIC_SITE_URL ?? ""`，並在為空時省略 images 欄位（`...(ogImage ? { images: [{ url: ogImage }] } : {})`），避免輸出無效相對路徑 meta tag。
- **本地開發**：og:image 相關功能無法在未設定 `NEXT_PUBLIC_SITE_URL` 的本機驗證（預覽圖為空），此為已知限制，不需修復。
- **Vercel 部署**：本 change 已確認 `NEXT_PUBLIC_SITE_URL` 已正確設定，後續新環境（staging）部署需重新設定。
