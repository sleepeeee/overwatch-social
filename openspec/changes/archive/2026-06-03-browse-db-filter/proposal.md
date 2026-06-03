## Why

目前 `selectedServer` 與 `selectedMic` 的篩選邏輯在 client-side JavaScript 的 `filteredPlayers` callback 執行，Supabase query 不攜帶這兩個條件，導致每次抓取的 20 筆（PAGE_SIZE）中，部分不符合篩選條件的資料被前端丟棄，實際顯示筆數低於預期。隨著玩家數量增長，over-fetching 問題加劇，且分頁 offset 的計算也會因 client-side 過濾而不準確。

## What Changes

- 修改 `src/components/square/OverwatchSquare.tsx` 的 `loadPlayers` 函式，新增 `serverFilter` / `micFilter` 參數，在 Supabase query builder 加入 `.eq('server', serverFilter)` 與 `.eq('mic_status', micFilter)` 條件（值為 `'all'` 時跳過）
- 新增第三個 `useEffect`，監聽 `selectedServer` 與 `selectedMic` 狀態變化，重設 offset 為 0 並重新觸發 `loadPlayers`
- 修改 `handleLoadMore` 函式，呼叫 `loadPlayers` 時傳入當前的 `selectedServer` / `selectedMic` 狀態，避免 stale closure 問題
- 精簡 `filteredPlayers` 的 filter callback，移除 `isServerMatched` 與 `isMicMatched` 邏輯（DB 已過濾），保留 `isRoleMatched`（role 欄位無對應 DB 欄位）

## Capabilities

### New Capabilities
- `browse-server-mic-db-filter`：server 與 mic_status 篩選條件下推至 Supabase DB 的 WHERE clause，確保每次分頁請求回傳的 PAGE_SIZE 筆資料均符合篩選條件

### Modified Capabilities
- `browse`：browse 頁的篩選行為由 client-side filter 改為 DB-level filter，分頁 offset 重設時機有 spec-level 變更（切換 server/mic 時 offset 重設為 0）

## Impact

- 僅修改 `src/components/square/OverwatchSquare.tsx` 一個檔案
- 無 DB schema migration（server、mic_status 欄位已存在）
- 無 API 路由或 Edge Function 變更
- Mock data path（`USE_MOCK_DATA` 開啟時）維持 client-side filter 行為不變，filter 變化不重拉 mock 資料
