## Context

Share 頁（/share/[id]）由 share-page-completion change 實作，F-007 / ADR-07 已記錄 og:image 必須絕對 URL 的設計決策。但本地 .env.local 一直未補 NEXT_PUBLIC_SITE_URL，且 generateMetadata 的 falsy guard 邏輯（空字串 → ogImage undefined → 省略）使失效完全無聲。

## Goals / Non-Goals

**Goals:**
- 確保 og:image 在任何環境永遠有值（hardcode fallback 作為最後防線）
- 本地開發環境補正確 env var
- build-time 提醒（開發者忘設 env var 時有 console.warn）

**Non-Goals:**
- 強制 build-time 失敗（以 warn 取代 error，不阻塞 CI）
- 修改 Twitter card 類型

## Architecture Decision

hardcode fallback 到正式域名（`"https://overwatch-social.vercel.app"`）：
- 優點：生產環境永遠正確，即使 env var 漏設
- 取捨：本地預覽 og:image 時指向生產圖片（跨 origin），可接受

## Key Files

- `src/app/share/[id]/page.tsx`
- `.env.local`
- `next.config.ts`
