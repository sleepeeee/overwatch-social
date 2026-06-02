---
id: REF-015
type: docs
title: Developer Outpost HUD 完整設計規格（HTML 原始稿分析）
url: n/a
status: active
references_to: [REF-002, REF-005]
referenced_by: [F-008, ADR-08]
---

## 摘要

`developer_outpost_hud_plugin (4).html` 是 Git Outpost HUD 系統的完整設計稿，包含所有互動功能與視覺規格。本 REF 記錄從 HTML 分析出的功能清單，作為 `capture-hud-full-reimplementation` change 的規格依據。

## 功能清單（完整）

### A. 頂部控制面板
- 6 個 preset 切換按鈕：真實資料 / 你方壓制 / 中立對峙 / 敵方壓制 / 未設作者 / 資料缺失
- 深色/淺色模式切換（darkMode state）

### B. 動態滑桿區（status 非 no_author/error 時顯示）
- range input 即時調整左方佔領比率
- 雙側 percent 標籤即時更新
- 「重設預設」按鈕（preset 為 custom 時顯示）

### C. 陣營設定面板
- 左方/右方營地名稱輸入框（即時同步 HUD 顯示）
- 倉庫所有者選擇（left/right，顯示 SVG 標章）
- 儲存配置按鈕（localStorage + Server Action）
- 重設預設按鈕

### D. HUD 卡片（主視覺）
- cyber 角落括號（cyber-corner-*）
- scanlines overlay（hud-scanlines）
- 狀態標籤（pulsing badge）
- **State A（ready）**：
  - 左右玩家名稱 + PTS 分數
  - 倉庫所有者標章（SVG + animate-hud-pulse）
  - 佔領進度條（藍→青 / 橙→玫瑰，雙側漸層）
  - 旋轉 radar knob（SVG，顏色隨佔領方變化）
  - 中點 MID 標記
  - 三格 telemetry stats（Commits / Additions / Deletions），各有雙側比例條
- **State B（no_author）**：警告圖示 + git config 指令區塊（可全選複製）
- **State C（error）**：錯誤圖示 + FORCE_RETRY_STATION_SYNC 按鈕
- 底部 meta（timezone / updated time / BATTLEFEED_OK）

### E. Console Info Bar
- STATUS FEED 狀態訊息

### F. 右側 4 個 Tab 面板
1. **📖 部署與使用手冊（manual）**：
   - 遊戲化角色對照表（Hook / git log / 裁判 NPC）
   - 自動化運作流程圖
   - 伺服器 Hook 部署步驟（含代碼區塊 + 一鍵複製按鈕）
   - GIT_HOOK_SCRIPT 完整 bash+python 腳本
   - 常見問題與排除
2. **📦 資源下載（exporter）**：
   - 下載整合版 HTML 檔案（含當前設定）
   - 4 個 SVG 素材獨立下載
3. **⚖ UX 狀態規格（spec）**：Repo Owner 防錯機制說明
4. **⚯ 向量代碼（code）**：4 個 SVG 原始碼 + 複製按鈕

### G. 底部色板比較
- 深色 / 淺色兩個色板預覽

## 視覺規格

| 項目 | Dark | Light |
|---|---|---|
| 主背景 | `#0b0f19` | `slate-100` |
| 卡片背景 | `#111827` | `white` |
| 左方主色 | `#00f0ff`（cyan） | `blue-600` |
| 右方主色 | `#f97316`（orange） | `rose-600` |
| 邊框 | `slate-800` | `slate-200` |

## SVG 素材清單

1. **radarKnob** — 28x28 旋轉控制節點
2. **repoOwner** — 倉庫所有者標章
3. **warningShield** — 警告引導盾牌
4. **commitNode** — Git 提交節點

## localStorage Keys

| Key | 用途 |
|---|---|
| `outpost_leftName` | 左方營地名稱 |
| `outpost_rightName` | 右方營地名稱 |
| `outpost_repoOwner` | 倉庫所有者（left/right）|
| `outpost_percent` | 左方佔領百分比 |

## 引用場景

- `capture-hud-full-reimplementation` change 的主要規格來源
- CaptureHudAdjusterClient.tsx 的功能完整性驗收依據
