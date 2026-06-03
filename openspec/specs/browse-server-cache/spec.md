## ADDED Requirements

### Requirement: Default browse uses server action
廣場在無搜尋關鍵字的情況下，系統 SHALL 透過 Server Action（`getPublicProfiles`）取得玩家列表，而非由 browser 直接連接 Supabase SDK。

#### Scenario: No search query triggers server action path
- **WHEN** 使用者開啟廣場且搜尋欄為空（`searchQ.trim() === ""`）
- **THEN** `loadPlayers` 呼叫 `getPublicProfiles` Server Action 取得資料，browser 不發出直接指向 `supabase.co` 的 DB 請求

#### Scenario: Server action returns player card array
- **WHEN** `getPublicProfiles(offset, server, mic)` 被呼叫
- **THEN** 回傳型別為 `OWPlayerCard[]`，且每筆資料的 `card_id` 欄位由 `user_id` 填充

### Requirement: Cached response within TTL
系統 SHALL 將 Server Action 的查詢結果快取 60 秒；TTL 內同一組參數（offset、server、mic）的後續請求 MUST 直接回傳快取資料，不觸發新的 DB 查詢。

#### Scenario: Repeated request within 60 seconds reuses cache
- **WHEN** 相同 `(offset, server, mic)` 組合在 60s 內被第二次請求
- **THEN** DB 查詢次數不增加，回傳資料與第一次相同

#### Scenario: Cache key is scoped to filter combination
- **WHEN** 不同的 `(offset, server, mic)` 組合分別被請求
- **THEN** 各組合擁有獨立的 cache entry，互不污染

#### Scenario: Cache expires after TTL
- **WHEN** 距上次請求已超過 60 秒
- **THEN** 下次請求重新觸發 DB 查詢並更新快取

### Requirement: Search bypasses cache
有搜尋關鍵字時，系統 SHALL 直接呼叫 Supabase SDK 執行動態查詢，不經過快取路徑，確保搜尋結果即時反映資料庫狀態。

#### Scenario: Non-empty search query uses direct Supabase call
- **WHEN** 使用者在搜尋欄輸入非空字串（`searchQ.trim() !== ""`）
- **THEN** `loadPlayers` 直接呼叫 Supabase SDK，不呼叫 `getPublicProfiles` Server Action

#### Scenario: Search result is not stored in cache
- **WHEN** 含搜尋關鍵字的請求完成
- **THEN** 結果不寫入 `unstable_cache`，不影響無搜尋路徑的快取 entry
