---
id: REF-002
type: docs
title: Supabase Auth with Next.js App Router（@supabase/ssr 官方指南）
url: https://supabase.com/docs/guides/auth/server-side/nextjs
status: active
version: "@supabase/ssr (App Router, 2026)"
last_updated: 2026-05-31
official: true
references_to: []
referenced_by: [REF-003, REF-004, REF-005, REF-006, F-001, ADR-02]
---

## 摘要

Supabase 官方對 Next.js App Router 的 server-side auth 規範，核心套件為 `@supabase/supabase-js` + `@supabase/ssr`。三種 client 角色分明：

1. **Browser client**（`createBrowserClient`）— 給 Client Components 用。
2. **Server client**（`createServerClient` + `next/headers` 的 `cookies()`）— 給 Server Components / Server Actions / Route Handlers 用，透過 `cookies.getAll()/setAll()` 介面橋接框架 cookie API。
3. **Middleware**（`middleware.ts`）— 因為「Next.js Server Components 不能寫 cookie」，token 自動刷新必須在 middleware 完成：呼叫 `supabase.auth.getClaims()` 刷新 token，並把更新後的 cookie 同時寫回 `request.cookies` 與 `response.cookies`。

**關鍵安全規則**：server 端必須用 `getClaims()`（會「每次對 project 已發布公鑰驗證 JWT 簽章」），**不可**依賴 `getSession()`（不保證重新驗證 token）。此為先前 `getUser()` 建議的演進版本。

環境變數採新命名：`NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`（publishable key 取代舊 anon key 命名）。

## 對專案的啟示

直接對應 `google-oauth-supabase-auth` change 的 PROPOSE 設計：
- `/profile` 頁的儲存/讀取改 Supabase，需要 server client 在 Server Action 中以登入身分寫入。
- 必須新增 `src/middleware.ts` 做 token 刷新，否則登入態會在 Server Component 失效。
- design.md 的 client 分層（browser / server / middleware）以此為準，避免在 Server Component 誤用 browser client。
- 安全條款：所有授權判斷一律走 `getClaims()`，禁止用 `getSession()` 當授權依據（Stage 4 安全 audit 必查項）。

## 引用場景

- design.md 的「Supabase client 分層架構」段
- specs/auth/spec.md 的 session 驗證 requirement
- Stage 4 安全 audit（getClaims vs getSession）
- 被 REF-003（Google OAuth 流程依賴 server client + middleware）、REF-004（RLS 依賴 getClaims 驗證的 auth.uid()）引用

## 風險 / Caveat

- 官方頁面未標明確版本號/日期；`@supabase/ssr` API 仍在演進（`getUser` → `getClaims` 即一例），apply 階段第一個 task 應做版本校準（鎖定 package.json 版本並驗證 `getClaims` 存在）。
- `setAll()` 需正確套用 `Cache-Control` 等 header，否則有 CDN 將 session 洩漏給其他使用者的風險。
