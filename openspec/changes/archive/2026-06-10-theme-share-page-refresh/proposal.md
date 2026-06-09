## Why

專案在經歷「曜石暗夜星塵（web-overhaul）」主題翻新後，玩家名片分享頁面仍然遺留了舊版莫蘭迪淺色背景與深褐色文字。這導致當玩家點進分享頁面時，視覺感受不一致且字體難以看清。我們需要將分享頁面完全重構，以符合最新的星空漸層與極光配色標準。

## What Changes

- **背景氛圍翻新**：移除莫蘭迪風格的漂浮裝飾球（`<FluidClipPath />`），導入全螢幕無縫大氣漸層（`ambient-space-glows`）。
- **按鈕配色改版**：
  - 返回按鈕與建立特工卡片按鈕改為與大廳一致的暗色玻璃按鈕風格。
  - 「保存此卡片為圖片」按鈕改為曜石星河漸層極光紫配色（`from-auroraTeal to-auroraMint`）。
- **文字與泡泡配色修正**：
  - 右上角 `已成功載入特工分享名片` 提示泡泡改為符合星塵主題的極光紫配色。
  - 正下方的 `💡 點擊名片上的...` 說明文字改為全站預設字體（`font-sans`）並套用 `text-zinc-400` 配色。

## Capabilities

### New Capabilities

<!-- 無 -->

### Modified Capabilities

- `share`: 修改分享名片頁面的視覺展現與互動控制項配色，以符合曜石星空主題規範。

## Impact

- **Frontend**: 影響分享頁面 Client 元件 `src/app/share/[id]/ShareCardClient.tsx`。
