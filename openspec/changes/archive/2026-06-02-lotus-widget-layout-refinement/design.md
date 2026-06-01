## Context

在目前的 UI 設計中，[LotusWelcomeWidget](file:///D:/AI/overwatch/overwatch-social/src/components/morning-sketch/LotusWelcomeWidget.tsx) 元件雖然具有精美的禪意手帳風外觀，但在以下對齊與重心細節上仍有改進空間：
1. **按鈕動畫偏移**：啟用或懸停於步進按鈕（01-04）時，背景產生的 `animate-ping` 動態光波在視覺上偏下，未對齊按鈕圓心。
2. **圖標下偏**：蓮花圖標包裝容器具有 `pt-2`，導致圖標整體下移。
3. **佈局鬆散**：文字區使用 `flex-grow` 將底部按鈕釘在卡片最下方，使得大卡片內的各元件間距過大，且重心過於靠下。

## Goals / Non-Goals

**Goals:**
- 修正步進按鈕背景發光動畫，使之完美同心圓置中於按鈕。
- 移除圖標頂部的偏心 padding，使圖標完美垂直水平置中。
- 優化文字與按鈕的垂直佈局，縮短間距，並使重心上移，在卡片底部空出更多呼吸空間，提升視覺精緻感。
- 限制說明文字最大寬度以避免在不同螢幕寬度下，字體過寬導致斷行不美觀。

**Non-Goals:**
- 不修改 `LotusWelcomeWidget` 的功能邏輯（如公告內容切換邏輯）。
- 不修改元件的水彩背景發光環（僅微調其元件本身的佈局與 CSS）。

## Decisions

### 1. 修正步進按鈕 `animate-ping` 發光圈定位
- **方案**：在發光圈的 `div` 元素上加上 Tailwind CSS 的 `top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`。
- **理由**：因為按鈕本身是 `relative` 且使用 `flex items-center justify-center`。雖然發光圈為 `absolute`，但缺乏置中座標指令，預設渲染會貼齊父容器流的起點，加上置中平移指令能確保無論按鈕大小為何，發光動畫均完美置中。

### 2. 移除圖標容器的 pt-2
- **方案**：將 `<div className="relative z-10 w-28 h-28 flex items-center justify-center pt-2">` 改為 `<div className="relative z-10 w-28 h-28 flex items-center justify-center">`。
- **理由**：`pt-2` 會破壞圖標本身在 `w-28 h-28` 容器內的垂直居中，移除它可以讓圖標完美對齊網格。

### 3. 使用緊湊包裝容器 (Wrapping Container) 重新平衡垂直重心
- **方案**：
  - 移除文字公告區的 `flex-grow flex flex-col justify-center`，使其不再被動態拉伸。
  - 將「文字公告區」與「按鈕組」包入同一個 `<div className="relative z-10 flex flex-col items-center gap-3.5 -mt-3.5 w-full">` 中。
  - 限制 `p` 內文為 `max-w-[280px]`。
- **理由**：
  - 包入同一個 wrapper 可以使文字和按鈕的間距穩定為 `gap-3.5`（14px），避免被 `flex-grow` 拉得很散。
  - `-mt-3.5`（-14px）的負 margin 能夠在不破壞圖標尺寸的情形下，使文字與按鈕整體向上提升，靠近圖標，優化視覺上的重心。
  - 限制 `max-w-[280px]` 可以使文字塊聚攏在中間，在置中對齊時顯得更有質感。

## Risks / Trade-offs

- **[Risk] 文字寬度受限導致換行增加** → **[Mitigation]** 引言段落均為簡短的 1-2 句話（約 40-50 字），`max-w-[280px]`（在 xs/sm 螢幕上約為 `20rem`）足夠完整容納兩行至三行，可在大螢幕上避免單行拉得過長而影響手帳風的美感，斷行效果極佳。
