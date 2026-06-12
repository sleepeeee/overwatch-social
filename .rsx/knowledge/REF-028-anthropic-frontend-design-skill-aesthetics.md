---
id: REF-028
type: github
title: Anthropic frontend-design skill — 生產級 UI 美學指引
url: https://github.com/anthropics/claude-plugins-official/blob/main/plugins/frontend-design/skills/frontend-design/SKILL.md
status: active
references_to: [REF-029, REF-030]
referenced_by: [REF-035]
stars: n/a
language: Markdown
license: n/a
---

## 摘要

Anthropic 官方 `frontend-design` skill（已安裝於本機，路徑 `~/.claude/plugins/cache/claude-plugins-official/frontend-design/`），設計目標是引導 Claude 產出「有獨特美學的生產級前端介面」，明確避免泛用 AI 風格（"AI slop"）。

核心設計哲學：在撰寫程式碼前，先確立「大膽的美學方向」。提供的風格維度包括：极簡主義（brutally minimal）、極大主義（maximalist chaos）、復古未來感（retro-futuristic）、有機自然（organic/natural）、奢華精緻（luxury/refined）、粗野主義（brutalist/raw）、幾何藝術裝飾（art deco/geometric）等。

技術面強調：
- **色彩**：commit to a cohesive aesthetic，使用 CSS variables 保一致性；主色 + 銳利 accent 勝於平均分布調色盤
- **字型**：避免 Arial、Inter、Roboto 等泛用字型；選用有個性的顯示字型配合精緻 body 字型
- **動畫**：頁面 load 時一次精心設計的 staggered reveal 勝過散落的 micro-interaction
- **版面**：非對稱、重疊、斜向流動、跳脫 grid 的元素、充足留白或受控密度
- **背景與視覺細節**：gradient mesh、noise texture、幾何圖案、layered transparency、dramatic shadow、grain overlay

社群 PR #210 對此 skill 做了重大改善（75% win rate across model tiers），加入了：glassmorphism、parallax、print texture 等視覺技巧，以及響應式設計為 production-grade 必要條件。

2025 年 Anthropic Labs 另推出 **Claude Design** 產品（Opus 4.7 驅動），讓使用者協作生成設計並匯出成 handoff bundle 給 Claude Code——與本 skill 的定位互補（Design = 視覺探索 + handoff；frontend-design skill = 直接生成可執行程式碼）。

## 對專案的啟示

OW Social 已有清晰的視覺語言基礎（星空暗夜、紫色漸層、磨砂玻璃）。`frontend-design` skill 的工作流最直接適用：只需向 Claude 描述「gaming social platform，OW 主題，retro-futuristic / dark neon」的明確美學方向，搭配「保持 Tailwind v4 CSS variable 架構，不改現有元件 API」的技術約束，skill 會自動在生成時 commit to 一個具體的美學點。

關鍵優勢：skill 已在本機安裝（`/frontend-design` 即可呼叫），不需外部服務，直接在 Claude Code session 內輸出可部署的 Next.js + Tailwind 程式碼。

不適用範圍：此 skill 是「生成新介面」導向，不是「系統化替換既有主題 token」的工具。整站 re-theme 需搭配 REF-029 的 CSS variable 策略一起規劃。

## 引用場景

- 選型結論的主力推薦：整站重設計時作為 design agent 的工作模式
- propose 階段：設計 re-theme 方案的美學規格說明
- apply 階段：個別頁面/元件交由 frontend-design skill 輸出新版 code
