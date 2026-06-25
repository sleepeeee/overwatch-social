## 1. 靜態資源確認

- [x] 1.1 確認頭部貼圖 `public/images/heroes/avatars/shion.png` 檔案正常。
- [x] 1.2 確認立繪貼圖 `public/images/heroes/full/shion.png` 檔案正常。

## 2. 註冊新英雄

- [x] 2.1 於 `src/data/mockPlayers.ts` 的 `HEROES_CONFIG` 陣列末端新增 Shion 資訊。
- [x] 2.2 於 `src/data/heroBackgrounds.ts` 的 `HERO_THEME_COLORS` 字典新增 Shion 主題代表色 (`#1a092a` 與 `#ff2a5f`)。

## 3. 專案驗證

- [x] 3.1 執行 `npx tsc --noEmit` 確保 TypeScript 型別安全，無遺漏定義。
- [x] 3.2 執行 `npm run dev` 啟動本機伺服器。
- [x] 3.3 人工驗證：
    - 進入個人檔案編輯頁面，確認英雄選擇列表中有「死怨」頭像可供勾選。
    - 儲存名片後，於名片卡片上能正確展示 Shion 的半身立繪與深紫霓虹桃紅主題漸層。
    - 於廣場首頁，確認「死怨」可作為英雄篩選條件。
