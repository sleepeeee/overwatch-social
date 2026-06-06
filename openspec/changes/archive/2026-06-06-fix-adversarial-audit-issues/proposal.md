## Why

為了解決「曜石暗夜星河」全站大主題移植後，發生的全域背景白底（失效）、導航欄結構與 Logo 細節不一致、首頁工作室入口缺乏 Google 快速登入按鈕，以及個人檔案主控台在未登入時的 SSR 水合不一致、特戰英豪與英雄聯盟名片禁用的問題。修復這些問題可保證 Next.js 專案的視覺效果與互動體驗和 HTML 參考稿百分之百對齊。

## What Changes

- **修復全域背景白底**：在 `layout.tsx` 將 `body` 行內 style 的 `background` 簡寫拆分為 `backgroundColor` 與 `backgroundImage`，防止隱式將背景色重置為透明進而露出瀏覽器預設白底，並在 `globals.css` 與全域字型及選取樣式對齊。
- **重構頂部導航欄 (TopBar)**：升級為 `sticky top-0 z-50 glass-panel border-b border-white/[0.04]` 置頂狀態，並統一高質感高度 `h-20`。
- **補齊 CosmicFullLogo 動態細節**：在 Logo SVG 中還原「北極星星芒 (`main-star`)」與動畫、行星小星軌道等，並添加 `scale` 容器防止裁剪。
- **首頁 Google 快速登入卡片**：在首頁的「全域身份工作室」卡片中內嵌 `Continue with Google` 按鈕與登入狀態展示，點擊原地登入。
- **個人檔案 SSR 水合修復**：引入 `mounted` 狀態延遲載入 profile 條件分支，防止 Hydration mismatch 錯誤。
- **解禁並移植特戰英豪與英雄聯盟名片**：在特工主控台中啟用 Valorant 與 LoL 的名片自定義功能，並對應各自的 `rose` 與 `blue` 配色。
- **重寫常用立繪三插槽邏輯**：修正 `handleToggleHero` 依序填充與清空邏輯，並補齊本地立繪 fallback 防止破圖。

## Capabilities

### New Capabilities
- 無

### Modified Capabilities
- `art-ui-aesthetics`: 修復全域背景白底與 Logo 星芒動態，確保曜石星河漸變正常呈現。
- `auth-ux`: 首頁工作室卡片底部整合 Google 快速登入，個人檔案防線修復 SSR 水合問題。
- `profiles`: 解禁並移植特戰英豪與英雄聯盟名片自定義，並重構常用立繪三插槽邏輯與配色。

## Impact

- 影響檔案：
  - `src/app/layout.tsx` (全域 body 樣式、字型與背景載入)
  - `src/app/globals.css` (全域 @layer base 樣式)
  - `src/components/TopBar.tsx` (置頂磨砂導航欄)
  - `src/components/CosmicParticlesBackground.tsx` (`CosmicFullLogo` 與粒子背景)
  - `src/app/page.tsx` (首頁卡片整合 Google 登入按鈕)
  - `src/app/profile/page.tsx` (水合問題修復、三插槽邏輯重構、Valorant/LoL 檔案解禁)
