---
id: F-019
type: finding
title: HomeCaptureHud 在 Vercel 生產環境顯示假資料（0 PTS / 50-50），誤導用戶
status: confirmed
confidence: high
references_to: [F-004, ADR-17]
referenced_by: [ADR-17]
---

## 結論 / 數據

`HomeCaptureHud` 透過 `getCaptureStateSnapshot()` Server Action 讀取本機 JSON 檔案（`data/developer-capture-state.json`），此路徑在 Vercel serverless 環境不存在，Server Action fallback 回 neutral state：
- 所有玩家 score = 0 PTS
- 佔領比例 50% / 50%
- Radar knob 停在中間（MID）
- COMMITS / ADDITIONS / DELETIONS 全為 0

此為 F-004（Vercel serverless 唯讀 filesystem）的具體展現：HUD 顯示的是靜態 fallback 而非真實 git commit 統計。

**視覺影響**：首頁右側顯示一個看起來正常運作的 HUD，但數字全是假的，用戶可能誤以為「今天沒有 commit」或「兩人完全平手」。

**已知根本解法**（待實作，Change #5 `vercel-github-webhook-hud`）：
- 建立 GitHub Webhook → Vercel API Route → Supabase `git_outpost_captures` 表
- `readCaptureState()` 改從 Supabase 讀，本地開發 fallback 到 JSON

**臨時處置**（commit d5cb76e）：
- 從首頁 `FeaturedArtists.tsx` 完全移除 `HomeCaptureHud`
- 待 vercel-github-webhook-hud change 完成後重新掛載（此時資料來源已改為 Supabase）

## 與既有 REF / Finding 一致或矛盾

F-004（Vercel serverless 唯讀 filesystem 根因分析）是同一 root cause 的早期記錄，當時修復了 `saveHeroAlignments` 改走 Supabase，但 HUD 的資料讀取路徑尚未處理。本 Finding 是 F-004 在 HUD 場景的延伸確認。

## 對後續影響

1. 首頁移除 HUD 後，佔領監控功能僅在 `/developer/capture-hud` 後台可用（本地開發，資料真實）
2. Change #5 完成後，`HomeCaptureHud` 可重新加回首頁（需同步從 FeaturedArtists 補回或重新掛載位置）
3. ADR-17 記錄了三欄等高佈局決策，即使未來 HUD 重新加回，layout 結構可能也不同
