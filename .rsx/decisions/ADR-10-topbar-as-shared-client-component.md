---
id: ADR-10
title: TopBar 以獨立 Client Component 各頁面 import（非 layout.tsx 注入 / AuthContext）
status: superseded
superseded_by: ADR-11
date: 2026-06-02
references_to: [REF-001, ADR-11]
referenced_by: [F-010]
---

## 背景

三個頁面（`/`、`/browse`、`/profile`）的右上角登入/登出 UI 原本各自實作，導致行為不一致（browse 缺 TopBar、profile 有 mock user bug）。需要統一抽取為共用元件。

## 決策

建立 `src/components/TopBar.tsx`（`"use client"` Client Component），由三個頁面各自 import 使用，而非：

- **方案 B**：在 `layout.tsx` 統一注入 TopBar
- **方案 C**：建立 AuthContext，在 layout 層維護 auth state，各元件訂閱

## 理由

| 考量 | 選擇方案 A 的依據 |
|---|---|
| 實作成本 | 最低：直接從 page.tsx 抽取，無需改動 layout 或 Context API |
| 範圍限制 | 本 change 定義為 bug fix（守門失效）而非架構重構 |
| 風險 | 改 layout.tsx 影響所有頁面；AuthContext 改動更大，需同步更新三頁 state 管理 |
| 時程 | 守門漏洞需快速修復，架構重構可獨立 change |

## 取捨 / 已知 Debt

方案 A 雖快速解決問題，但保留了以下架構 debt：

- 三個頁面（page.tsx、TopBar.tsx 各有一個 onAuthStateChange 訂閱）仍分散管理 auth state
- 每次路由切換時 TopBar unmount/mount，造成訂閱重建
- auth loading 閃爍風險在跨頁面導航時仍存在

**建議後續 change**：`auth-context-refactor`

- 將 auth state 移至 `layout.tsx` 層 AuthContext
- TopBar 改為純 UI（從 Context 讀 user state）
- 各頁面 profile/browse 的 auth 相關 state 統一移除，改 useContext

## 影響範圍

- 新增：`src/components/TopBar.tsx`
- 修改：`src/app/page.tsx`、`src/app/browse/page.tsx`、`src/app/profile/page.tsx`
- 未改動：`layout.tsx`、AuthContext（無）

## 相關 ADR

- ADR-01（Stop hook + Task Scheduler）：不相關，不同領域
