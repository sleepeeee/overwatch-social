---
id: REF-034
type: docs
title: 硬碼 Tailwind 顏色 class 批次遷移到 CSS variable 策略（含 OW Social 量化）
url: https://tailwindcss.com/docs/theme
status: active
references_to: [REF-029, REF-033]
referenced_by: [REF-032]
version: "Tailwind v4"
last_updated: 2025-01-22
official: true
---

> ⚠️ 重建備註：原版因跨 session 檔案回捲遺失，此為濃縮重建版。來源另含 Tailwind v4.0 release notes 與 @tailwindcss/upgrade codemod 文件。

## 摘要

把寫死的 Tailwind 調色盤 class（`bg-purple-400`、`text-slate-300`）批次遷移到 CSS 變數的三條路：(A) `@theme inline` 自訂 color alias——定義 `--color-theme-surface: var(--theme-surface)` 後 `bg-theme-surface` utility 原生可用，語意清晰；(B) 官方 codemod `@tailwindcss/upgrade`——覆蓋 90% 機械改動但只服務 v3→v4 遷移，不做語意決策；(C) IDE regex 批次替換——快但需人工歸類先行。

**OW Social 量化（rsx-explorer 2026-06-12 grep 實測）**：145 處硬碼顏色 class、分布 11 個檔案。專案已是 v4 → codemod 不適用；採 **A+C 組合**：先做語意歸類表，再 `@theme inline` alias + regex 批次替換。工作量估算：2-3 小時人工逐處，或 30 分鐘 regex 批次 + 30 分鐘視覺驗證。

## 對專案的啟示

遷移必須按「語意角色」歸類而非逐色對映——同一個 `purple-400` 在不同元件可能是 accent 也可能是裝飾，併錯 token 會讓新主題改 A 連動壞 B。behavior-preserving 由 original-baseline 補等值變數保證。

## 引用場景

add-standalone-theme-style design.md D1/D2；tasks Phase 0.2/0.3、Phase 1。
