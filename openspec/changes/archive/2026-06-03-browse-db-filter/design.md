## Context

`OverwatchSquare.tsx` 是 browse 頁的核心元件，負責拉取玩家列表並渲染。目前 `loadPlayers` 函式只帶 `searchQuery` 與 `offset` 至 Supabase，`selectedServer` 和 `selectedMic` 兩個篩選條件完全在 `filteredPlayers` useMemo 的 callback 做 client-side filter。這造成：

1. 每次翻頁固定抓 20 筆，但顯示筆數不固定（client-side 再篩）
2. `hasMore` 判斷基於原始 20 筆計數，與實際顯示筆數脫鉤
3. 隨用戶基數擴大，over-fetching 成本線性增長

Supabase `players` 表已有 `server` 與 `mic_status` 欄位，無需 migration。

## Goals / Non-Goals

**Goals:**
- 將 server / mic_status 過濾下推至 Supabase `.eq()` WHERE clause
- 切換 server 或 mic filter 時 offset 重設為 0，確保正確分頁
- `handleLoadMore` 傳入當前 filter state，避免 stale closure

**Non-Goals:**
- 不修改 `selectedRole` 的過濾路徑（role 欄位無對應 DB column，繼續在 client-side filter）
- 不調整 PAGE_SIZE
- 不修改 Mock data path 的行為（`USE_MOCK_DATA` 開啟時維持現狀）
- 不新增任何 API 路由或 RPC function

## Decisions

### 決策 1：loadPlayers 加入 serverFilter / micFilter 顯式參數

**選擇**：在 `loadPlayers` 函式簽名加入 `serverFilter: string` / `micFilter: string` 兩個參數，呼叫端明確傳入，不在函式內讀取外部 state。

**理由**：避免 stale closure。`loadPlayers` 在 useEffect 與 handleLoadMore 兩處呼叫，若讀取 closure 外部的 state，翻頁時可能用到過期的 filter 值。顯式參數使每次呼叫的 filter 狀態明確可追蹤。

**替代方案**：useCallback + 依賴陣列（較複雜，且 handleLoadMore 已有 offset state 問題的前例）。

### 決策 2：新增第三個 useEffect 監聽 server / mic 變化

**選擇**：新增獨立的 useEffect，dependency array 為 `[selectedServer, selectedMic]`，在 effect 內將 offset 重設為 0 並以新 filter 呼叫 `loadPlayers`。

**理由**：與現有 `searchQuery` 的 useEffect 模式一致（effect 負責重設 + 重拉），降低閱讀認知負擔。

**替代方案**：合併進現有 searchQuery effect（dependency array 變大，邏輯耦合，不選）。

### 決策 3：精簡 filteredPlayers，移除 server / mic client-side check

**選擇**：從 `filteredPlayers` useMemo 的 filter callback 移除 `isServerMatched` 與 `isMicMatched` 判斷，只保留 `isRoleMatched`。

**理由**：DB 已過濾，client-side 重複過濾是冗餘邏輯；移除後可減少每次渲染的 JS 計算量。

**替代方案**：保留 client-side check 作為防禦性程式碼（會掩蓋 DB filter 失效的 bug，不選）。

### 決策 4：'all' 值跳過 DB filter

**選擇**：`serverFilter === 'all'` 時不加 `.eq('server', ...)` 條件；`micFilter === 'all'` 同理。

**理由**：保持與現有 client-side `isServerMatched` 邏輯一致（`'all'` 表示不篩選），且避免傳入 `'all'` 至 DB 產生無意義的 WHERE 條件。

## Risks / Trade-offs

- [Risk] `selectedServer` 的值域（如 `'tw'`、`'kr'`）與 DB enum 不一致 → Mitigation：實作前確認 DB 欄位值域與 dropdown options 一致
- [Risk] Mock data path 與 real path 行為差異加大（mock 不重拉，real 重拉）→ Mitigation：於程式碼加入明確註解說明此差異，不影響 production
- [Trade-off] 移除 client-side server/mic filter 後，若 DB filter 有 bug，UI 不再有防護層 → 接受，因為雙重過濾的假陽性（顯示 0 筆）比雙重過濾的假陰性更難偵測
