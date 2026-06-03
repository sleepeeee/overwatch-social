## Why

首頁右側 `HomeCaptureHud` 在 Vercel 生產環境顯示假資料（0 PTS / 50-50），因 Server Action 讀取本機 JSON 在 serverless 環境不可用。同時 LOBBY EVENTS 面板因巢狀 grid 結構無法與 LUCKY ALLY / 站長隨筆手札 等高，版面失衡。

## What Changes

- 從 `FeaturedArtists.tsx` 移除 `HomeCaptureHud` import 及渲染
- `page.tsx` 佈局重構：巢狀雙欄（col-span-8 + col-span-4）改為扁平三欄（md:grid-cols-3），同層 CSS Grid 自動等高
- LUCKY ALLY / 站長隨筆手札 / LOBBY EVENTS 三個 widget 同一 grid row
- 最新在大廳啟航的玩家移到獨立第二 row（全寬）

## Capabilities

### Modified Capabilities

- `homepage-widget-layout`：三欄等高，LOBBY EVENTS 對齊 LUCKY ALLY / 站長隨筆手札高度

### Removed Capabilities（暫時）

- `homepage-hud`：首頁 Git Outpost HUD 暫時移除，待 vercel-github-webhook-hud change 完成後重新接入

## Impact

- **修改**：`src/app/page.tsx`（佈局重構）
- **修改**：`src/components/morning-sketch/FeaturedArtists.tsx`（移除 HUD + h-full 改動）
