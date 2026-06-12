---
id: REF-035
type: blog
title: DERIV — frontend-design skill 在 Tailwind v4 @theme 下的相容性推導與 prompt 約束模板
url: n/a
status: active
references_to: [REF-028, REF-029]
referenced_by: []
author: rsx-explorer (DERIV 自製知識點)
published_date: 2026-06-12
platform: 自製推導
---

> ⚠️ 重建備註：原版因跨 session 檔案回捲遺失，此為濃縮重建版。§X1 三段結構保留。

## 文獻空白（§X1 第一段）

四個搜尋臂（"frontend-design skill Tailwind v4"、"Anthropic skill @theme compatibility" 等組合，WebSearch + GitHub anthropics/skills + anthropics/claude-plugins-official）全空命中：Anthropic 對 frontend-design skill 無任何 Tailwind v4 特定說明。

## 自製推導依據（§X1 第二段）

已知事實三條：(1) SKILL.md 明確接受 Technical constraints 作為輸入；(2) skill 設計為框架無關的美學指引（不綁特定 CSS 方案）；(3) Tailwind v4（2025-01 發布）在模型訓練資料截止前已存在。推導結論：skill **不會主動**使用 `@theme` 語法或專案自有 token，技術約束必須由 prompt 顯式提供，否則生成碼會延續硬碼顏色模式。

**Prompt 約束模板**（設計 pass 必附）：
```
Technical constraints:
- 只輸出 CSS 變數值（--theme-* 與 shadcn 語意 token），不改元件結構與 markup
- 禁止任何硬碼 Tailwind 調色盤 class（bg-purple-400 等）；一律引用 var(--theme-*)
- 沿用既有字級系統；display 字體可換、body 字體維持可讀性
- 主文字對比 ≥ WCAG AA 4.5:1
- 變數命名遵循專案既有 --theme-<role> 規則
```

## 後續補搜計畫（§X1 第三段）

apply Phase 4 第一套主題（neon-esports）設計 pass 即為實測驗證點：若 skill 在約束下仍輸出硬碼 class → 記 Finding 並強化模板；若官方後續發布 Tailwind v4 指引 → 本 REF 轉 superseded。

## 引用場景

add-standalone-theme-style design.md D6；tasks Phase 4.1-4.3。
