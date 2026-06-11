---
id: REF-029
type: docs
title: Tailwind CSS v4 @theme 多主題架構與 CSS variable 最佳實踐
url: https://tailwindcss.com/docs/theme
status: active
references_to: [REF-030]
referenced_by: [REF-028, REF-032, REF-033, REF-034, REF-035]
version: "4.0"
last_updated: 2025-01-01
official: true
---

## 摘要

Tailwind CSS v4 以 CSS-first 方式取代 JS 設定檔。核心機制是 `@theme` 指令——在此區塊定義的 CSS 變數，Tailwind 會自動生成對應的 utility class。

**`@theme` 與 `:root` 的分工**：
- `@theme`：設計 token，生成 utility class（如 `bg-primary`、`text-mint-500`）
- `:root`：普通 CSS 變數，不生成 utility class，用於 runtime 取值

**多主題切換機制**：
1. 在 `@theme` 中定義語意化 token（`--color-primary`、`--glass-bg` 等）
2. 在各主題 selector（`.theme-foo`、`.dark`）中覆蓋這些 CSS 變數值
3. 切換主題只需改 root element 的 class，不需重新生成 CSS

**`@theme inline` 用法**：當 token 需要引用其他 CSS 變數時（如 `--font-sans: var(--font-noto-sans-tc)`），使用 `inline` 關鍵字讓 Tailwind 在生成 utility 時解析引用，而非靜態化為字串。

**三層 token 架構**（最佳實踐）：
1. Base：原始值（`--color-purple-600: oklch(0.558 0.288 284)`）
2. Semantic：語意命名（`--color-primary: var(--color-purple-600)`）
3. Component：元件層（`--button-bg: var(--color-primary)`）

**關鍵限制**：`@theme` 的變數定義必須在頂層，不可嵌套在 selector 或 media query 內。因此主題覆蓋要用 `:root` 或 class selector，不用 `@theme`。

**色彩空間**：v4 預設使用 OKLCH，提供更均勻的感知色階，適合 dark mode 的飽和度補償。

OW Social 現狀分析：`globals.css` 的 `@theme inline` 區塊（62 行）已正確使用 Tailwind v4 語法；`:root` 中的 `--theme-*` 系列和 `.theme-original-baseline` class 是標準的多主題覆蓋架構。硬鎖問題的根因不在 CSS，在於 `ThemeContext.tsx` 只返回 `original-baseline`——解除硬鎖就能立刻啟用既有的 5 套主題。

## 對專案的啟示

整站重設計的 CSS 層策略：
1. 在現有 `.theme-original-baseline` 結構下，新增新主題 class（如 `.theme-ow-cyber`）
2. 只需覆蓋有差異的 `--theme-*` 變數，繼承基礎層的相同變數
3. 對於直接寫死 Tailwind class 的元件（FloatingDock、廣場元件），需要一次性把 hardcode 顏色改成 `var(--theme-*)` 引用，或加 theme class 條件渲染

不需要：重寫元件 API、改 Supabase schema、改路由結構。CSS variable 系統已就位，主要工作是（a）確認覆蓋範圍、（b）設計新主題的 token 值、（c）解除 ThemeContext 硬鎖。

## 引用場景

- propose 階段：re-theme 的技術策略選型（CSS variable 覆蓋 vs 全元件重寫）
- apply 階段：新主題 class 的 globals.css 修改規範
- 驗證：多主題切換功能的實作準確性確認
