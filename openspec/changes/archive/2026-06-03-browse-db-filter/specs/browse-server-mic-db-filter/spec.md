## ADDED Requirements

### Requirement: Server filter pushed to DB
當使用者選擇特定 server 時，Supabase query 的 WHERE clause 中 SHALL 包含 `.eq('server', selectedServer)` 條件；當 selectedServer 為 `'all'` 時，該條件 SHALL 被省略（不加入 query）。

#### Scenario: 選擇特定 server 後 query 含 eq 條件
- **WHEN** 使用者從 server dropdown 選擇非 `'all'` 的值（如 `'tw'`）
- **THEN** 發送至 Supabase 的 query SHALL 包含 server eq filter，回傳資料中所有玩家的 server 欄位 SHALL 等於所選值

#### Scenario: server 為 all 時 query 不含 server 條件
- **WHEN** 使用者選擇 server `'all'`
- **THEN** 發送至 Supabase 的 query SHALL NOT 包含 server eq filter，回傳所有 server 的玩家資料

### Requirement: Mic filter pushed to DB
當使用者選擇特定 mic_status 時，Supabase query 的 WHERE clause 中 SHALL 包含 `.eq('mic_status', selectedMic)` 條件；當 selectedMic 為 `'all'` 時，該條件 SHALL 被省略。

#### Scenario: 選擇特定 mic_status 後 query 含 eq 條件
- **WHEN** 使用者從 mic dropdown 選擇非 `'all'` 的值（如 `'on'`）
- **THEN** 發送至 Supabase 的 query SHALL 包含 mic_status eq filter，回傳資料中所有玩家的 mic_status 欄位 SHALL 等於所選值

#### Scenario: mic 為 all 時 query 不含 mic_status 條件
- **WHEN** 使用者選擇 mic `'all'`
- **THEN** 發送至 Supabase 的 query SHALL NOT 包含 mic_status eq filter，回傳所有 mic_status 的玩家資料

### Requirement: Filter change resets pagination
切換 server 或 mic filter 時，分頁 offset SHALL 重設為 0，並重新從第一頁拉取符合新 filter 的資料。

#### Scenario: 切換 server filter 時 offset 重設
- **WHEN** 使用者變更 selectedServer（從任意值切換至任意值）
- **THEN** offset SHALL 重設為 0，且系統 SHALL 以新的 server filter 重新拉取第一頁資料

#### Scenario: 切換 mic filter 時 offset 重設
- **WHEN** 使用者變更 selectedMic（從任意值切換至任意值）
- **THEN** offset SHALL 重設為 0，且系統 SHALL 以新的 mic filter 重新拉取第一頁資料

#### Scenario: loadMore 使用當前 filter 狀態
- **WHEN** 使用者在 server/mic filter 已選擇特定值的情況下點擊「載入更多」
- **THEN** 追加拉取的 query SHALL 包含與當前 filter 選擇相同的 server / mic WHERE 條件
