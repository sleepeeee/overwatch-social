# profiles Specification

## Purpose
TBD - created by archiving change google-oauth-supabase-auth. Update Purpose after archive.
## Requirements
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

### Requirement: 解禁特戰英豪與英雄聯盟名片自定義 (Enable Valorant and LoL Cards Customization)
系統 **SHALL** 允許玩家在個人檔案工作室（`profile/page.tsx`）中點選切換並編輯《特戰英豪 (Valorant)》與《英雄聯盟 (LoL)》名片，且名片之背景、特色標籤與表單主色調 **MUST** 與目前編輯之遊戲種類色彩進行動態聯動：
- 《鬥陣特攻 (OW)》：套用 `amber` 橘黃色調
- 《特戰英豪 (Val)》：套用 `rose` 紅色調
- 《英雄聯盟 (LoL)》：套用 `blue` 藍色調

#### Scenario: 玩家切換至特戰英豪名片進行編輯
- **WHEN** 玩家在主控台點擊編輯「特戰英豪名片」時
- **THEN** 系統進入編輯狀態，且名片表單與標籤配色自動切換為 `rose` 色系，並啟用相應之特色標籤

---

### Requirement: 常用立繪三插槽依序填入與自訂移除 (Hero Showcase Three Slots Sequencing & Removal)
在名片自訂編輯器中，當玩家點擊英雄立繪清單時，系統 **SHALL** 依據目前已選插槽數量「依序填入」空缺插槽（最多 3 個）。已選英雄再次點選 **SHALL** 將其移除，且每個插槽右上角 **MUST** 顯示 `✕` 按鈕，點擊 `✕` **SHALL** 僅清空該特定插槽（不打亂其他插槽內英雄）。立繪圖片 **SHALL** 具備破圖防護 fallback 背景，以防圖片路徑無效時顯示空白或破圖符號。

#### Scenario: 依序填入三個常用英雄
- **GIVEN** 玩家未選擇任何常用英雄，插槽 1, 2, 3 皆為空
- **WHEN** 玩家點選第一個英雄「安娜 (Ana)」，接著點選第二個英雄「源氏 (Genji)」
- **THEN** 安娜被放入插槽 1，源氏被放入插槽 2
- **WHEN** 玩家點選插槽 1 的右上角 `✕` 按鈕
- **THEN** 插槽 1 變為空，插槽 2 仍維持 Genji

---

### Requirement: 溝通語言限制與編輯 UI (Languages Selection Limit & UI)
在特工名片自訂編輯器中，系統 **SHALL** 允許玩家最多選取 3 個溝通語言。當點選已選取的語言時將其移除；若已選取滿 3 個，當玩家嘗試點選第 4 個語言時，系統 **SHALL** 拒絕該選取並顯示錯誤提示：「溝通語言最多只能選擇三個喔，以維護卡片完美視覺！」。UI 上 **MUST** 即時顯示已選取語言數量（例如：「已選 X / 3」）。

#### Scenario: 玩家選取溝通語言至上限
- **GIVEN** 玩家已選取「繁體中文」與「English」兩種語言
- **WHEN** 玩家點選「日本語」
- **THEN** 「日本語」被成功選取，語言列表變為「繁體中文、English、日本語」
- **AND** 顯示已選數量變為 「已選 3 / 3」
- **WHEN** 玩家嘗試再點選「한국어」
- **THEN** 系統拒絕該選取，並彈出錯誤訊息：「溝通語言最多只能選擇三個喔，以維護卡片完美視覺！」
- **AND** 已選取的語言列表維持不變

#### Scenario: 玩家取消選取溝通語言
- **GIVEN** 玩家已選取「繁體中文」與「English」兩種語言
- **WHEN** 玩家點選已選取的「English」
- **THEN** 「English」被成功取消選取，語言列表變為「繁體中文」
- **AND** 已選數量變為 「已選 1 / 3」
