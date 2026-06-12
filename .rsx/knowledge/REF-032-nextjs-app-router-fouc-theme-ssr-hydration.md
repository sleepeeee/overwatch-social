---
id: REF-032
type: docs
title: Next.js App Router 多主題 SSR FOUC 防護方案比較
url: https://dev.to/amritapadhy/understanding-fixing-fouc-in-nextjs-app-router-2025-guide-ojk
status: active
references_to: [REF-029, REF-033, REF-034]
referenced_by: []
version: "Next.js 15/16"
last_updated: 2025-06-01
official: false
---

> ⚠️ 重建備註：原版（rsx-explorer 2026-06-12 建立）因跨 session 檔案回捲遺失，此為主代理自 explorer 回報濃縮重建版。來源另含 next-themes GitHub（pacocoursey/next-themes）與 BetterLink dark mode guide。

## 摘要

Next.js App Router 下 client-side 主題切換（useEffect 加 class）必然產生 FOUC（先渲染預設主題、hydration 後才補 class）。四個解法：(1) `suppressHydrationWarning` + `<html>` 靜態預設 class——零成本但只保預設主題無閃爍；(2) next-themes 的 inline script（hydration 前同步讀 localStorage 套 class）；(3) `data-theme` attribute + Tailwind v4 `@custom-variant`（v4 原生支援，成本最低的動態方案）；(4) cookie-based SSR（server 端就知道主題，零 FOUC 但需 cookie 基建）。已知坑：Next.js 15.0.1 + ThemeProvider 有 React 19 hydration bug（next-themes issue #5552），需確認版本。

## 對專案的啟示

OW Social 的 ThemeContext 正是 useEffect 加 class 模式——解除硬鎖後 developer 切非預設主題會在重新整理時閃基準主題。本 change（developer-only 預覽）採方案 (1) 接受已知限制；未來開放全用戶切換時升級方案 (4)。**工作流順序評估（採 Gemini 建議）**：應先把硬碼顏色抽象化為變數（Phase 1）再做視覺設計（Phase 4），否則 frontend-design skill 生成的程式碼會延續硬碼模式造成二次遷移——先建 token 地基，再蓋設計大廈。

## 引用場景

add-standalone-theme-style change 的 design.md D4/D5 決策；未來「開放全用戶主題切換」change 的 FOUC 方案選型。
