---
id: F-018
type: finding
title: NEXT_PUBLIC_SITE_URL 缺設時 Share 頁 og:image 靜默失效，社群分享無預覽圖
status: confirmed
confidence: high
references_to: [REF-014, F-007]
referenced_by: []
---

## 結論 / 數據

`share/[id]/page.tsx` 的 `generateMetadata` 以下列邏輯建構 og:image URL：

```typescript
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
const ogImage = siteUrl ? `${siteUrl}/images/heroes/avatars/${firstHero}.png` : undefined;
```

當 `NEXT_PUBLIC_SITE_URL` 未設定時，`siteUrl` 為空字串（falsy），`ogImage` 為 `undefined`，openGraph.images 欄位被完全省略，無任何錯誤或警告。

**影響**：
- `.env.local`（本地開發）從未設定 `NEXT_PUBLIC_SITE_URL`，開發者在本地測試 Share 頁時 og:image 永遠無效
- 新 Vercel 部署若未在 dashboard 設定 env var，og:image 同樣靜默失效
- 兩個場景均無 console.error / build warning，完全無聲

**本地環境驗證**（發現時）：
- `.env.local` 僅含 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`，無 `NEXT_PUBLIC_SITE_URL`
- `next.config.ts` 為空，無任何 env var 驗證邏輯

**修正**（commit 19ddd60）：
1. `share/[id]/page.tsx`：fallback 改為 hardcode 正式域名：
   `process.env.NEXT_PUBLIC_SITE_URL ?? "https://overwatch-social.vercel.app"`
2. og:image 不再使用三元省略，改為永遠有值（fallback 保底）
3. `.env.local` 補 `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
4. `next.config.ts` 加 build-time `console.warn` 提示

## 與既有 REF 一致或矛盾

REF-014（Next.js App Router generateMetadata + OpenGraph）第「關鍵實作細節」段即明確：「og:image URL 必須是絕對路徑，必須包含完整 domain」，並指出「若 env var 未設定會靜默失效」。本 Finding 是 REF-014 警告場景的實際發生確認。

F-007（og:image 必須絕對 URL + NEXT_PUBLIC_SITE_URL env var 設計確認）記錄了同樣的問題規格，本 Finding 是其實際缺陷確認（F-007 當時以設計決策形式記錄，本次以缺陷形式補充）。

## 對後續影響

1. **hardcode fallback 的取捨**：`?? "https://overwatch-social.vercel.app"` 在開發者預覽時會指向生產圖片（跨 origin），本地 og 預覽工具可能無法載入，但 production 永遠正確，屬於可接受的取捨
2. Vercel 環境仍建議設定 `NEXT_PUBLIC_SITE_URL`（讓 staging / preview deploy 有正確域名），hardcode 只是最後防線
