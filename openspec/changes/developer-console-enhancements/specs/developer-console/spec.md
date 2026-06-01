## ADDED Requirements

### Requirement: 開發者可讀取所有用戶 Profiles
系統 **SHALL** 允許具有 `app_metadata.role = 'developer'` 的已認證用戶，透過 Supabase RLS policy 讀取 `profiles` 表中所有 row（不含 `social_channels`）。

#### Scenario: Developer 讀取他人 Profile
- **WHEN** 已認證且 `app_metadata.role = 'developer'` 的用戶呼叫 `getAllProfilesForDeveloper()`
- **THEN** 系統 SHALL 回傳所有 profiles 的 `user_id`, `battle_tag`, `is_tag_visible`, `selected_heroes`, `updated_at`
- **AND** 系統 SHALL NOT 回傳 `social_channels`（私人聯絡方式）

#### Scenario: 非開發者不能讀取他人 Profile
- **WHEN** 一般已認證用戶呼叫 `getAllProfilesForDeveloper()`
- **THEN** 系統 SHALL 拋出 "Unauthorized: Developer privilege required."

---

### Requirement: 英雄流行度統計顯示
系統 **SHALL** 在開發者後台的系統概覽 tab 中，顯示前 5 名最多玩家選用的英雄及其選用次數。

#### Scenario: Overview tab 顯示 Hero Stats
- **WHEN** 開發者進入 `/developer`（Overview tab）
- **THEN** 系統 SHALL 顯示 Top 5 英雄，每筆含英雄 ID 與選用次數
- **AND** 若 profiles 總數為 0 則顯示「尚無數據」提示

---

### Requirement: 用戶管理 Tab
系統 **SHALL** 在開發者後台新增第 4 個 Tab「用戶管理」，列出所有注冊玩家的名片基本資訊。

#### Scenario: 用戶管理 Tab 列表
- **WHEN** 開發者點選「用戶管理」tab
- **THEN** 系統 SHALL 顯示最多 100 筆 profiles，每筆含 BattleTag、英雄數量、可見性狀態、更新時間
- **AND** 系統 SHALL 提供 client-side 搜尋框，依 BattleTag 過濾顯示

#### Scenario: 搜尋功能
- **WHEN** 開發者在搜尋框輸入文字
- **THEN** 系統 SHALL 即時過濾顯示 BattleTag 包含該文字的 profiles（不區分大小寫）
