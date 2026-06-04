---
change: user-identity-global-nickname
artifact: spec
---

# Spec: user-identity-global-nickname

## REQ-01：user_profiles 表建立

**Requirement**：系統應建立 `user_profiles` 表，每個 Supabase auth.users 最多一行。

**Scenario 1.1 — 建表**
- WHEN migration 015 執行
- THEN `user_profiles (user_id PK, nickname TEXT nullable, created_at, updated_at)` 存在
- AND `user_id` FK → `auth.users(id) ON DELETE CASCADE`

**Scenario 1.2 — RLS**
- WHEN anon 用戶 SELECT user_profiles
- THEN 僅可讀取 `nickname`, `user_id`（public read）
- WHEN 任意用戶 UPDATE user_profiles WHERE user_id != own user_id
- THEN 被 RLS 拒絕

**Scenario 1.3 — developer 可讀全部**
- WHEN developer 角色 SELECT user_profiles
- THEN 可讀取所有 row 含 nickname

## REQ-02：現有用戶遷移

**Requirement**：migration 015 執行後，有 display_name 的現有用戶應自動取得初始 nickname。

**Scenario 2.1 — 遷移結果**
- WHEN migration 015 成功執行
- THEN `user_profiles` row 數 ≥ 已有非空 display_name 的 user 數
- AND 每個遷移用戶的 nickname = 其最後更新 profile 的 display_name

**Scenario 2.2 — 空 display_name 不遷移**
- WHEN 用戶的所有 profiles.display_name 皆為空或 null
- THEN 該用戶在 user_profiles 有一行但 nickname IS NULL

## REQ-03：saveNickname Server Action

**Requirement**：登入用戶應可儲存/更新自己的 nickname。

**Scenario 3.1 — 首次設定**
- WHEN 登入用戶呼叫 saveNickname("SleepyAgent")
- THEN user_profiles upsert 成功，nickname = "SleepyAgent"
- AND 回傳 `{ success: true }`

**Scenario 3.2 — 更新 nickname**
- WHEN 已有 nickname 的用戶呼叫 saveNickname("NewName")
- THEN user_profiles 更新 nickname = "NewName"

**Scenario 3.3 — 清空 nickname（設為空）**
- WHEN 用戶呼叫 saveNickname("")
- THEN user_profiles nickname 設為 NULL（不存空字串）

**Scenario 3.4 — 未登入**
- WHEN 未登入用戶呼叫 saveNickname
- THEN 回傳 `{ error: "Unauthorized" }`

**Scenario 3.5 — nickname 長度限制**
- WHEN 用戶輸入長度 > 30 的 nickname
- THEN 回傳 `{ error: "暱稱長度不可超過 30 字元" }`

## REQ-04：Profile Hub nickname 編輯 UI

**Requirement**：Profile Hub 應顯示 nickname 輸入欄位，可選填、可清空。

**Scenario 4.1 — 載入時顯示現有 nickname**
- WHEN 用戶進入 /profile Hub
- THEN nickname input 顯示 user_profiles.nickname（若有）
- AND 若無 nickname，placeholder 顯示 user_id（提示「目前以 ID 顯示」）

**Scenario 4.2 — 儲存**
- WHEN 用戶輸入 nickname 並點「儲存」
- THEN 呼叫 saveNickname()，成功後顯示 toast 確認

## REQ-05：Dev console 第一層用戶列表

**Requirement**：dev console 用戶管理 tab 應顯示每個用戶的 nickname + user_id + 遊戲清單。

**Scenario 5.1 — 列表顯示**
- WHEN developer 開啟用戶管理 tab
- THEN 顯示用戶列表，每行包含：
  - nickname（若無則顯示 user_id 縮短版前 8 碼）
  - user_id（完整，可複製）
  - 遊戲 badge 清單（如 [OW] [LoL]）
  - 展開按鈕

**Scenario 5.2 — nickname 搜尋**
- WHEN developer 在搜尋框輸入關鍵字
- THEN 列表篩選為 nickname ILIKE '%keyword%' 的用戶
- AND 無 nickname 的用戶在無搜尋條件時仍顯示

**Scenario 5.3 — 無 nickname 用戶**
- WHEN 用戶 user_profiles.nickname IS NULL
- THEN 第一層顯示：`[未設定暱稱] user_id前8碼...`

## REQ-06：Dev console 第二層角色卡詳情

**Requirement**：點展開按鈕後，inline 顯示該用戶各遊戲角色卡詳細資訊。

**Scenario 6.1 — 展開**
- WHEN developer 點擊某用戶的展開按鈕
- THEN 展開區域顯示該用戶所有 game 的角色卡詳情
- AND 詳情包含：battle_tag、server、selected_heroes、tags、message、updated_at
- AND 第一次展開時才 fetch 資料（lazy load）

**Scenario 6.2 — 收合**
- WHEN developer 再次點擊展開按鈕
- THEN 詳情區域收合

**Scenario 6.3 — 無角色卡**
- WHEN 用戶 user_profiles 存在但 profiles 無對應 row
- THEN 展開後顯示「此用戶尚未建立任何角色卡」

## REQ-07：public_profiles view 更新

**Requirement**：public_profiles view 應包含 nickname 欄位。

**Scenario 7.1 — view 包含 nickname**
- WHEN anon 查詢 public_profiles
- THEN 結果含 nickname 欄位（可為 null）
- AND 若用戶有 user_profiles.nickname 則顯示，否則 null
