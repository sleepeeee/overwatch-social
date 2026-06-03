---
id: ADR-17
title: 首頁 Widget 區從巢狀雙欄改為扁平三欄等高，並暫時移除 HomeCaptureHud
status: Accepted
date: 2026-06-03
references_to: [F-019]
referenced_by: [F-019]
---

## 背景

首頁原始佈局（`page.tsx`）：

```
lg:grid-cols-12 items-start
├── col-span-8（含 md:grid-cols-12 內嵌）
│   ├── md:col-span-6 → LUCKY ALLY
│   ├── md:col-span-6 → 站長隨筆手札
│   └── section → 最新在大廳啟航的玩家
└── col-span-4
    └── FeaturedArtists（LOBBY EVENTS + HomeCaptureHud 堆疊）
```

問題：
1. LOBBY EVENTS 與 LUCKY ALLY / 站長隨筆手札 在不同 grid 層級，`items-stretch` 無法讓它們等高
2. HomeCaptureHud 在 Vercel 顯示假資料（F-019），掛在首頁會誤導用戶
3. 移除 HUD 後 LOBBY EVENTS 獨占右欄，高度比左邊兩個 widget 矮很多，版面失衡

## 決策

**A. 佈局重構**：改為扁平三欄，同層 CSS Grid，`items-stretch` 自動等高：

```
space-y-8（外層）
├── grid grid-cols-1 md:grid-cols-3 gap-8（三欄等高 widget row）
│   ├── col-span-1 → LUCKY ALLY
│   ├── col-span-1 → 站長隨筆手札（LotusWelcomeWidget）
│   └── col-span-1 → FeaturedArtists（LOBBY EVENTS only）
└── section → 最新在大廳啟航的玩家（獨立 row，全寬）
```

FeaturedArtists 的 outer div 改為 `flex flex-col h-full w-full`，LOBBY EVENTS glass-panel 加 `flex-1`，使其撐滿等高空間。

**B. 暫時移除 HomeCaptureHud**：
- 從 `FeaturedArtists.tsx` 移除 `HomeCaptureHud` import 及渲染
- 等 `vercel-github-webhook-hud` change 完成（Supabase 資料源接通）後重新評估掛載位置

## 理由

| 考量 | 選擇依據 |
|---|---|
| 等高問題 | CSS Grid 等高需要 siblings 在同一 grid context；巢狀 grid 無法跨層對齊 |
| HUD 假資料 | 顯示假數字比不顯示更糟（誤導用戶），暫時移除優於保留假 HUD |
| 最小侵入 | 扁平三欄保留全部三個 widget 功能，只改 grid 結構，不改 widget 內部邏輯 |
| RWD | `md:grid-cols-3` 在手機自動堆疊（grid-cols-1），行為與原設計一致 |

## 取捨 / 已知 Debt

- **LUCKY ALLY 和 LotusWelcomeWidget 高度**：三欄等高由 CSS Grid 自動決定，高度取決於最高的 widget；若三者高度差異極大，矮的 widget 下方會有空白（目前實測三者高度接近，可接受）
- **HUD 暫時消失**：用戶在公開首頁看不到 Git Outpost 功能，直到 Change #5 完成；developer 後台（`/developer/capture-hud`）仍可使用

## 影響範圍

- 修改：`src/app/page.tsx`（佈局重構，移除舊巢狀 grid）
- 修改：`src/components/morning-sketch/FeaturedArtists.tsx`（移除 HomeCaptureHud + 改 h-full 佈局）

## 相關 ADR / Finding

- F-019：HomeCaptureHud 在 Vercel 顯示假資料（移除決策的直接動機）
