## Why

目前專案的首頁 (Landing Page) 視覺與文案高度綁定「鬥陣特攻」，且排版較為靜態，缺乏玩家黏著度與直接的組隊互動功能。本變更旨在全面進行首頁 UI 大改版 (Home Overhaul)，引進跨遊戲社交理念，並新增「今日幸運隊友翻牌」與「本週玩家揪團行事曆」等深度互動 Widget，提升網站活躍度與實用性。

## What Changes

- **紅色區塊 (Hero)**：文案全面去鬥陣特攻化，更換為面向所有遊戲玩家的引導，包含按鈕字樣調整。
- **紫色區塊 (新中間)**：改裝原本的 `LotusWelcomeWidget` 為「站長多功能公告看板」，保留 `01-04` 選項切換按鈕，可點擊切換「站長手札」、「更新日誌」、「聯絡方式」、「支持贊助」等不同卡片。
- **藍色區塊 (新左側)**：新增「今日幸運隊友 (Lucky Ally)」翻牌小組件，玩家可點擊卡片進行「每日抽卡」，推薦一位靈魂契合度高的玩家。
- **綠色區塊 (右側)**：徹底移除 Hevelius 等人寫死的舊頭貼與推薦名單，重新實作為簡約手帳風的「玩家揪團行事曆 (Lobby Events)」，展示揪團活動並提供一鍵加入。
- **粉色區塊 (底段)**：文案通用化，混合 Valorant, LoL, OW 三種遊戲的卡片，做成 overflow-x 橫向流暢滾動的「卡片河道」。

## Capabilities

### New Capabilities
- `lucky-ally`: 今日幸運隊友翻牌每日抽卡功能
- `lobby-events`: 本週玩家揪團行事曆簡約無頭貼清單功能
- `home-overhaul`: 首頁去鬥陣特攻化與版面位置對調大改版功能

### Modified Capabilities
<!-- 無 -->

## Impact

- 影響主要分頁的路由主體頁面 `src/app/page.tsx`。
- 修改或重新實作 `FeaturedArtists` 元件（改裝為 `LobbyEvents`）與 `LotusWelcomeWidget`。
- 引入新的跨遊戲渲染，將 `LoLSquare` 與 `ValorantSquare` 合併渲染至首頁河道。
