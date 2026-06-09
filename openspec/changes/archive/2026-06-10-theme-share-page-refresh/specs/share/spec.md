## ADDED Requirements

### Requirement: Share Page Visual Overhaul
分享頁面（`ShareCardClient`）的背景、按鈕、提示泡泡與字體必須 (SHALL) 全面翻新，以符合最新的「曜石暗夜星塵（web-overhaul）」單主題視覺標準。

#### Scenario: Verify Share Page Aesthetics
- **WHEN** 使用者訪問分享頁面 `/share/{id}` 時
- **THEN** 頁面必須呈現全螢幕無縫大氣星空漸層（`ambient-space-glows`）背景，並移除舊版莫蘭迪漂浮球（`FluidClipPath`）。
- **AND** 「返回大廳」與「建立卡片」按鈕呈現暗色玻璃擬態風格。
- **AND** 「保存此卡片為圖片」按鈕套用曜石星河漸層極光紫配色。
- **AND** 右上角提示泡泡變更為極光紫配色，正下方說明文字變更為全站預設字體（`font-sans`）並套用 `text-zinc-400` 鋅灰色，不得殘留任何舊版莫蘭迪深褐色（`#3e2723`）或沙色（`#8c7c6c`）。
