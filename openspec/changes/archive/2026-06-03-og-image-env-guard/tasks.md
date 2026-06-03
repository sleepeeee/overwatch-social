## 1. share/[id]/page.tsx 修改

- [x] 1.1 `siteUrl` fallback 改為 `"https://overwatch-social.vercel.app"`（移除空字串 falsy 陷阱）
- [x] 1.2 `ogImage` 移除三元省略（永遠有值），openGraph.images / twitter.images 改為直接賦值

## 2. 環境變數補齊

- [x] 2.1 `.env.local` 加 `NEXT_PUBLIC_SITE_URL=http://localhost:3000`

## 3. Build-time 防呆

- [x] 3.1 `next.config.ts` 加 `console.warn`（env var 缺設時提示）

## 4. 驗收

- [x] 4.1 TypeScript + build 驗證通過（npm run build 零錯誤，console.warn 不出現因 .env.local 已設）
- [x] 4.2 本地 /share/[任意 id] → 檢查 og:image meta tag 有 URL 值
