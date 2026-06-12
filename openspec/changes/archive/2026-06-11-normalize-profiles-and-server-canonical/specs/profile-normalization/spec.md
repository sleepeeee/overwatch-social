# profile-normalization

## ADDED Requirements

### Requirement: OW server 值域為 canonical 代號
Overwatch 名片的 `server` 欄位 SHALL 只儲存 canonical 代號之一：`asia`、`america`、`europe`。

#### Scenario: 應用層寫入前正規化
- **WHEN** 使用者以任意顯示字串（如 `亞洲伺服器`、`Asia Server`）建立或更新 OW 名片
- **THEN** `normalizeOverwatchServer()` SHALL 在寫入 DB 前轉為對應 canonical 代號

#### Scenario: DB 層擋非法值
- **WHEN** 任何寫入嘗試將 `game = 'overwatch'` 的列 `server` 設為非 canonical 值
- **THEN** DB CHECK 約束 `profiles_overwatch_server_valid` SHALL 拒絕該寫入

#### Scenario: 非 overwatch 遊戲不受約束
- **WHEN** 寫入 `game <> 'overwatch'` 的名片
- **THEN** 條件式 CHECK 約束 SHALL NOT 限制其 server 值域

### Requirement: 玩家本體補齊
系統 SHALL 為每個仍存在於 auth.users 的名片持有人確保有對應的 `user_profiles` 列。

#### Scenario: 從存量名片補齊
- **WHEN** 某 user_id 持有名片但無 user_profiles 列
- **THEN** 系統 SHALL 以其最新 display_name 為初始 nickname 補建 user_profiles 列

### Requirement: 孤兒卡軟下架
系統 SHALL 對 user_id 不存在於 auth.users 的名片採軟下架而非永久刪除。

#### Scenario: 偵測孤兒卡
- **WHEN** 名片的 user_id 在 auth.users 找不到對應帳號
- **THEN** 系統 SHALL 設 `is_tag_visible = false`，並保留該列資料
