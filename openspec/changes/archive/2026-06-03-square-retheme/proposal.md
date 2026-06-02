## Why

交友廣場各功能區塊（Hero 區、LFG section、Feed section、Hero Codex、Profile dashboard、Modal、Filter bar）已具備完整的架構與邏輯。然而，全站的視覺外觀在細部質感知覺、色彩飽和度、以及磨砂折射動效上仍有進步空間。

本次變更旨在進行「**純視覺換皮 (Visual-only redesign / re-theme)**」。在**完全不更動現有功能架構與邏輯**、且**不生成任何新圖檔**以節省 token 與效能的限制下，引進「薄膜干涉式微光玻璃擬態」作為全站統一的莫蘭迪沙灰暖調主題。

## What Changes

我們將對以下現有架構的視覺外皮進行換裝（Re-theme）：
- **全域配色與背景換裝**：替換為莫蘭迪灰暖沙背景色與半透微光邊框，加深與背景的空氣懸浮層次感。
- **Hero 區與 Header**：採用微光磨砂玻璃，移除過於生硬的背景色與陰影。
- **LFG section & Feed section (交友大廳與動態河道)**：玩家卡片（OWCard、OverwatchSquare 等）更換為「微光薄膜玻璃擬態卡片」，在滑鼠懸停 (Hover) 時展現 0.5px 光學干涉效果的微發光邊框。
- **Filter bar (過濾欄)**：按鈕與輸入框更換為沙灰色 Soft UI 樣式，輸入焦點具備平滑淡入的微發光環。
- **Profile dashboard & Modal (個人控制台與彈出視窗)**：彈出視窗與設定面版更換為 32px 圓角高透玻璃擬態面板。
- **Hero Codex (英雄圖鑑卡槽)**：優化 51 位特工卡槽的磨砂玻璃擬態深度，防止文字或按鈕在低對比度下難以閱讀。

*(此為純視覺換皮變更，所有現有的互動邏輯、API 請求與狀態管理皆維持原樣，且不涉及任何圖片資源的生成。)*

## Capabilities

### New Capabilities
*(無新增功能)*

### Modified Capabilities
- `art-ui-aesthetics`: 針對廣場頁面的玻璃面板卡片與背景微調設計細節，使其與最新的莫蘭迪暖灰沙色系完美融合。
- `browse`: 調整交友廣場卡片與搜尋過濾欄的外觀樣式。

## Impact

- **CSS & Styling**:
  - `src/app/globals.css`
- **Frontend Components**:
  - `src/app/browse/page.tsx`
  - `src/components/square/OverwatchSquare.tsx`
  - `src/components/OWCard.tsx`
  - `src/components/TopBar.tsx`
