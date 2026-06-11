---
id: REF-035
type: blog
title: DERIV — frontend-design skill 在 Tailwind v4 @theme 語法下的相容性與 prompt 約束推導
url: n/a
status: active
references_to: [REF-028, REF-029]
referenced_by: []
author: derived (rsx-explorer, 2026-06-12)
published_date: 2026-06-12
platform: internal-derivation
---

## 文獻空白證據

外部搜尋（L2）四個臂均未命中 `frontend-design skill` + `Tailwind v4 @theme` 相容性的直接文獻：

- 搜尋臂 1（`frontend-design skill Tailwind v4 @theme prompt constraints compatibility`）：回傳的是第三方 Tailwind v4 skill（mcpmarket.com、lobehub.com），以及 LogRocket/DEV 的一般 Tailwind v4 指南，無 Anthropic 官方說明
- 搜尋臂 2（GitHub `anthropics/skills` PR #210）：PR 確認聚焦在「model theory of mind」改善，完全無 CSS 框架相容性討論
- 本機 SKILL.md（`~/.claude/plugins/cache/.../frontend-design/SKILL.md`）：無任何 Tailwind 版本特定說明，skill 是框架無關的（「implement working code (HTML/CSS/JS, React, Vue, etc.)」）
- Anthropic 官方文件（anthropic.com/news/claude-design）：只說明 Claude Design 產品，不涉及 frontend-design skill 的框架約束

**結論**：Anthropic 官方未針對 `frontend-design` skill 發布 Tailwind v4 相容性說明。Skill 的設計是「框架無關」的美學指引，不含 CSS 框架特定規則。

## 自製推導依據

基於以下已知事實推導出 prompt 約束策略：

**已知 1**：frontend-design skill 的 SKILL.md 說明「技術約束（framework、performance、accessibility）」是 Design Thinking 階段的輸入之一（「Constraints: Technical requirements (framework, performance, accessibility)」）。

**已知 2**：skill 要求在 coding 前確立美學方向，然後生成符合技術約束的 working code。技術約束來自 prompt，不是 skill 內建的。

**已知 3**：Tailwind v4 的 `@theme inline` 語法（`--color-*: var(--*)` 橋接）是普通 CSS，Claude 的訓練資料中應包含 Tailwind v4（released Jan 2025，知識截止 Aug 2025）。

**推導**：frontend-design skill 不會主動使用 Tailwind v4 `@theme` 語法，**除非 prompt 明確要求**。若不給約束，skill 傾向生成自包含的 HTML/CSS（`<style>` tag 或 inline CSS），因為這樣可以「展示最完整的美學效果」。

**潛在問題**（推導）：
1. skill 可能生成新的硬碼顏色 class（如 `bg-purple-600`）而非使用現有 `var(--theme-*)` token
2. skill 可能生成自包含的 CSS，而非更新 `globals.css` 的 token
3. skill 可能引入新字型（它被鼓勵「避免 Inter/Arial，選用有個性字型」），與現有 Cinzel/Noto 體系衝突

### 建議的 Prompt 約束模板

每次呼叫 frontend-design skill 時，在 prompt 開頭加入技術約束段：

```
技術約束（不可違反）：
- 框架：Next.js 16 App Router + TypeScript
- 樣式系統：Tailwind CSS v4，所有顏色使用現有 CSS variable（var(--primary)、var(--theme-*)），
  禁止新增硬碼顏色 class（bg-purple-500 等）
- 字型：保留現有字型系統（--font-cinzel / --font-playfair / --font-sans / --font-geist-mono），
  不引入新字型
- CSS variable 橋接：新增 token 必須遵循格式：
  ① 在 .theme-<name> class 定義 --theme-xxx: value;
  ② 在 @theme inline 補 --color-xxx: var(--theme-xxx);（若需 utility class）
- 元件 API：不改變現有 props 介面，只改樣式輸出

美學方向（可以發揮）：
<此處寫明目標美學，如「retro-futuristic gaming，dark neon，glassmorphism」>
```

**是否有已知限制**：無已知技術限制（skill 本身框架無關，Claude 模型知識含 Tailwind v4），潛在問題純粹來自 skill 的「自由度鼓勵」與「專案約束」之間的張力——透過 prompt 約束可以完全解決。

## 後續補搜計畫

1. 在實際使用 frontend-design skill 生成 1-2 個元件後，記錄它是否在無約束情況下自然使用 `var(--primary)` 或硬碼顏色——這是驗證本推導的最直接方式
2. 若 Anthropic 發布新版 frontend-design skill（PR #210 之後可能有更新），重新讀取 SKILL.md 確認是否加入框架特定說明
3. 查 `awesome-claude-design`（github.com/rohitg00/awesome-claude-design）是否有 Tailwind v4 約束 prompt 的社群範例

## 引用場景

- propose 階段：frontend-design skill 使用規範的制定
- apply 階段：每次呼叫 skill 時的 prompt 模板（直接複製使用）
- archive 階段：若實際使用後發現 skill 的自然行為，補充驗證結果
