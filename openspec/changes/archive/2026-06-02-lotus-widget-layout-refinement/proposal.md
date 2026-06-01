## Why

站長隨筆手札（LotusWelcomeWidget）在目前的 UI 上存在部分視覺瑕疵：步進按鈕的 `animate-ping` 動態發光圈沒有垂直水平置中而顯得偏心；蓮花圖標的容器有 `pt-2` 導致圖標偏下；整體卡片內容因 `flex-grow` 使得間距過於鬆散且重心偏下。此變更旨在修復這些對齊 bug，並重新調整各個元件的垂直佈局以取得更和諧、更精緻的手帳風視覺呈現。

## What Changes

- **修正步進按鈕發光動畫置中**：在按鈕的 `animate-ping` 動態光圈加上完美置中定位，修復發光圈偏心歪斜的視覺瑕疵。
- **修正蓮花圖標偏心**：移除蓮花圖標容器的 `pt-2`，使其在容器內完全置中。
- **重構垂直佈局與視覺重心**：
  - 移除文字公告區的 `flex-grow flex flex-col justify-center` 鬆散排版。
  - 新增一個包裝容器，將文字公告區與按鈕組封裝在同一個 flex container 中，使用合理的 gap 緊湊排列。
  - 利用負 margin 將整個元件包裝區向上提拉，拉近與蓮花圖標的距離，使得視覺重心微偏上方，並釋放卡片底部的呼吸空間。
  - 限制公告內文的最大寬度以優化斷行與置中視覺美感。

## Capabilities

### New Capabilities
- `lotus-welcome-widget-layout-refinement`: 優化 LotusWelcomeWidget 的對齊、置中 bug，並重構其垂直排版以改善視覺重心。

### Modified Capabilities
<!-- 無 -->

## Impact

- 影響的檔案：
  - `src/components/morning-sketch/LotusWelcomeWidget.tsx`：主要重構與 bug 修復。
