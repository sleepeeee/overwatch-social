---
id: REF-033
type: docs
title: shadcn/ui --primary 語意 token 與自有 --theme-* 變數並存橋接策略
url: https://ui.shadcn.com/docs/tailwind-v4
status: active
references_to: [REF-029, REF-030]
referenced_by: [REF-032, REF-034]
version: "shadcn/ui + Tailwind v4"
last_updated: 2025-03-01
official: true
---

## 摘要

### 問題本質

shadcn/ui 的語意 token（`--primary`、`--background`、`--card` 等）與 OW Social 的自有 `--theme-*` 變數（`--theme-bg-gradient`、`--theme-card-radius` 等）在同一個 `:root` / `globals.css` 中共存，存在兩個潛在衝突點：

1. **命名重疊**：shadcn 的 `--primary: #8b5cf6` 與 `--theme-*` 系列沒有直接衝突，但 `DeveloperConsoleClient.tsx` 自行定義了 `--theme-primary`、`--theme-primary-hover` 等（inline style 注入），形成第三套 primary 命名空間
2. **Tailwind utility 橋接缺口**：`@theme inline` 的 `--color-primary: var(--primary)` 確保了 `bg-primary` 等 utility class，但 `--theme-*` 系列未全數橋接到 `@theme`，只能透過 `bg-[var(--theme-card-radius)]` 等 arbitrary value 使用

### 官方橋接模式（shadcn/ui Tailwind v4 文件）

新增自訂 token 的標準三步驟：

```css
/* Step 1: 在 :root 定義語意值 */
:root {
  --theme-accent: #c084fc;
}
.dark {
  --theme-accent: #a855f7;
}

/* Step 2: 透過 @theme inline 橋接給 Tailwind */
@theme inline {
  --color-theme-accent: var(--theme-accent);
}
```

完成後，`bg-theme-accent`、`text-theme-accent` 等 utility class 自動可用。

### OW Social 現狀分析（L1 掃描 globals.css 結果）

```
shadcn 層（:root）：    --primary: #8b5cf6  ──→  @theme inline: --color-primary: var(--primary)  ──→  bg-primary ✅
OW 自有層（:root）：   --theme-bg-gradient  ──→  @theme inline: 未橋接                             ──→  只能 bg-[var(--theme-bg-gradient)] ⚠️
OW 自有層（.theme-original-baseline）：--theme-card-radius 等  ──→  @theme inline: 未橋接          ──→  只能 arbitrary value ⚠️
DeveloperConsole 層：  --theme-primary（inline style）  ──→  局部覆蓋                               ──→  可能蓋過全局 --primary ⚠️
```

**衝突點確認**：`DeveloperConsoleClient.tsx` 的 `style={{ "--theme-primary": scheme.primary, ... }}` 是在元件層注入，因為 CSS variable cascade，這個元件內的子元素若使用 `var(--theme-primary)` 就讀到這個局部值而非全局值——這是有意的（per-scheme 覆蓋），但需要注意這個命名不要與 `--theme-primary-foreground` 等擴展命名打架。

### 解決策略

**策略 A：One-way mapping（推薦，最小改動）**

保持現有 `--primary` 和 `--theme-*` 各自獨立，在主題 class（`.theme-original-baseline`、`.theme-ow-cyber` 等）中讓 `--primary` 也同步更新：

```css
.theme-ow-cyber {
  /* shadcn layer */
  --primary: #00f5ff;          /* 覆蓋 shadcn primary → bg-primary 跟著變 */
  --primary-foreground: #000;
  /* OW 自有 layer */
  --theme-bg-gradient: ...;
  --theme-card-radius: 20px;
}
```

優點：shadcn 元件（Button、Input 等）和自訂元件都跟主題走，單一地方控制。

**策略 B：`--theme-primary` 橋接到 `--primary`**

在 `:root` 加：`--primary: var(--theme-primary-color)` 然後主題 class 只改 `--theme-primary-color`。間接層讓 shadcn 和自訂系統共享同一個變數源。

**策略 C：重命名避免衝突（高成本，不推薦）**

把 `DeveloperConsoleClient.tsx` 的 `--theme-primary` 改名為 `--dc-primary`，徹底隔離 developer console 的局部 token。

### 建議

OW Social 採**策略 A**，因為：
1. 主題切換本就需要同步更新 shadcn layer（否則 Button 顏色不跟新主題走）
2. 改動最小：只需在每個新主題 class 同時更新 `--primary` 和相關 shadcn token
3. `DeveloperConsoleClient` 的局部 `--theme-primary` 繼續保留（範圍隔離在元件內），不與全局衝突

未橋接的 `--theme-*`（如 `--theme-bg-gradient`）繼續用 arbitrary value（`bg-[var(--theme-bg-gradient)]`）即可——這類複雜值（gradient、shadow）本就不適合 Tailwind utility class。

## 對專案的啟示

整站重設計時，每個新主題 class 需包含兩層 token：
1. shadcn 層（`--primary`、`--card`、`--border` 等 18 個 shadcn token）
2. OW 自有層（`--theme-bg-gradient`、`--theme-card-radius` 等 14 個 theme token）

這兩層加起來約 32 個變數需要在新主題 class 中定義（其中只改有差異的即可，相同值直接繼承 `:root`）。

## 引用場景

- propose 階段：新主題 class 的完整 token 清單規格
- apply 階段：globals.css 新主題 class 的結構模板
- apply 階段：DeveloperConsoleClient 的 inline token 衝突排查
