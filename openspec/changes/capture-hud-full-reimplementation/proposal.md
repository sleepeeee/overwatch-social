---
id: capture-hud-full-reimplementation
type: change
status: proposing
created: 2026-06-03
affects_consumers: []
related_claims: []
---

# Proposal: capture-hud-full-reimplementation

## Why（動機）

朋友 Shadowmaster6g 利用 Gemini 模型移植了 `developer_outpost_hud_plugin (4).html` 的部分功能到開發者後台，但以下關鍵功能遺漏或不正確：

1. **「部署與使用手冊」tab 完全缺失**：原始 HTML 的核心功能——git hook 腳本展示、一鍵複製、伺服器部署步驟——在 Gemini 實作中完全沒有（只剩 3 個 tab，少了 manual tab）
2. **StatCard 比例條硬編碼 50/50**：應依照左右玩家真實數據動態計算，但 Gemini 版本固定輸出 50/50
3. **No Author 狀態不完整**：應顯示可複製的 git config 指令區塊，Gemini 版本缺失
4. **Error 狀態缺少 FORCE_RETRY 按鈕**
5. **倉庫所有者切換功能遺漏**

已進行精準回滾（commit `f03263e`），移除 Gemini 生成版本，基於乾淨基準點重新實作。

**Why now（外部觸發）**：HTML 設計稿已完成，作為規格完整；lib/developer-capture 後端基礎設施已建立；是最低成本的重新實作時機。

**先例缺口**：現有 REF-002（Supabase SSR）、REF-005（developer role）涵蓋認證模式。REF-015（本 change 新建）記錄 HTML 設計規格。無現有 REF 涵蓋「完整 HUD 調整器 UI + 4 tab 面板 + git hook 說明」的移植模式。

## What Changes

1. **新建 `src/app/developer/capture-hud/CaptureHudAdjusterClient.tsx`**：完整 Client Component，依照 HTML 原稿實作所有功能（6 preset、動態滑桿、陣營設定、HUD 卡片 3 狀態、4 tab 面板）
2. **更新 `src/app/developer/capture-hud/page.tsx`**：引入 CaptureHudAdjusterClient，傳入 initialState

**不改動**：
- `lib/developer-capture/`（保留，作為 CaptureState 型別來源）
- `app/actions/developerCapture.ts`（保留，saveCaptureDisplayNames 供儲存配置使用）

## Capabilities（實作後）

- 6 preset 狀態切換（真實資料 / 壓制 / 中立 / 失守 / 未設作者 / 資料缺失）
- 動態滑桿即時模擬佔領比率
- 陣營設定（名稱 + 倉庫所有者 + 儲存/重設）
- 完整 HUD 卡片（3 個狀態，含 FORCE_RETRY 按鈕、git config 指令說明）
- 4 個 Tab（手冊/資源下載/規格/向量代碼），含 git hook 腳本複製、SVG 下載

## Impact

- 修改範圍：2 個檔案（1 新建 + 1 更新）
- 無 DB schema 變更
- 無 API 變更

## novelty claim（可偽證）

本 change 新意 = 以 HTML 原稿為規格，完整移植 4 tab 面板（含 git hook 部署手冊）至 Next.js Client Component，實現朋友 Gemini 實作版本遺漏的所有功能；若 Gemini 版本的 4 tab（含手冊）已存在且功能完整，則為假。

## 最近鄰 prior work

- REF-015（HTML 設計稿分析）：完整功能規格來源
- REF-005（app_metadata developer role）：頁面的 developer auth guard 模式
- REF-002（Supabase SSR createClient）：page.tsx 讀取 captureState 的資料取得模式
