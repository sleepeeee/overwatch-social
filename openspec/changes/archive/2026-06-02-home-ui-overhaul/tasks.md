## 1. Hero 區與佈局調整

- [x] 1.1 修改首頁 `src/app/page.tsx` 的 Hero 區，全面更換為通用遊戲交友文案，並替換按鈕文字。
- [x] 1.2 在首頁中對調 Widget 佈局位置，將左側設為 LuckyAlly 容器，中間設為公告看板。

## 2. 核心組件重構與新增

- [x] 2.1 實作或改造左側 `LuckyAlly` 每日隨機隊友翻牌卡片組件，支援 `isFlipped` 狀態與翻牌效果。
- [x] 2.2 重構中間公告組件，保留並串接 `01-04` 按鈕狀態 `activeTab`，切換渲染站長手札、更新日誌、聯絡站長與支持贊助四個分頁。
- [x] 2.3 徹底重構右側 `FeaturedArtists.tsx` 為 `LobbyEvents.tsx`（或在其內重構），移除舊頭貼圖片與精選藝術家，改裝為簡約手帳風的揪團活動行事曆，並支援點擊「一鍵加入」功能。
- [x] 2.4 在首頁底部實作跨遊戲玩家卡片河道，混合 `LoLSquare`、`ValorantSquare` 與 `OverwatchSquare`，並套用 `overflow-x-auto` 橫向滑動效果。

## 3. 驗證與測試

- [x] 3.1 啟動本地開發伺服器，驗證首頁 Hero 區文案、看板分頁切換、幸運隊友翻牌、揪團加入功能均運作流暢，無任何排版與 TypeScript 錯誤。
