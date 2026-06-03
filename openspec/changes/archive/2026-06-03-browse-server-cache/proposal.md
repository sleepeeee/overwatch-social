## Why

OverwatchSquare 目前在 browser 直接呼叫 Supabase SDK，每個使用者開啟廣場時即建立一條獨立的 DB 連線且無任何快取；廣場預設瀏覽（無搜尋）資料具備快取性，上千用戶同時瀏覽時 DB 連線數線性暴增，威脅整體服務穩定性。

## What Changes

- **新增** `src/app/actions/browse.ts`：匯出 `getPublicProfiles(offset, server?, mic?)` Server Action，使用 `unstable_cache` 設定 60s TTL，將無搜尋的廣場查詢結果快取於 Vercel Data Cache（in-memory per-instance）
- **修改** `src/components/square/OverwatchSquare.tsx`：`loadPlayers` 函式加入分路邏輯——`searchQ.trim()` 為空時呼叫 `getPublicProfiles` Server Action（走快取路徑），非空時維持直接呼叫 Supabase SDK（動態查詢，不適合快取）

## Capabilities

### New Capabilities

- `browse-server-cache`：廣場無搜尋路徑的 Server-side 快取能力，透過 Server Action 將 DB 查詢結果保存 60s，大幅降低 browser 直連 DB 的連線數

### Modified Capabilities

<!-- 無 — 對使用者行為透明，只改底層 fetch 路徑，無 spec-level 行為變更 -->

## Impact

- **新增檔案**：`src/app/actions/browse.ts`
- **修改檔案**：`src/components/square/OverwatchSquare.tsx`
- **無** DB migration、無 API 合約變更、無新外部依賴
- Vercel 環境：`unstable_cache` 依賴 Next.js Data Cache（in-memory per-instance），多 instance 各自維護 60s 快取，可接受
