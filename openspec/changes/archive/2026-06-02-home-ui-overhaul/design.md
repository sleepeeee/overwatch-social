## Context

專案的首頁需要從「鬥陣特攻交友」改版為「多遊戲通用交友」大廳，並在視覺上融合朝陽手帳風 (Morning Sketch Visuals)。為了完成此目標，我們將重構 `src/app/page.tsx` 及其子組件。

## Goals / Non-Goals

**Goals:**
- 將首頁文案與 Actions 全面去鬥陣特攻化，支援通用遊戲玩家。
- 將 LuckyAlly (幸運隊友) 移到左側，Admin公告看板移到中間。
- 中間的 Admin公告看板保留 `01-04` 按鈕，點擊切換 4 個不同的公告分頁。
- 右側 FeaturedArtists 改裝為 LobbyEvents (揪團行事曆)，移除舊頭像，以簡約無頭貼手帳風格清單呈現，支援一鍵加入。
- 底部最新玩家區改為橫向滾動河道，並混合 LoL、Valorant、OW 玩家卡片。

**Non-Goals:**
- 不修改後端 Supabase Schema 或資料表結構。
- 不影響個別玩家詳細設定頁。

## Decisions

### 1. 板塊對調與 Hero 區文案調整
- 在 `src/app/page.tsx` 中直接更換 HTML/TSX 文案。
- 將 grid 佈局中的組件順序更換，將 `LuckyAlly` (或新組件) 置左，`LotusWelcomeWidget` (或新公告組件) 置中。

### 2. 實作 LuckyAlly (今日幸運隊友翻牌 - 左側)
- 設計一個 `LuckyAlly` 組件，使用狀態 `isFlipped: boolean` 記錄玩家是否翻牌。
- 翻牌後，自 mock 玩家資料中隨機抽取一名玩家，並展示其卡片資訊。

### 3. 改裝 LotusWelcomeWidget 為多公告看板 (中間)
- 保留原本的 `01` 到 `04` 圓形按鈕。
- 使用 `activeTab: number` (1-4) 狀態控制當前顯示的內容分頁：
  - `01`：站長隨筆 (Admin's Column)。
  - `02`：更新日誌 (Changelog)。
  - `03`：聯絡管理者 (Discord/Github)。
  - `04`：贊助咖啡 (Coffee Donation)。

### 4. 重構 FeaturedArtists 為 LobbyEvents (右側)
- 刪除舊頭貼圖片載入，徹底移除精選藝術家列表。
- 建立一個清爽的 `LobbyEvents` 組件，內部使用 `events` 陣列（模擬揪團資料：時間、標題、上限人數與目前人數）。
- 每行活動配備一鍵加入按鈕，點擊可動態遞增目前人數。

### 5. 跨遊戲名片河道實作 (底段)
- 混合 `OverwatchSquare`、`ValorantSquare` 與 `LoLSquare` 三種組件。
- 使用 Tailwind 的 `flex overflow-x-auto scrollbar-none` 並配置 CSS 遮罩（Mask Image）製作邊緣半透明漸層流動效果。

## Risks / Trade-offs

- **風險**：首頁河道渲染多種遊戲卡片可能造成編譯體積微增。
- **緩解**：均為 Client / Server 優化組件，影響極微。
