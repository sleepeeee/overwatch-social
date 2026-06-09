## ADDED Requirements

### Requirement: Database Seed Extensions
系統必須 (SHALL) 在資料庫 `game_special_tags` 資料表中，藉由 Migration 新增 12 個通用的特色標籤，且必須包含 `#積分玩家`、`#歡樂一般`、`#只打遊樂場`、`#歡迎開麥`、`#拒絕暴躁`、`#安靜推車`、`#尋找長期隊友`、`#深夜開打`、`#下班休閒`、`#認真組排`、`#不計輸贏`、`#專職補位`，並套用對應的莫蘭迪風格 `style_class` 配色。

#### Scenario: Database Migration Deployment
- **WHEN** 執行 Supabase 資料庫 migration 遷移部署時
- **THEN** `game_special_tags` 資料表中將寫入這 12 個新增的通用特色標籤，且在重複執行時不會發生衝突。

### Requirement: Frontend OW Card Tag Editing Support
系統必須 (SHALL) 確保前台編輯個人檔案卡片時，能夠正常讀取並呈現這 12 個通用的特色標籤供玩家選取。

#### Scenario: Edit Profile Card Tags
- **WHEN** 玩家進入編輯個人檔案頁面，並開啟鬥陣特攻卡片編輯器時
- **THEN** 編輯器中會顯示這 12 個新加入的通用標籤，且玩家能自由勾選最多 3 個標籤保存，並在個人卡片上正確渲染呈現。
