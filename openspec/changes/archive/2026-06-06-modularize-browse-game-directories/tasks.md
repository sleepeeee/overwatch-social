## 1. OpenSpec

- [x] 1.1 建立 `modularize-browse-game-directories` 提案
- [x] 1.2 記錄外層只選遊戲、各遊戲專區獨立管理篩選的設計決策

## 2. Logo 與背景

- [x] 2.1 將背景粒子改為 `after_midnight (5).html` 的緩慢漂移與滑鼠斥力版本
- [x] 2.2 加回低機率流星
- [x] 2.3 將 `CosmicFullLogo` 替換為新版 Logo 動態與雲朵位置

## 3. 導覽

- [x] 3.1 移除全站底部 `FloatingDock`
- [x] 3.2 修正 TopBar 為定版橫排導覽，減少頁面縫隙

## 4. 玩家展示館架構

- [x] 4.1 `/browse` 外層只保留遊戲選擇
- [x] 4.2 新增 `src/components/browse/overwatch/` OW 專區入口
- [x] 4.3 將 OW 搜尋、伺服器、定位、語音篩選移入 OW 專區
- [x] 4.4 將 OW 篩選按鈕改成新版暗夜主題
- [x] 4.5 確認 Valorant / League 不共用 OW 篩選器

## 5. 工作室守門

- [x] 5.1 將 dev mock login 改為環境變數開關
- [x] 5.2 確認未登入時可顯示工作室守門畫面

## 6. 驗證

- [x] 6.1 執行 `npm run build`
