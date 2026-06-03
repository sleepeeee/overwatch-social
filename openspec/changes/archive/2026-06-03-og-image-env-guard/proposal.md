## Why

`share/[id]/page.tsx` 的 og:image URL 以 `NEXT_PUBLIC_SITE_URL ?? ""` 建構，空字串為 falsy，導致 ogImage 為 undefined 時完全省略 og:image 欄位，無任何錯誤或警告。本地 `.env.local` 從未設定此 env var，開發者本地測試 Share 頁時 og:image 永遠失效；新 Vercel 部署若忘記設定，生產環境同樣靜默失效。

## What Changes

- `share/[id]/page.tsx`：fallback 改為 hardcode 正式域名（不再以空字串判斷）
- `.env.local` 補 `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
- `next.config.ts` 加 build-time console.warn（env var 缺設時提示）

## Capabilities

### Modified Capabilities

- `share-page-og-image`：og:image 永遠有合理 URL（本地用 localhost，生產用 vercel 域名 fallback）

## Impact

- **修改**：`src/app/share/[id]/page.tsx`（siteUrl fallback + ogImage 移除三元省略）
- **修改**：`.env.local`（補 NEXT_PUBLIC_SITE_URL）
- **修改**：`next.config.ts`（加 build-time warn）
