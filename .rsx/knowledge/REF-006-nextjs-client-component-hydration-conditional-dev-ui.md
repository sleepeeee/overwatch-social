---
id: REF-006
type: docs
title: Next.js App Router Client Component 渲染模型與條件式 dev-only UI（避免 hydration mismatch）
url: https://nextjs.org/docs/app/getting-started/server-and-client-components
status: active
version: "Next.js 16.2.6"
last_updated: 2026-05-31
official: true
references_to: [REF-002, REF-005]
referenced_by: [ADR-02, F-003, ADR-03]
---

## 摘要

Next.js 16 App Router 預設 layout/page 為 Server Component；需要 state / event handler / browser API / 自訂 hook 的元件加 `"use client"` 成為 Client Component。

**首次載入渲染順序**（與 hydration mismatch 直接相關）：
1. Server 把 Server Component 渲成 RSC Payload，Client Component 與 RSC Payload 一起預渲染成 **HTML**（首屏快照）。
2. Client 端：HTML 先顯示非互動預覽 → RSC Payload 對齊 Server/Client 樹 → JS **hydrate** Client Component 接上 event handler。

**hydration mismatch 成因**：Client Component 首次 render（SSR 階段）產生的 HTML 與 client 端 hydration 首次 render 結果**不一致**時報錯。典型來源 = 元件首屏依賴「只有 client 才知道」的非同步資料（如 `supabase.auth.getUser()` 結果、`window`、`localStorage`）。

**hydration-safe 條件渲染 pattern**：依賴 client-only 非同步資料的 UI，在資料解析完成前應 render `null`（或穩定 placeholder），等 `useEffect` mount + 資料到位後才切換。如此 SSR 與 client 首 render 都是 `null`，一致 → 無 mismatch。

**環境污染防護**：`NEXT_PUBLIC_` 前綴才進 client bundle；`server-only` / `client-only` npm 套件可在 build-time 阻止跨環境誤用。

## 對專案的啟示

直接對應 `auth-fix-and-developer-role` 的 **DevModeBanner + useDevMode** 設計：

- `DevModeBanner` 是 Client Component（`"use client"`），內部用 `useDevMode()` → 後者非同步 `getUser()` 拿 `app_metadata.role`（REF-005）。
- **hydration 安全規則**：`useDevMode()` 必須回傳 `loading` 旗標；`DevModeBanner` 在 `loading === true` 時 render `null`。這保證：
  - SSR / 首次 client render：`loading=true` → `null`（兩端一致）。
  - 解析完成後：依 `isDeveloper` 切換顯示。
- 因此 design.md D4 的 `{ isDeveloper, loading }` 回傳形狀**不是可選的**，是避免 hydration mismatch 的必要設計，非裝飾。
- dev-only UI gating 兩種來源要分清：
  - **build-time**：`process.env.NODE_ENV === 'development'`（dev server 才存在）。
  - **runtime role**：`app_metadata.role === 'developer'`（prod 也對 developer 顯示）。
  - 本 change 要的是 **runtime role gating**（prod 上特定 email 也要看到 banner），非 NODE_ENV gating。兩者不可混淆。

## 引用場景

- design.md D4 / D5 的 hydration 安全 rationale
- specs/auth/spec.md 「未登入 / loading 時 banner render null」scenario 的技術依據
- tasks.md「建 useDevMode 回傳 loading」「DevModeBanner loading 時 return null」
- 引用 REF-002（Supabase client 分層，getUser 在 browser client）、REF-005（app_metadata role 讀取）

## 風險 / Caveat

- 若 `useDevMode` 不回 `loading`、直接以 `isDeveloper` 初始 `false` render：首屏雖不報 mismatch（兩端都 false），但 developer 會看到 banner「閃進」（flash），體驗瑕疵但非錯誤；回傳 `loading` 並在 loading 時 render null 可避免閃爍。
- `app_metadata` 變更後舊 JWT 到期前不更新（REF-005 caveat）：banner 出現時機受 token 刷新節奏影響，非 hydration 問題，須在文件層面說明。
