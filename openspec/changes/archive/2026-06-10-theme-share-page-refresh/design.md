## Context

玩家分享頁面 `src/app/share/[id]/ShareCardClient.tsx` 目前仍然在使用舊版莫蘭迪淺色主題的樣式標記（如莫蘭迪水藍與棕色按鈕、深褐色文字、以及漂浮裝飾球 `<FluidClipPath />`）。這導致其與最新發佈的「曜石暗夜星塵」單主題風格格格不入。我們需要重構該元件的 Tailwind CSS 類別以完成翻新。

## Goals / Non-Goals

**Goals:**
- 將分享頁面重構為符合曜石暗色星空的主題色。
- 按鈕翻新：返回按鈕與建立特工卡片按鈕改為暗色玻璃擬態；導出按鈕改為極光漸層紫。
- 移除 `<FluidClipPath />` 裝飾，套用 `ambient-space-glows` 氛圍漸層。
- 調整右上角提示泡泡與下方文字配色，消除舊版莫蘭迪色殘留。

**Non-Goals:**
- 本次變更不改動 `OWCard` 玩家卡片內部的資訊布局。
- 不改動導出 PNG 的圖片產生逻辑。

## Decisions

### 1. 移除 `FluidClipPath` 並引入 `ambient-space-glows`
- **決策**: 刪除 `FluidClipPath` 引用，並在頁面頂層添加全螢幕固定定位的大氣漸層背景層。
- **原因**: 這樣能與廣場大廳的星空氛圍無縫銜接，提升視覺沉浸感。

### 2. 重構按鈕為暗色玻璃與漸層紫
- **決策**:
  - 導出按鈕：採用 `bg-gradient-to-r from-auroraTeal to-auroraMint` 漸層色。
  - 輔助按鈕：採用 `border-white/10 hover:border-auroraMint/30 bg-white/[0.01] hover:bg-white/[0.03]` 玻璃效果。
- **原因**: 漸層色能增強核心 Call-To-Action (💾 保存圖片) 的點擊引導，玻璃效果則能符合全站輕量化擬態卡片風格。

## Risks / Trade-offs

- **[Risk]** 在暗色背景下，卡片文字的對比度太低導致閱讀困難。
  - **[Mitigation]** 確保將所有文字（特別是下方說明）的顏色改為 `text-zinc-400` 或 `text-zinc-300`，提供充足的對比度，不得使用深暗褐色。
