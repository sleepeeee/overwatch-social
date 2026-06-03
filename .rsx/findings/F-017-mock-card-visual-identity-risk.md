---
id: F-017
type: finding
title: VAL/LoL 廣場假卡片外觀與真實玩家完全相同，用戶無法區分，信任度風險
status: confirmed
confidence: high
references_to: [REF-016]
referenced_by: []
---

## 結論 / 數據

`ValorantSquare.tsx` 和 `LoLSquare.tsx` 使用與 OWCard 高度一致的卡片模板（`browse-preview-card` class，同樣的 h-320px、UID 格式、tag/message/MBTI 配置），三張假玩家卡片（如 `JettGod#VAL`、`SageHealMe#VAL`）在視覺上與真實 OW 廣場玩家無異。

根本問題：
- 僅在 Tab 按鈕有「即將開放」badge，進入 tab 後的卡片本體完全沒有 mock 標示
- 假卡片保留 `hover:-translate-y-1` 動畫，外觀上是可互動狀態
- 用戶初次使用時可能誤以為 Valorant / LoL 廣場已有真實玩家

**已確認於**（`REF-016` 品質審查時即發現，但未在當時修復）

**修正**（commit 19ddd60）：
1. 每張假卡片頂部加橘色 banner：「⚠ 示範資料 — 非真實玩家」
2. 假卡片套用 `opacity-70 pointer-events-none select-none`，明確為非互動狀態
3. 移除 `hover:-translate-y-1` hover 動畫（pointer-events-none 已阻止，但 class 一併清除）

## 與既有 REF 一致或矛盾

REF-016（browse 品質問題審計）第一條即記錄此問題：「VAL/LoL 假卡片無明確標示」、「用戶誤以為找到了真實特戰英豪/LoL 玩家」。本 Finding 確認了修復方案並驗證視覺效果。

## 對後續影響

1. 此修正為臨時方案，最終解法是接入真實後端（Change #5 `vercel-github-webhook-hud` 的 multi-game 延伸）
2. 若未來接入真實 Valorant/LoL 後端，需移除 banner 和 opacity 限制
3. browse-preview-card class 可考慮設計 `mock` variant（加 data-mock attr），統一管理所有 mock 卡片樣式
