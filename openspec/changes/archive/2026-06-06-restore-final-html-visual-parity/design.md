## Context

定版 HTML 是一個單檔 React 預覽，內含 Home、Lobby、Studio、Firebase/mock 登入與 localStorage。現站是 Next.js App Router，功能已拆為 `/`、`/browse`、`/profile`，並使用 Supabase。移植策略必須是「視覺與互動對齊 HTML，系統功能接回現站能力」。

## Decisions

### 1. 定版稿優先級

`after_midnight (3).html` 的視覺、文案、間距、玻璃面板、Logo、背景、按鈕與分頁節奏，優先級高於上一輪移植後的自由改造。

### 2. 開發者入口

開發者登入時顯示全站頂部模式條。該模式條同時是 `/developer` 入口，不再需要額外破壞 TopBar 的大顆橘色按鈕。

視覺規格：

- 背景：深曜石紫黑半透明。
- 邊線：薰衣草紫微光。
- 文字：星光白。
- 光點：紫色脈衝點。
- Hover：亮度微升，讓使用者知道可點擊。

### 3. 功能保留

HTML 裡的 Firebase 與本機 mock 僅作為互動意圖參考。Next 實作必須使用現站 Supabase 登入、`useDevMode` 權限判斷、Server Actions 與既有資料結構。

### 4. 修復順序

先修復全站入口與最小可驗收的功能破口，再進行 Home、Lobby、Studio 的視覺逐區塊對齊。每次改動都應避免影響 `/developer` 內部工具。

## Risks / Mitigations

- Risk: 再次自由發揮造成定版偏移。
  - Mitigation: 每一項 UI 調整都回到 HTML 對照，OpenSpec 任務只使用「對齊」語言。
- Risk: 開發者入口被藏起來。
  - Mitigation: `DevModeBanner` 本身變成入口，且只依 `useDevMode` 顯示。
- Risk: 定版 HTML 與現站資料系統不同。
  - Mitigation: 視覺照 HTML，資料與登入照現站。
