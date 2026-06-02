## ADDED Requirements

### Requirement: VAL/LoL 廣場誠實標示
系統 **SHALL** 在 Valorant 和 League of Legends 廣場 tab 中，以「敬請期待」畫面取代假玩家卡片，不得渲染任何 Mock 玩家資料。

#### Scenario: 點選 Valorant tab
- **WHEN** 使用者在廣場點選「特戰英豪 Valorant」tab
- **THEN** 系統 SHALL 顯示「特戰英豪廣場」標題 + 說明文字 + 「敬請期待」badge
- **AND** 系統 SHALL NOT 渲染任何玩家名片或模擬資料

#### Scenario: 點選 LoL tab
- **WHEN** 使用者在廣場點選「英雄聯盟 League of Legends」tab
- **THEN** 系統 SHALL 顯示「英雄聯盟廣場」標題 + 說明文字 + 「敬請期待」badge
- **AND** 系統 SHALL NOT 渲染任何玩家名片或模擬資料

---

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
