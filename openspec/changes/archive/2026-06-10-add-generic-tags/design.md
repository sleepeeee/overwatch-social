## Context

目前系統中，鬥陣特攻卡片的特色標籤資料是由 Supabase PostgreSQL 中的 `game_special_tags` 資料表儲存。
前端在個人檔案設定頁 [profile/page.tsx](file:///D:/AI/overwatch/overwatch-social/src/app/profile/page.tsx) 藉由呼叫 `getGameSpecialTags("overwatch")` Server Action 來取得所有標籤，並讓玩家選取。

## Goals / Non-Goals

**Goals:**
- 在 `game_special_tags` 資料表中新增 12 個通用的特色標籤，並套用合適的莫蘭迪配色樣式。
- 透過新增 SQL Migration 檔案來自動化部署這些標籤，以便在開發與線上環境同步。
- 確保前台卡片編輯器能夠正常撈取這些新標籤，並正確儲存與渲染。

**Non-Goals:**
- 本次變更不涉及其他遊戲項目的標籤（僅限 `game_id = 'overwatch'`）。
- 本次不改動後台管理介面（[TagsManagerClient.tsx](file:///D:/AI/overwatch/overwatch-social/src/app/developer/tags-manager/TagsManagerClient.tsx)）的 UI 設計。

## Decisions

### 1. 使用獨立 SQL Migration 檔案新增標籤
- **決策**: 新增 `supabase/migrations/018_insert_generic_tags.sql` 來執行插入。
- **原因**: 這樣可以保持資料庫的版本歷程，方便團隊成員拉取最新程式碼後自動套用，且符合 Supabase 的標準開發流。
- **備選方案**: 手動在 Supabase Dashboard 插入（缺點：無法在團隊間同步與版控，故放棄）。

### 2. 標籤帶有前綴 `#` 符號
- **決策**: 統一將新標籤命名為 `#` 開頭（例如 `#積分玩家`）。
- **原因**: 這樣在前台卡片展示時，視覺上更有 Tag 的專屬感。

## Risks / Trade-offs

- **[Risk]** 執行 Migration 時發生資料重複插入或主鍵衝突。
  - **[Mitigation]** 在 SQL 寫入時使用 `INSERT INTO ... ON CONFLICT DO NOTHING` 或在 name 設定 unique 約束（如已有），確保 Migration 可重複執行 (idempotent)。
