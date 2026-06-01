## Why

在下方導覽列（FloatingDock）的個人檔案（Profile）按鈕上，溫順氣泡提示（Tooltip）會因為文字長度（四個字「個人檔案」）且無禁止折行設定，在寬度受限時自動換行成兩行，導致排版不精美。本變更旨在修正此問題，使其保持單行並水平置中。

## What Changes

- 修改 `src/components/morning-sketch/FloatingDock.tsx`：
  - 氣泡提示 `span` 加上 `whitespace-nowrap` 樣式以防止文字自動換行。
  - 氣泡提示 `span` 加上 `left-1/2 -translate-x-1/2` 確保水平精確置中。
  - 調整 transition 中的 `translate-y`，確保與 `-translate-x-1/2` 同時並存。

## Capabilities

### New Capabilities
<!-- Capabilities being introduced. Replace <name> with kebab-case identifier (e.g., user-auth, data-export, api-rate-limiting). Each creates specs/<name>/spec.md -->
- `tooltip-aesthetics`: 氣泡提示防折行與水平置中

### Modified Capabilities
<!-- 無修改系統功能規約 -->

## Impact

- 影響範圍僅限於下方導覽列 `FloatingDock` 的 UI 表現，不影響任何後端、DB 或 API。
