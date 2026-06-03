## Context

原始佈局使用巢狀 grid：外層 `lg:grid-cols-12`，左側 `col-span-8` 內含 `md:grid-cols-12`（LUCKY ALLY col-6 + 站長 col-6）加上最新在大廳 section，右側 `col-span-4` 為 FeaturedArtists（LOBBY EVENTS + HUD 堆疊）。

`items-start` 使右欄靠頂對齊，不拉伸。LOBBY EVENTS + HUD 合計高度原本接近左欄兩個 widget，但移除 HUD 後 LOBBY EVENTS 獨占右欄，高度明顯偏矮。

## Goals / Non-Goals

**Goals:**
- LUCKY ALLY / 站長隨筆手札 / LOBBY EVENTS 三欄等高（md 以上）
- 移除假資料 HUD（改善生產環境 UX）
- 最新在大廳玩家仍在 widget 下方顯示

**Non-Goals:**
- 改動 LUCKY ALLY / LotusWelcomeWidget 內部樣式
- 解決 HUD 假資料根本問題（另立 Change #5）

## Architecture Decision

見 ADR-17：扁平三欄等高 + 暫時移除 HUD。

## Key Files

- `src/app/page.tsx`
- `src/components/morning-sketch/FeaturedArtists.tsx`
