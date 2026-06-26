# 新增鬥陣特攻新英雄 Shion (死怨) 支援

## Why

《鬥陣特攻 2》於 2026 年 6 月 16 日正式推出了全新輸出位 (Damage) 英雄 Shion (繁體中文譯名為「死怨」)。作為一款與時俱進的玩家社群名片展示與探索平台，網站必須能即時更新並支援最新英雄，以便玩家能建立與展示最新的 Shion 專屬個人名片。

## What Changes

1. **英雄資料註冊**：在 `src/data/mockPlayers.ts` 的 `HEROES_CONFIG` 列表中註冊 `shion`，設定為輸出位 (damage)，並指定其立繪圖片路徑為本地的 `/images/heroes/full/shion.png`。
2. **主題色彩配置**：在 `src/data/heroBackgrounds.ts` 的 `HEROES_THEME_COLORS` 列表中新增 `shion` 的極簡主題色彩（主要與次要代表色，配合其橋本組與利爪背景，設計為暗黑賽博霓虹風）。
3. **靜態資源確認**：確保頭像檔 `shion.png` 位於 `public/images/heroes/avatars/`、立繪檔 `shion.png` 位於 `public/images/heroes/full/`，皆已完成就位。

## Non-Goals

- 不修改 Supabase 的資料庫 table schema 或進行 migration（已確認 selected_heroes 為 string 陣列，無硬編碼約束）。
- 不變動其他非 Overwatch 的遊戲區塊設定。
- 不開發 Shion 專屬的額外客製化 UI 組件，沿用現有英雄名片模板。

## Success Criteria

- 玩家進入「編輯名片」時，能在英雄清單中點選新英雄「死怨」，並且頭貼能正確顯示。
- 玩家儲存名片後，在個人名片上能正確看見 Shion 的立繪、頭貼與極簡漸層主題背景色。
- 在廣場頁面中能正常透過新英雄「死怨」進行名片篩選。
