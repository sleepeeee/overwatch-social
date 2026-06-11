---
id: REF-032
type: docs
title: Next.js App Router 多主題 SSR FOUC 防護 — inline script、cookie、data-theme 方案
url: https://dev.to/amritapadhy/understanding-fixing-fouc-in-nextjs-app-router-2025-guide-ojk
status: active
references_to: [REF-029, REF-033, REF-034]
referenced_by: []
version: "Next.js 15 / React 19"
last_updated: 2025-01-01
official: false
---

## 摘要

**FOUC（Flash of Unstyled/Wrong-Theme Content）根因**：Next.js SSR 在 Node.js 環境執行，無 `window`/`localStorage`，server 只能輸出預設 class（如無 `theme-original-baseline`）；client hydration 後 React 才跑 `useEffect` 加 class，造成短暫視覺閃爍。

### 四種防護方案比較

| 方案 | 機制 | FOUC 消除程度 | 適合 OW Social |
|---|---|---|---|
| **`suppressHydrationWarning`** | 在 `<html>` 加此屬性，壓制 React 不一致警告 | 壓制警告，不消除閃爍 | 必加（不可省略）|
| **`next-themes` 阻塞 inline script** | library 在 `<head>` 注入阻塞 script，hydration 前讀取 localStorage 並套用 class | 基本消除閃爍 | 推薦，安裝成本低 |
| **`data-theme` attribute（Tailwind v4 方式）** | `@custom-variant dark (&:where([data-theme=dark], ...))` + ThemeProvider `attribute="data-theme"` | 消除 hydration mismatch（class 不變，只改 attribute） | 理想方案，Tailwind v4 原生支援 |
| **Cookie-based SSR（最佳）** | theme 存 HTTP cookie，Server Component 透過 `cookies()` 讀取並直接注入正確 class | 零 FOUC、零 hydration mismatch | 實作成本最高，但體驗最佳 |

### OW Social 現狀分析（L1 掃描）

`ThemeContext.tsx` 的硬鎖實作：
- `useState` 初始值 `"original-baseline"`（SSR 輸出中不含 theme class）
- `useEffect` 才呼叫 `html.classList.add("theme-original-baseline")`
- 結果：SSR HTML 無 theme class → hydration 後加上 → 產生 FOUC
- ADR-09（`ssr-safe-init-deterministic-default-useeffect`）已記錄此問題，視為「可接受、cookie 為升級路徑」

**解除硬鎖後的 FOUC 策略**（按成本遞增排列）：

1. **最低成本**：`layout.tsx` 的 `<html>` 加 `suppressHydrationWarning`，SSR 輸出 `theme-original-baseline` 作為預設 class（在 layout server component 直接寫死 class，不依賴 useEffect）
2. **推薦**：安裝 `next-themes`，替換現有 ThemeContext，用 `attribute="class"` + `ThemeProvider`。next-themes 內建阻塞 script，開箱即消除閃爍
3. **最佳（升級路徑）**：改用 `data-theme` attribute + Tailwind v4 `@custom-variant`，cookie 存主題，Server Component 透過 `cookies()` 注入。OW Social 已有 `@custom-variant dark (&:is(.dark *))` 的語法，可直接擴展至 `data-theme` 模式

### React 19 / Next.js 15 注意事項

- `suppressHydrationWarning` 只作用一層深（`<html>` tag），不向下傳遞
- Next.js 15.0.1 + shadcn/ui `ThemeProvider` 有已知 hydration bug（issue #5552），若出現需升級至 15.1+
- React 19 移除了 `forwardRef`，shadcn/ui Tailwind v4 版本已對應更新（`data-slot` pattern）
- 不可在 Server Component 或 SSR 路徑使用 `typeof window`、`localStorage`、`Math.random()` 觸發 theme 邏輯

## 對專案的啟示

**Gemini 工作流順序評估的回應**：Gemini 提出「是否應先抽象化硬碼顏色再做視覺設計」。從 SSR/FOUC 角度看，這個順序確實重要：

- 若先做視覺設計（用 frontend-design skill 輸出新元件程式碼），生成的程式碼可能延續現有硬碼 class 模式
- 若先完成 Phase 1（解除硬鎖 + CSS variable 橋接）和 Phase 3（批次遷移硬碼 class），再做視覺設計，生成的程式碼自然 inherit 新的 token 系統

**建議修訂工作流順序**（更新自 REF-028 的 Phase 1-4 建議）：
1. Phase 1：解除 ThemeContext 硬鎖 + 在 `layout.tsx` `<html>` 加 `suppressHydrationWarning` + SSR 預設 theme class
2. Phase 2：shadcn/ui `--primary` 與 `--theme-*` 橋接（見 REF-033）
3. Phase 3：批次遷移硬碼 Tailwind class → CSS variable（見 REF-034）
4. Phase 4：**此時再執行視覺設計**（frontend-design skill）——在乾淨的 token 系統上設計，新主題 globals.css 一次完成
5. Phase 5：安裝 next-themes 替換 ThemeContext（可選，若需多主題切換 UX）

這個順序確保「先建好地基再蓋房子」，避免視覺設計產物需要事後手動遷移 token。

## 引用場景

- propose 階段：工作流順序決策依據（Phase 3 先於 Phase 4 的理由）
- apply 階段：解除硬鎖時的 `layout.tsx` 修改規範
- apply 階段：可選 next-themes 安裝的實作指引
