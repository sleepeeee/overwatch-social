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

