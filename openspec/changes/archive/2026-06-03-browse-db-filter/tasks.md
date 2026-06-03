## 1. 修改 loadPlayers 函式（加參數 + DB filter）

- [x] 1.1 在 `loadPlayers` 函式簽名加入 `serverFilter` 與 `micFilter` 兩個顯式參數（預設值捕捉當前 state）
- [x] 1.2 在搜尋路徑的 Supabase query 加入條件：`serverFilter !== "全部"` 時追加 `.eq("server", serverFilter)`
- [x] 1.3 在搜尋路徑的 Supabase query 加入條件：`micFilter !== "全部"` 時追加 `.eq("mic_status", micFilter)`
- [x] 1.4 更新 searchQuery useEffect，傳入 `selectedServer` / `selectedMic` 當前值

## 2. 新增 useEffect 監聽 server / mic 變化

- [x] 2.1 新增 useEffect，dependency array 為 `[selectedServer, selectedMic, isMounted]`
- [x] 2.2 在該 effect 內以 offset=0 呼叫 `loadPlayers(searchQuery, 0, false, selectedServer, selectedMic)`

## 3. 修改 handleLoadMore 傳入 filter

- [x] 3.1 修改 `handleLoadMore` 函式，呼叫 `loadPlayers` 時傳入當前的 `selectedServer` 與 `selectedMic` 狀態

## 4. 精簡 filteredPlayers（移除 server / mic client-side filter）

- [x] 4.1 從 `filteredPlayers` filter callback 移除 `isServerMatched` 相關判斷邏輯
- [x] 4.2 從 `filteredPlayers` filter callback 移除 `isMicMatched` 相關判斷邏輯
- [x] 4.3 確認 `isRoleMatched` 邏輯保留完整（role 繼續在 client-side 過濾）

## 5. 驗收

- [ ] 5.1 在 DevTools Network 面板確認：選擇特定 server 後，搜尋請求 URL 含 `server=eq.<value>` 參數
- [ ] 5.2 在 DevTools Network 面板確認：選擇特定 mic_status 後，搜尋請求 URL 含 `mic_status=eq.<value>` 參數
- [ ] 5.3 驗證切換 server/mic filter 後顯示結果正確（無 client-side 二次過濾損耗）
- [ ] 5.4 驗證點擊「載入更多」後追加資料的 request 仍帶有當前 filter 參數
