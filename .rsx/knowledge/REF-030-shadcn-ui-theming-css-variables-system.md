---
id: REF-030
type: docs
title: shadcn/ui Theming — CSS Variables 語意 token 架構
url: https://ui.shadcn.com/docs/theming
status: active
references_to: []
referenced_by: [REF-028, REF-029]
version: "latest"
last_updated: 2026-03-26
official: true
---

## 摘要

shadcn/ui 使用 CSS variables 作為唯一主題機制。每個元件從相同的語意 token 讀值（`--primary`、`--background`、`--foreground`、`--card`、`--border` 等），確保任何元件自動繼承主題修改。

**語意配對規則**：每個 surface token 搭配 `-foreground` token：
- `--card` / `--card-foreground`
- `--primary` / `--primary-foreground`
- `--popover` / `--popover-foreground`

**Dark mode 實作**：在 `.dark` selector 內覆蓋相同 token 值。以 OKLCH 色彩空間定義顏色，感知亮度一致。

**`@theme inline` 整合**：shadcn/ui 的 CSS variables 定義在 `:root`（和 `.dark`）下，再透過 `@theme inline` 把它們橋接給 Tailwind 的 utility class 系統（如 `bg-primary` → `var(--primary)`）。

**半徑系統**：所有圓角從單一 `--radius` 基礎變數派生（`--radius-sm: calc(var(--radius) * 0.6)` 等），修改一個值就同步全站。

**重要警告**：`--primary` 是給 primary button 用的，不是品牌色。如需品牌色，應另加 `--brand` 變數，避免語意混淆。

**`--no-css-variables` 選項**：若不想用 CSS variable 系統（改用 hardcode Tailwind class），CLI 支援此旗標。但一旦切換後難以再改回，因此應在專案初期決定。OW Social 已採 CSS variable 模式，不建議切換。

**Shadcn UI Customizer**（社群工具）：視覺化調整所有 token 的開源工具，可在不手動編輯 CSS 的情況下預覽主題配色，適合在設計阶段快速試色。

## 對專案的啟示

OW Social 的 `globals.css` 完整實作了 shadcn/ui 的 token 系統（`:root` 定義 + `.dark` 覆蓋 + `@theme inline` 橋接）。重設計的邊界很清楚：

- shadcn/ui 元件層（Button、Card、Input 等）：只改 CSS variable 值即可
- 自訂元件（OWCard、FloatingDock、OverwatchSquare 等）：部分使用 `var(--theme-*)` 自訂變數（正確），部分直接寫死 Tailwind color class（需一次性改為 `var(--theme-*)`）

shadcn/ui Customizer 可作為新主題配色的視覺驗證工具，在正式寫入 globals.css 前先快速確認視覺效果。

## 引用場景

- explore 階段：確認現有 CSS 架構與 shadcn/ui 標準的符合度
- propose 階段：重設計範圍切割（shadcn 層 vs 自訂元件層）
- apply 階段：新主題 token 值的設計規範
