# browse Specification

## Purpose
TBD - created by archiving change browse-quality-fixes. Update Purpose after archive.
## Requirements
### Requirement: 廣場示範模式明確告知
當鬥陣特工廣場顯示示範資料（Supabase 空資料或連線失敗）時，系統 **SHALL** 顯示告知橫幅。

#### Scenario: Supabase 無真實資料
- **WHEN** Supabase 查詢成功但回傳 0 筆 profiles
- **THEN** 系統 SHALL 顯示橫幅「目前顯示的是示範資料，廣場尚無真實玩家名片」
- **AND** 橫幅顯示期間，示範玩家卡片仍可瀏覽（不消失）

#### Scenario: 真實資料出現
- **WHEN** Supabase 查詢回傳 ≥ 1 筆 is_tag_visible=true 的 profiles
- **THEN** 系統 SHALL NOT 顯示示範資料橫幅
- **AND** 廣場顯示真實玩家資料

### Requirement: Server-side 搜尋
廣場搜尋 **SHALL** 在 Supabase DB 層執行，不得在前端過濾全量資料。

#### Scenario: 輸入搜尋關鍵字
- **WHEN** 使用者在廣場搜尋框輸入文字（300ms debounce 後）
- **THEN** 系統 SHALL 向 Supabase 發送 `.ilike()` query（battle_tag、message、mbti 欄位）
- **AND** 回傳結果筆數 ≤ PAGE_SIZE（20）

#### Scenario: 搜尋結果分頁
- **WHEN** 廣場顯示 20 筆結果且可能有更多
- **THEN** 系統 SHALL 顯示「載入更多」按鈕
- **WHEN** 使用者點擊「載入更多」
- **THEN** 系統 SHALL append 下一批 ≤ 20 筆到現有列表

---

### Requirement: 玩家詳細頁
系統 **SHALL** 提供 `/player/[id]` 路由，展示單一玩家的完整公開資料。

#### Scenario: 點擊廣場玩家卡片
- **WHEN** 使用者在廣場點擊任一玩家卡片
- **THEN** 系統 SHALL 導向 `/player/{user_id}`

#### Scenario: 詳細頁基本資訊
- **WHEN** 任何人（含未登入）訪問 `/player/{id}`
- **THEN** 系統 SHALL 顯示：英雄立繪、BattleTag、標籤、留言、伺服器、MBTI、語言、麥克風狀態

#### Scenario: 聯絡方式登入限制
- **WHEN** 未登入使用者訪問 `/player/{id}`
- **THEN** 系統 SHALL 顯示「登入後查看聯絡方式」提示，不顯示 Discord 等資訊

#### Scenario: 玩家不存在或隱私
- **WHEN** 訪問的 user_id 不存在，或 is_tag_visible = false
- **THEN** 系統 SHALL 顯示「玩家不存在或已將名片設為私密」，不 crash

