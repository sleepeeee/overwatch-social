# Token 歸類表（Task 0.3 產出，F-028 校準範圍）

> 原則：按**語意角色**歸類，不做逐色硬對映。透明度修飾（`/10`、`/30`）保留在呼叫端（Tailwind v4 對 `@theme` 定義的 color 原生支援 opacity modifier），token 只定義基色——避免 token 爆量。
> 命名沿用既有 `--theme-<role>` 慣例；original-baseline 填遷移前等值色，保證外觀不變。

## A. 文字層級（最大宗，~200 處）

| 新 token | original-baseline 等值 | 吸收的硬碼 class |
|---|---|---|
| `--theme-text-strong` | zinc-100 | text-zinc-100, text-zinc-50/95, text-slate-100 |
| `--theme-text-body` | zinc-200 | text-zinc-200, text-zinc-300 |
| `--theme-text-muted` | zinc-400 | text-zinc-400, text-zinc-400/80, text-slate-400, text-gray-400 |
| `--theme-text-faint` | zinc-500 | text-zinc-500, text-zinc-550, text-zinc-600, text-zinc-650, text-slate-500 |
| `--theme-text-inverse` | slate-900 | text-slate-800, text-slate-900（亮底頁主文字）|

## B. 表面 / 背景

| 新 token | original-baseline 等值 | 吸收的硬碼 class |
|---|---|---|
| `--theme-surface-deep` | slate-950 | bg-slate-950(/30,/35), bg-slate-900(/40), bg-zinc-900, bg-gray-900 |
| `--theme-surface-raised` | slate-800 | bg-slate-800(/50,/70), bg-zinc-800(/40), bg-zinc-700, bg-zinc-600 |
| `--theme-surface-light` | slate-50 | bg-slate-50(/70), bg-slate-100, bg-slate-200, bg-slate-300, bg-slate-400, bg-gray-100/50（terms/privacy 亮色頁）|

## C. 邊框

| 新 token | original-baseline 等值 | 吸收的硬碼 class |
|---|---|---|
| `--theme-border-subtle` | slate-800 | border-slate-800(/70,/80), border-slate-700, border-slate-600/70, border-zinc-500 |
| `--theme-border-light` | slate-200 | border-slate-100, border-slate-200(/80), border-slate-300(/70), border-gray-200（亮色頁）|

## D. 語意狀態色（基色 + 呼叫端 opacity）

| 新 token | original-baseline 等值 | 吸收的硬碼 class 系 |
|---|---|---|
| `--theme-danger` | rose-500 | rose-300~600/950 全系（text/bg/border/ring/from/to）、red-50~600、border-rose-550, text-rose-450 |
| `--theme-warning` | amber-500 | amber-300~900/950 全系、orange-300~600 |
| `--theme-info` | blue-500 | blue-300~600/950 全系 |
| `--theme-success` | emerald-500 | emerald-400~600, green-400~500, stroke-emerald-400 |

## E. Accent

| 新 token | original-baseline 等值 | 吸收的硬碼 class |
|---|---|---|
| `--theme-accent-cyan` | cyan-400 | cyan-300~500 全系（text/bg/border/ring）|
| `--theme-accent-brand` | purple-400 | text-purple-400, border-purple-400/20, border-purple-500/50, bg-purple-950/20 |

## 合計：17 個新 token（估算 15~25 區間內 ✓）

## ⚠️ 人工確認點（動手前掃一眼）

1. **rose 系 = danger？** profile/report 中 rose 多為錯誤/警示語境，但若有「品牌粉色」用法混入（如愛心/收藏），需拆出 `--theme-accent-rose`。遷移時逐處看語境。
2. **orange 併入 warning？** orange-400 與 amber-400 在 HUD 元件可能是兩種視覺層次，遷移時若同畫面並用則拆 token。
3. **slate vs zinc 灰階雙系**：A/B/C 表把兩系按明度併入同 token——original-baseline 等值取「出現次數較多」的那個（zinc 系文字、slate 系表面），會有極輕微（肉眼難辨）的灰階偏移；若截圖回歸過不了，改為保留雙系 token。

## 豁免清單（不遷移）

| 範圍 | 理由 |
|---|---|
| `src/app/developer/**`（~1,100 處）| developer-only 內部工具，主題預覽對象是使用者頁面（F-028）|
| `src/components/developer-capture/**`、`HomeCaptureHud.tsx` 內 HUD 專屬色 | Git Outpost HUD 是獨立視覺系統（ADR-13 以 HTML 設計稿為唯一準則），不隨主題變 |
| 英雄/職業徽章等資料驅動顏色（heroBackgrounds.ts、mockPlayers.ts 內定義）| 資料層顏色，非主題視覺 |
