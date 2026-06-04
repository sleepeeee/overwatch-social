## Context

目前專案使用 Next.js 15+ 與 Tailwind CSS v4。原本的 `DESIGN.md` 定位為日系禪意手繪（Morning Sketch）美學，且右上角只有一個單純切換明暗模式的月亮按鈕。
為了配合全新的 **AFTER MIDNIGHT** 品牌調性，且由於色彩與風格決策仍處於探索階段，我們需要實作一個**高度可擴充的多風格主題切換架構**，讓使用者可以直接在網頁上無縫切換多種實驗主題（如藍莓優格、森系香草等）。

## Goals / Non-Goals

**Goals:**
- 實作高度可擴充的主題切換架構，支援多套風格主題無縫切換。
- 將「藍莓優格」、「森系香草紙雕」、「極簡畫廊」與「瑞士現代」四套初始實驗主題配置進 `globals.css` 語義變數。
- 在 `TopBar` 中實作一個精緻的主題選單控制面板，並與現有的月亮/明暗切換按鈕整合。
- 使用 `localStorage` 記憶使用者的主題選擇。

**Non-Goals:**
- 不強行锁死任何單一色彩或風格。
- 本階段不設計最終的夜間版配色（夜間版主色調等明亮版定案後再做調整）。
- 不重排頁面 Section 佈局或移除現有功能。

## Decisions

### 1. 基於 CSS 變數與 HTML Class 的動態主題切換
- **方案**：在 `globals.css` 中定義一套動態語義變數（如 `--bg-main`、`--text-main`、`--color-accent`、`--shadow-card`）。當 `<html>` 載入特定 class（如 `theme-blueberry`、`theme-botanics`）時，覆寫這些語義變數。
- **理由**：與 Tailwind CSS v4 `@theme` 系統無縫集成，且架構極易擴充。未來若要增加新主題，只需在 CSS 中增加一組 class 覆寫即可，完全不需修改 JavaScript 邏輯。

### 2. 升級 TopBar 互動元件
- **方案**：將右上角原有的單一月亮 Button 升級為點擊可彈出主題選單的 Dropdown 面板。選單內含：明亮版主題（藍莓優格、森系香草、極簡畫廊、瑞士現代）的單選按鈕，以及夜間版切換按鈕。
- **理由**：保持原位置不變，但提供更豐富的互動性，符合多風格切換的視覺實測需求。

## Risks / Trade-offs

- **[Hydration Mismatch]** → 伺服器端渲染 (SSR) 與客戶端依據 `localStorage` 讀取的主題不一致，可能導致頁面初次渲染跳閃或 React 報錯。
  - *緩解方案*：主題初始化邏輯置於 `useEffect` 中執行，於元件 Mount 後才將對應的 class 掛載至 `document.documentElement`，並在 TopBar 元件中做掛載狀態防護（`mounted` state）。
