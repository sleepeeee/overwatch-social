---
id: REF-033
type: docs
title: shadcn/ui --primary 語意 token 與自有 --theme-* 並存橋接策略
url: https://ui.shadcn.com/docs/tailwind-v4
status: active
references_to: [REF-029, REF-030]
referenced_by: [REF-032, REF-034]
version: "Tailwind v4"
last_updated: 2026-03-26
official: true
---

> ⚠️ 重建備註：原版因跨 session 檔案回捲遺失，此為濃縮重建版。來源另含 ui.shadcn.com/docs/theming 與 Medium「Theming shadcn with Tailwind v4 and CSS Variables」。

## 摘要

shadcn/ui 在 Tailwind v4 的標準橋接模式：`:root`（或主題 class）定義語意 token 實值 → `@theme inline` 把它暴露成 Tailwind utility 可用的 color。兩套 token 體系（shadcn `--primary`/`--border` vs 專案自有 `--theme-*`）並存時的三個衝突點：命名重疊、Tailwind utility 橋接缺口、局部 inline token 作用域。OW Social 已定位的衝突點：DeveloperConsoleClient.tsx 的 inline `--theme-primary` 是局部作用域、不與全局 `--primary` 打架，但需命名規範。

**策略 A（One-way mapping，採用）**：每個主題 class 同時更新 shadcn 層 + OW 自有層（合計 ≈ 32 tokens），shadcn token 值由主題定義直接給定。優點：單一事實來源在主題 class、無 runtime 換算；缺點：每加一套主題要填兩層（可由模板緩解）。

## 對專案的啟示

新主題 class 的結構規格 = shadcn 語意層（--background/--foreground/--primary/--border/--ring 等）+ OW 自有層（--theme-bg/--theme-card-*/--theme-input-* 等）同步定義；以 original-baseline 現值為對映基準表寫入 globals.css 註解錨點。

## 引用場景

add-standalone-theme-style design.md D3；tasks Phase 2。
