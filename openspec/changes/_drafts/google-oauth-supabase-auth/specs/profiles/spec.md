# profiles Spec Delta

## ADDED Requirements

### Requirement: profiles 資料模型
系統 SHALL 在 Supabase 建立 `profiles` 表，逐欄對應 `OWPlayerCard` 型別，並以 `user_id` 連結 `auth.users(id)`。

#### Scenario: 名片欄位完整對應型別
- **WHEN** 建立 profiles 表 migration
- **THEN** 表 SHALL 包含 server / battle_tag / is_tag_visible / selected_heroes / tags / message / languages / mic_status / social_channels / mbti 欄位
- **AND** `user_id` SHALL 為 primary key 並 references `auth.users(id)`

### Requirement: 名片授權（RLS）
系統 SHALL 對 `profiles` 表啟用 Row Level Security：僅登入本人可讀寫自己完整的 row（含 social_channels）；公開讀取 SHALL 透過 `public_profiles` view 進行，不直接開放 profiles 整表給 anon key。

#### Scenario: 登入使用者讀取自己的完整名片
- **WHEN** 已登入使用者讀取 `/profile`
- **THEN** 系統 SHALL 允許 `user_id = auth.uid()` 讀取該 row 的所有欄位（含 social_channels）

#### Scenario: 登入使用者寫入自己的名片
- **WHEN** 已登入使用者儲存名片
- **THEN** RLS SHALL 允許 `user_id = auth.uid()` 的 insert/update

#### Scenario: 阻擋寫入他人名片
- **WHEN** 任何身分嘗試寫入 `user_id != auth.uid()` 的 row
- **THEN** RLS SHALL 拒絕該寫入

#### Scenario: 阻擋未登入寫入
- **WHEN** 未登入請求嘗試寫入 profiles
- **THEN** RLS SHALL 拒絕（無 authenticated 身分）

### Requirement: public_profiles view（DB 層隱私遮蔽）[修正 Critical 隱私洞]
系統 SHALL 建立 `public_profiles` view，作為廣場唯一的公開讀取介面。此 view 在 DB 層執行隱私遮蔽，確保 anon key 無法繞過前端邏輯讀取敏感欄位。

#### Scenario: is_tag_visible=false 的名片在 DB 層遮蔽
- **WHEN** 任何查詢（含 anon key）讀取 `public_profiles`
- **THEN** 對 `is_tag_visible = false` 的 row，`battle_tag` SHALL 回傳固定字串 `'隱藏#xxxx'`
- **AND** `social_channels` SHALL 不包含在 view 欄位中

#### Scenario: is_tag_visible=true 的名片正常公開
- **WHEN** 任何查詢讀取 `public_profiles`
- **THEN** 對 `is_tag_visible = true` 的 row，除 `social_channels` 外的欄位正常回傳

#### Scenario: anon key 無法直接查 profiles 整表
- **WHEN** anon key 對 `profiles` 表直接 SELECT
- **THEN** RLS SHALL 拒絕或回傳空結果（profiles 表無 public SELECT policy）

> **設計決策**：`social_channels` 從 public_profiles 中完全排除。聯絡資訊僅在登入使用者讀取自己的 profile 時透過 authenticated RLS policy 取得，不在廣場公開。

### Requirement: /profile 名片讀寫
`/profile` 頁 SHALL 以 Supabase 取代 localStorage：登入後載入本人 profile（含 social_channels）、儲存寫回 Supabase；未登入則不可編輯儲存。

#### Scenario: 登入後載入既有名片
- **WHEN** 已登入使用者開啟 `/profile`
- **THEN** 系統 SHALL 從 profiles 載入該使用者的名片（無則用預設值）

#### Scenario: 未登入存取編輯器
- **WHEN** 未登入使用者開啟 `/profile`
- **THEN** 系統 SHALL 提示登入，且不提供儲存功能

### Requirement: /browse 廣場資料源
`/browse` 廣場 SHALL 從 `public_profiles` view 讀取名片，取代 `mockPlayers.ts` 假資料。`social_channels` 不在廣場顯示。

#### Scenario: 廣場顯示已在 DB 層遮蔽的名片
- **WHEN** 任何使用者（含未登入）開啟 `/browse`
- **THEN** 系統 SHALL 從 `public_profiles` view 讀取名片
- **AND** `is_tag_visible = false` 的名片 `battle_tag` 由 DB view 處理，前端無需額外遮蔽邏輯
