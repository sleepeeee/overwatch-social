---
id: F-020
type: finding
title: browse/page.tsx authLoading guard 阻止 OverwatchSquare 掛載，造成廣場 5s+ 首載延遲
status: confirmed
confidence: high
references_to: [F-003]
referenced_by: []
---

## 結論 / 數據

`browse/page.tsx` 在 `authLoading=true` 時顯示全頁 spinner，阻止 `OverwatchSquare` 掛載，導致資料 fetch 在 auth 確認完才開始。

**延遲累積路徑（量化）**：
- Supabase `getUser()` auth check：~1-2s（冷起動時 ~2s）
- `isMounted` 週期（React useEffect + state setter）：~100-300ms
- Server Action `getPublicProfiles` 往返：~1-2s（含 DB query + Next.js overhead）
- 合計典型感知延遲：5s+（有時可達 7-8s）

**根本原因**：`authLoading` guard 是為保護「登入用戶才能看到的內容」而設計的守門機制，但廣場公開內容不需要 auth，這個 guard 對 OverwatchSquare 毫無必要，卻阻塞了整個渲染路徑。

**修復**：移除 `browse/page.tsx` 的 `authLoading` guard（commit 44491d1）。OverwatchSquare 與 auth 狀態完全解耦，立即掛載，資料 fetch 無需等待 auth 確認。

**修復後效果**：廣場首載從 5s+ 降至約 1-2s（僅 Server Action 往返時間）。

## 與既有 REF / Finding 一致或矛盾

F-003（authLoading guard 缺失根因）記錄了「guard 缺失導致 LoginModal 閃現」問題。本 Finding 是同一 authLoading 機制在廣場頁面的反向問題：guard 存在但不應存在。兩者都指向「authLoading guard 只應守護真正需要 auth 的內容」這個設計原則。

## 對後續影響

1. 廣場頁面的 auth guard 模式已確立：只用 `user` 物件判斷登入狀態，不用 `authLoading` 阻塞公開內容渲染
2. 未來新增的公開頁面（如 player detail）若誤加 authLoading guard，應參考本 Finding 移除
3. browse-cache-layer（ADR-18）在本修復基礎上進一步降低 Server Action 往返延遲，兩者合力提升廣場體驗
