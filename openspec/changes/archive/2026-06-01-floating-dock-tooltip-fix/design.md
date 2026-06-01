## Context

在 `src/components/morning-sketch/FloatingDock.tsx` 中，溫順氣泡提示的 `span` 容器沒有使用 `whitespace-nowrap`，當 label 超過兩個字（如「個人檔案」）時，會在寬度受限的環境下自動換行。

## Goals / Non-Goals

**Goals:**
- 讓所有 FloatingDock 中的氣泡提示文字維持單行不折行。
- 氣泡提示文字在按鈕上方精準水平置中。
- 保留滑鼠懸停時的縮放與垂直位移過渡動畫。

**Non-Goals:**
- 不修改 FloatingDock 的按鈕結構。
- 不增加額外的全域 CSS 樣式。

## Decisions

### 1. 使用 TailwindCSS 的 `whitespace-nowrap`
- **決定**：直接在 `span` 上套用 `whitespace-nowrap` class。
- **替代方案**：使用 CSS inline style 加上 `whiteSpace: 'nowrap'`，但使用 TailwindCSS Class 更符合專案一貫的撰寫風格。

### 2. 精確水平置中
- **決定**：在 `span` 上加上 `left-1/2 -translate-x-1/2`，並在 hover 狀態的 transition transform 樣式中補上 `-translate-x-1/2`。
- **原因**：如果不補上，hover 動畫會將 transform 重置，導致氣泡偏移。

## Risks / Trade-offs

- **風險**：如果 label 文字極度冗長，不折行可能導致氣泡超出螢幕左右邊界。
- **緩解措施**：目前最長僅為四個字（「個人檔案」、「名片廣場」），在手機寬度下不會溢出，未來若有更長文字需由設計師限制字數。
