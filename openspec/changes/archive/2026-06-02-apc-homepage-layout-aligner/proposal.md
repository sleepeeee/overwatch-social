## Why

為了讓站長能在開發者控制台中精密調校首頁「站長隨筆手札」元件中各個細部區塊的位置，並能自定義圖片圖標，本變更旨在於「高階製程工具 (APC Tools)」底下新增「首頁內容精密調校儀」。此儀器支援手動調校 X/Y 軸偏移、縮放、字型大小，並整合圖片上傳，實現全站公告精密對準。

## What Changes

- **歸類至高階製程工具 (APC Tools)**：
  - 在「高階製程工具」中新增「首頁內容精密調校儀」子面板，使用 Segmented Buttons 選擇按鈕切換 01-04 公告的編輯。
- **圖標自定義圖片上傳**：
  - 支援將圖片檔案上傳，寫入本機 `public/uploads/` 並在首頁元件動態載入渲染以取代蓮花 SVG。
- **精密 X/Y 位移與 Typography 調校**：
  - 提供針對「圖標」、「標題」、「內文」、「按鈕組」的 X 軸與 Y 軸平移像素設定（transform translate）。
  - 提供針對「標題」與「內文」的字體大小調整。
  - 提供「圖標」的縮放比例（Scale）。

## Capabilities

### New Capabilities
- `apc-homepage-layout-aligner`: 於 APC Tools 中整合首頁公告精密對準微調與自訂圖片圖標上傳。

### Modified Capabilities
<!-- 無 -->

## Impact

- 影響的檔案：
  - `src/app/developer/DeveloperConsoleClient.tsx`
  - `src/components/morning-sketch/LotusWelcomeWidget.tsx`
  - `src/app/actions/homepage.ts`
  - `src/data/announcements.json`
