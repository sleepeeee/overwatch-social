## 1. 建立 Server Action browse.ts

- [x] 1.1 建立 `src/app/actions/browse.ts` 檔案並加上 `'use server'` 指令
- [x] 1.2 實作 `rowToCard` mapper：將 `public_profiles` view 列的欄位對映至 `OWPlayerCard`，以 `user_id` 填充 `card_id`
- [x] 1.3 實作 `getPublicProfiles(offset: number, server?: string, mic?: string): Promise<OWPlayerCard[]>`，內部查詢 `public_profiles` view 並套用 server/mic filter
- [x] 1.4 用 `unstable_cache` 包裝查詢函式，設定 TTL `revalidate: 60`，cache key 為 `["public-profiles"]` + args

## 2. 修改 OverwatchSquare.tsx 加入分路邏輯

- [x] 2.1 在 `src/components/square/OverwatchSquare.tsx` 頂部 import `getPublicProfiles` from `@/app/actions/browse`
- [x] 2.2 在 `loadPlayers` 函式中加入分路：`searchQ.trim() === ""` → 呼叫 `getPublicProfiles`（Server Action 快取）；否則維持直接 Supabase 查詢邏輯

## 3. 驗收

- [ ] 3.1 在 Vercel Preview（或本地 `next dev`）開啟廣場，確認 DevTools Network 無搜尋時無指向 `*.supabase.co` 的 PostgREST 請求
- [ ] 3.2 輸入搜尋關鍵字後確認 Network 仍出現 Supabase 請求（有搜尋路徑正常直連）
- [ ] 3.3 確認廣場玩家卡片資料顯示正常，無欄位遺失或型別錯誤
