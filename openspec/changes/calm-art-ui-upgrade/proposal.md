## Why

當前 OW Social 網站功能健全，但在視覺形態、觸感與背景層次上，仍帶有較為硬挺、剛硬的「科技精確度與賽博偏光」感（如點矩陣背景、高精度圓形進度環與科技旋轉雷達）。這在一定程度上限制了平台的溫柔度與安靜感。
本提案旨在於不改動現有功能與莫蘭迪暖灰沙色系（Style A/B/AB 主題）的前提下，全面升級前端美學為 **Calm Premium Art-UI**。藉由導入微米級噪點紙質、物理多重軟陰影、有機溫潤大圓角、流體貝茲裝飾線與禪意水面漣漪，為使用者營造出高級、安靜、溫柔、有著藝術插畫感的特工交友空間。

## What Changes

*   **全站紙張顆粒質感 (Paper-like Texture)**: 在全站最頂層（`body::before`）疊加一微米級極淡 SVG 噪點濾鏡，模擬實體水彩紙或手工棉紙的溫潤顆粒觸覺。
*   **有機溫潤大圓角卡片 (Organic Card Roundings)**: 玻璃面板（`glass-panel`）圓角全面由 `24px` 提升到 `32px` ~ `38px`，甚至採用不規則的黏土般溫和不對稱圓角。
*   **多層物理軟陰影 (Whispering Shadows)**: 重寫玻璃卡片陰影為多層擴散的極低飽和度投影，搭配卡片頂部的高光內陰影，賦予其漂浮於雲霧之上的空氣感。
*   **雲霧薄幕層疊背景 (Misty Layers Background)**: 移除硬挺的 `.cyber-dots`，將現有的莫蘭迪柔藍與暖沙底色與三個帶有大模糊（`130px`）的低飽和光暈結合，以極慢速的呼吸動畫在背景挪動，營造高級的呼吸層次。
*   **首頁 Hero 禪意美學重構 (Zen Hero Page)**: 移除 Hero 卡片的偏光旋轉雷達與座標偏光懸停，改為手繪感禪意同心圓虛線與動態微瀾，並重新設計 Tasks Overview 的進度環為手繪筆刷水彩圓弧。
*   **導航列與按鈕鵝卵石化 (Floating Dock Pebble Upgrade)**: 移除導航列的科技 macOS 魚眼縮放，換成極為柔順的「溫潤水滴微膨脹與水彩渲染」互動；按鈕全面去尖銳與去科技漸層。

## Capabilities

### New Capabilities
- `art-ui-aesthetics`: 優雅安靜的 Calm Premium Art-UI 前端視覺與觸感美學。包含微米噪點紙質濾鏡、物理多重軟陰影、有機不對稱大圓角、背景貝茲裝飾線、雲霧薄幕層疊與手繪水彩圖表。

### Modified Capabilities
<!-- 無 requirement 變更，不改動原有功能與資料庫 -->

## Impact

*   **影響檔案**: 
    *   `src/app/globals.css` (全局樣式與 Tokens)
    *   `src/app/layout.tsx` (置入全新背景裝飾元件)
    *   `src/app/page.tsx` (首頁 Hero 區塊與進度環圖表重構)
    *   `src/components/morning-sketch/FloatingDock.tsx` (導航列水滴互動優化)
    *   `src/components/morning-sketch/LotusWelcomeWidget.tsx` (大圓角與歡迎卡片微調)
*   **全新建立**: 
    *   `src/components/morning-sketch/ArtOrnament.tsx` (流體線條、波浪邊界、雲霧形狀、淡色光暈之背景裝飾層)
*   **API 與依賴**: 無 API 變更。
