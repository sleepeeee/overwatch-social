---
id: capture-hud-full-reimplementation
type: tasks
---

# Tasks: capture-hud-full-reimplementation

## Task 1 — 建立 `CaptureHudAdjusterClient.tsx`（完整移植）

- [x] 新建 `src/app/developer/capture-hud/CaptureHudAdjusterClient.tsx`
- [x] 實作頂層常數：GIT_HOOK_SCRIPT（完整 bash+python 腳本）、SVG_SOURCES（4 個 SVG）、PRESETS（6 個 preset）
- [x] 實作 useState 初始化（**SSR 安全**：所有 state 用 deterministic default，不在 useState initializer 讀 localStorage）
- [x] 實作 useEffect（[] 依賴，mount 後才讀 localStorage 並設 state）
- [x] 實作 useEffect（darkMode toggle、customData 計算、preset 同步）
- [x] 實作 handleSave（localStorage + saveCaptureDisplayNames Server Action）
- [x] 實作 handleReset（清除所有 outpost_* localStorage keys）
- [x] 實作 copyToClipboard（navigator.clipboard + execCommand fallback）
- [x] 實作 downloadFile / downloadSVG / downloadProductionHTML
- [x] 驗收：`npx tsc --noEmit` 無 error

## Task 2 — 頂部控制面板（6 preset + dark/light）

- [x] 6 個 preset 按鈕（live/winning/neutral/losing/noAuthor/error），active state 樣式
- [x] dark/light mode 切換按鈕（sun/moon icon）
- [x] 驗收：點擊各 preset 按鈕後，HUD 狀態正確切換

## Task 3 — 動態滑桿區 + 陣營設定面板

- [x] range input 0-100，onChange 設 preset = "custom" + setLeftPercent
- [x] 雙側 percent 標籤即時更新
- [x] 三個欄位：左名稱 / 右名稱 / 倉庫所有者（left/right 按鈕）
- [x] 儲存/重設按鈕
- [x] 驗收：輸入名稱後 HUD 即時同步顯示

## Task 4 — HUD 卡片（3 狀態完整）

- [x] cyber-corner-* brackets（4 角，顏色隨狀態變化）
- [x] hud-scanlines overlay
- [x] **ready 狀態**：
  - 玩家名稱 + PTS + 倉庫所有者標章（SVG + animate-hud-pulse）
  - 佔領進度條（藍/橙漸層 + 雙側 rounded）
  - radar knob（SVG，animate-[spin_10s_linear_infinite] + animate-hud-pulse）
  - 中點 MID 標記
  - 3 格 Stats（Commits/Additions/Deletions）：動態比例條
- [x] **no_author 狀態**：警告圖示 + git config 代碼區塊
- [x] **error 狀態**：錯誤圖示 + FORCE_RETRY 按鈕
- [x] Console Info Bar（status message）
- [x] 驗收：切換 preset 後 3 狀態正確渲染；Stats 比例條非 50/50 hardcode

## Task 5 — 右側 4 Tab 面板

- [x] Tab Bar（4 按鈕：manual/exporter/spec/code）
- [x] **manual tab**：
  - 角色對照 2x2 格
  - 自動化流程圖（3 步驟）
  - 部署步驟（有序列表 + 指令代碼塊）
  - GIT_HOOK_SCRIPT 代碼展示 + 「複製代碼」按鈕
  - 常見問題
- [x] **exporter tab**：
  - 下載整合版 HTML 按鈕（downloadProductionHTML）
  - 4 個 SVG 下載按鈕（downloadSVG）
- [x] **spec tab**：Repo Owner 防錯機制說明 + UX 狀態定義
- [x] **code tab**：4 個 SVG 原始碼 + 各自「複製」按鈕
- [x] 驗收：`rg "手冊\|manual" src/app/developer/capture-hud/CaptureHudAdjusterClient.tsx` 有命中

## Task 6 — 更新 `page.tsx` 引入 Client Component

- [x] 在 `src/app/developer/capture-hud/page.tsx` 引入 `CaptureHudAdjusterClient`
- [x] 傳入 `captureState` 作為 `initialState` prop
- [x] 驗收：訪問 `/developer/capture-hud` 頁面正常渲染

## Task 7 — 底部色板 + TypeScript + 整合驗收

- [x] 底部深色/淺色色板比較（2 個方塊）
- [x] `npx tsc --noEmit` 無 error
- [x] **SSR 安全驗收**：`rg "useState.*localStorage\|localStorage.*useState" src/app/developer/capture-hud/CaptureHudAdjusterClient.tsx` 無命中（確認無 SSR 不安全的初始化）
- [x] `rg "FORCE_RETRY" src/app/developer/capture-hud/CaptureHudAdjusterClient.tsx` 有命中
- [x] `rg "no_author\|noAuthor" src/app/developer/capture-hud/CaptureHudAdjusterClient.tsx` 有命中
- [x] `rg "GIT_HOOK_SCRIPT\|post-receive" src/app/developer/capture-hud/CaptureHudAdjusterClient.tsx` 有命中
- [x] **E2E 驗收**：訪問 `/developer/capture-hud`（開發環境），確認頁面正常渲染（非 500 錯誤）；developer E2E spec 已涵蓋 `/developer` 路由的基本存取測試
