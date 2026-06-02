---
id: ADR-08
title: "以 HTML 原始設計稿作為完整移植規格的唯一準則（vs 上一版實作稿）"
status: Accepted
change: capture-hud-full-reimplementation
date: 2026-06-03
references_to: [REF-015, F-008, F-009]
referenced_by: [F-008]
---

## 決策

`capture-hud-full-reimplementation` change 採用 `developer_outpost_hud_plugin (4).html`（HTML 原始設計稿，對應 REF-015）作為 `CaptureHudAdjusterClient.tsx` 的**唯一功能規格來源**，而非從既有的 Gemini 移植版（上一代不完整實作）補丁修改。

實作方式：從乾淨基準點（clean slate）重新建立 860 行元件，HTML 設計稿的每個功能節點直接對應元件的 state / 渲染邏輯，逐一核對。

## 背景

上一版（Gemini 移植版）缺失以下功能：
- 右側 4 個 Tab 面板中的手冊 Tab（含 GIT_HOOK_SCRIPT 完整腳本、一鍵複製）
- 動態 StatCard（Commits / Additions / Deletions 雙側比例條）
- no_author 狀態的 git config 指令說明區塊（含全選複製）
- error 狀態的 FORCE_RETRY_STATION_SYNC 按鈕
- CSS HUD 視覺元素（`cyber-corner`、`hud-scanlines`、`animate-hud-pulse` 等）

以「補丁修改不完整移植版」的做法，因缺少整體一致的功能邊界，風險高且難以驗收。

## 被拒絕的方案

| 方案 | 拒絕理由 |
|---|---|
| 在 Gemini 移植版基礎上補丁修改 | 缺失功能散落各處，無法確認邊界完整；補丁式修改缺乏整體一致性驗收基準 |
| 以前一版實作稿為規格，選擇性補齊缺失項 | 前一版本身不完整，以不完整版作為規格等同於正當化其缺失；仍有隱性差距 |
| 自行重新定義規格，不參照 HTML 原稿 | 設計意圖（視覺風格、交互語意、狀態機轉換）存在於 HTML 原稿，棄用將導致語意漂移 |

## 影響

- **驗收基準**：REF-015 功能清單（A 至 G 節）作為 41 個 Task 的逐項驗收依據，每個 Task 可對應到 HTML 原稿的特定功能節。
- **設計語意保存**：HUD 視覺語言（`cyber-corner-*`、`hud-scanlines`、pulsing badge、radar knob SVG）完整移植，未依主觀判斷省略任何視覺元素。
- **跨 change 原則**：未來任何對 HUD 的修改，應以 REF-015 為設計決策的依據起點，判斷修改是否與原始設計意圖一致或刻意偏離。
- **spec 鎖定效應**：HTML 原稿一旦成為規格 canonical，後續若原稿有新版本（v5），需明確決策是否升版規格並建新 REF，不得靜默漂移。
