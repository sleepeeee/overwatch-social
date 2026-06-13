---
id: REF-038
type: technique
title: CJK 長文字溢出全站防護 pattern（Tailwind v4 + flex/grid 環境）
url: n/a
status: active
references_to: []
referenced_by: [ADR-28]
---

# CJK 長文字溢出全站防護 pattern

## 背景

OW Social 全站使用者輸入的長字串（battle_tag、nickname、message、tags、languages）在狹窄容器（flex child、grid cell、名片欄位）中可能溢出或不當換行。PR #21（bc51844）已修標籤四處；本 REF 記錄全站通用防護的完整技術選單，供後續 propose change 選用。

## Tailwind v4 核心 utility 對照

| 情境 | Utility 組合 | 說明 |
|---|---|---|
| 單行截斷（ellipsis） | `truncate` | = `overflow-hidden text-ellipsis whitespace-nowrap`；flex child 需加 `min-w-0` |
| flex child 防溢出（最常見坑） | `min-w-0` on child | flex child 預設 `min-width: auto`，會撐破父容器；加 `min-w-0` 才能讓 `overflow-hidden/truncate` 生效 |
| 多行限制 | `line-clamp-{n}` | 自動含 overflow hidden；message 欄位適用 |
| 長 URL / battle_tag 後綴 | `break-all` | 在任意字元處斷行；CJK 前後加 `#` 的 ID 後綴場景適用 |
| 自然換行不撐容器（flex v4 新法） | `wrap-anywhere` | 替代 `min-w-0 + break-words`；計算 min-content 時含斷行機會 |
| CJK 防止在詞中斷 | `break-keep` | 中文整詞保留；不適用於 battle_tag |
| 標籤（單行不換行 + max-w 限制） | `whitespace-nowrap max-w-full` | PR #21 已採用；超寬靠 flex-wrap 推到下一行 |

## 本站發現的三類典型風險

### 類型 A：flex child 缺 min-w-0（最嚴重）
父容器有 `flex`，子元素包含長文字但沒有 `min-w-0`。
長字串會撐開 flex track 而非截斷。

### 類型 B：有容器限制但缺 overflow 宣告
例如 `max-w-[170px]` + `truncate` 但外層 flex 沒有 `min-w-0`；或反過來有 `min-w-0` 但沒有 `overflow-hidden`。

### 類型 C：block 元素長文字缺 break-words
`<p>` 或 `<span>` 含使用者輸入的任意字串，沒有 `break-words` 或 `break-all`。
battle_tag 含 `#123456` 後綴（英數連寫），在英文 locale 不會自然斷行。

## 外部來源

- Tailwind CSS 官方 text-overflow docs: https://tailwindcss.com/docs/text-overflow
- Tailwind CSS 官方 overflow-wrap docs: https://tailwindcss.com/docs/overflow-wrap
- Tailwind CSS 官方 word-break docs: https://tailwindcss.com/docs/word-break
- Steve Kinney — Truncation and Wrapping: https://stevekinney.com/courses/tailwind/truncation-and-wrapping
- tailwindlabs discussion #12127 (`wrap-anywhere`): https://github.com/tailwindlabs/tailwindcss/discussions/12127

## Caveats（§1.3 council 補強）

### iOS Safari 支援邊界
- `overflow-wrap: anywhere`（即 Tailwind v4 `wrap-anywhere`）**只在 iOS Safari 15.4+ 完整支援**（2022-03 起）
- 舊 iOS Safari fallback：用 `break-words`（= `overflow-wrap: break-word`，所有 Safari 版本支援）
- 與 REF-036 經驗呼應（iOS Safari foreignObject 競態）— mobile 環境需獨立驗證

### 視窗特定風險（Gemini UX 角度）
- **iPhone SE 320px viewport**：flex 容器的破版臨界寬度；OWCard UID Box 於此寬度下 battle_tag + 複製按鈕同行擠壓最嚴重
- **iOS Safari overscroll 橫滾**：任一元素溢出會讓整頁可橫向滾（不觸發 horizontal scrollbar），破壞 gallery thinking — 建議 `overflow-x: clip` 上 `layout.tsx` / page root 做最後防線
- **Windows desktop scrollbar 17px**：當父容器固定高度觸發垂直 scrollbar，OverwatchSquare 最右欄卡片臨界溢出
- **CSS container query**：Tailwind v4 支援，但專案目前無 container-type 宣告，不納入此次盤點

### shadcn/ui Card 元件
- `src/components/ui/card.tsx` 只提供基礎排版（padding / border / shadow），**無內建長字串保護**
- 任何使用 `<Card>` 的位置都需自行加 `min-w-0` / `truncate` / `break-words`

## code_verified

physics_code_root 未設定 → code_verified: n/a
