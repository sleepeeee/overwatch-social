---
id: share-page-completion
type: change
status: proposing
created: 2026-06-03
affects_consumers: []
related_claims: []
---

# Proposal: share-page-completion

## Why（動機）

朋友 Shadowmaster6g 在 `visual/browse-dual-style-lab` 分支加入了「名片導出為圖片與連結分享」功能並已 merge，但分享流程目前斷路：

1. `/share/[id]/page.tsx` 是 Client Component，使用 mock 資料，沒有 `generateMetadata`
2. 沒有 og:image / og:title → 分享到 Discord/LINE 無預覽卡（分享功能等於無效）
3. `/player/[id]` 沒有「分享名片」按鈕 → 使用者找不到分享入口
4. `layout.tsx` 缺全站 og meta 基礎設定

**Why now（外部觸發）**：朋友已完成分享功能的 UI 和導出圖片部分，但 Server-side 的 OG meta 和資料串接尚未完成。`userprofile-auth-metadata-sync` 已穩定 AuthContext，auth 基礎設施齊備。現在是完成「創作名片 → 分享出去 → 帶人進來」閉環的最佳時機。

**先例缺口**：REF-002（Supabase SSR）記錄了 Server Component 的資料取得模式，REF-014（Next.js generateMetadata）記錄了 OG meta 技術。ADR-08（player 詳細頁 social_channels 設計）確立了 `public_profiles` view 的使用模式。但**三者均未觸及「將玩家名片包裝為分享連結並生成社群預覽」的完整閉環**。

## What Changes

1. **新增 `src/app/share/[id]/ShareCardClient.tsx`**：Client Component，承接導出圖片邏輯（從原 page.tsx 搬移）
2. **重構 `src/app/share/[id]/page.tsx`**：改為 Server Component，加 `generateMetadata`（og:title/description/image），呼叫 `getPublicProfile()` 取真實資料
3. **修改 `src/app/actions/profile.ts`**：新增 `getPublicProfile(userId)` Server Action，查 `public_profiles` view（anon 可讀）
4. **修改 `src/app/layout.tsx`**：補全站預設 openGraph meta（siteName / locale / og:image）
5. **修改 `src/app/player/[id]/page.tsx`**：`generateMetadata` 補 og:image，頁面加「分享名片」連結按鈕 → `/share/{id}`

## Capabilities（修改後）

- `/share/{userId}` 顯示真實玩家名片（非 mock 資料）
- 分享到 Discord/LINE/Twitter 產生預覽卡（og:title + og:description + og:image = 英雄頭像）
- 未登入訪問 `/share/{id}` 可正常載入（public_profiles view anon 可讀）
- 「保存此卡片為圖片」功能保留（Client 端 html-to-image）
- `/player/{id}` 頁面有「分享名片」按鈕

## Impact

- 修改範圍：5 個檔案（2 新建 + 3 修改）
- 無 DB schema 變更（使用現有 `public_profiles` view）
- 需要 Vercel 環境變數 `NEXT_PUBLIC_SITE_URL=https://overwatch-social.vercel.app`（og:image 絕對 URL）

## novelty claim（可偽證）

本 change 新意 = 將 Supabase `public_profiles` view 與 Next.js `generateMetadata` 結合，使玩家名片分享連結在社群平台產生動態預覽卡；若 `/share/[id]` 已有 Server-side generateMetadata 且 OG meta 有效，則為假。

## 最近鄰 prior work

- REF-002（Supabase SSR）：確立 Server Component 資料取得模式，`createClient()` + `public_profiles` view
- REF-014（Next.js generateMetadata）：og meta 技術基礎（本 change 新建）
- ADR-08（player 詳細頁 social_channels）：`public_profiles` view 的使用邊界
