---
id: REF-003
type: docs
title: Supabase Google OAuth 登入（PKCE flow + Next.js callback route）官方指南
url: https://supabase.com/docs/guides/auth/social-login/auth-google
status: active
version: "Supabase Auth Google provider (2026)"
last_updated: 2026-05-31
official: true
references_to: [REF-002]
referenced_by: [REF-004, F-001, F-002]
---

## 摘要

Supabase Google OAuth 的官方設定流程，分兩端：

**Google Cloud Console 端：**
- 建 OAuth Client ID，類型選「Web application」。
- Authorized JavaScript origins：填 app base URL（如 `http://localhost:3000`、`https://<prod>`）。
- Authorized redirect URIs：填 **Supabase 的 callback URL**（非自家 app）。本地開發為 `http://127.0.0.1:54321/auth/v1/callback`；雲端版從 Supabase Dashboard 的 Google provider 設定頁取得。
- Scopes：`openid`（需手動加）+ `userinfo.email` + `userinfo.profile`。
- Client ID / Secret 填回 Supabase Dashboard 的 Google provider 頁。

**App 端（Server-Side Auth 用 PKCE flow）：**
```ts
await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: { redirectTo: 'http://localhost:3000/auth/callback' },
})
```
需建一個 callback Route Handler（`app/auth/callback/route.ts`）用 `exchangeCodeForSession(code)` 把授權碼換成 session，成功後 redirect 回 `next`，失敗則導到錯誤頁。

## 對專案的啟示

直接對應 change 的「Google OAuth 登入」需求：
- 需新增 `src/app/auth/callback/route.ts`（PKCE code exchange），這是 tasks.md 的一個明確 task。
- `signInWithOAuth` 用 browser client 觸發（登入按鈕在 Navbar / 登入頁），callback 用 server client 換 session（與 REF-002 的 client 分層一致）。
- **重要釐清**：Google Console 的 redirect URI 指向 Supabase（`/auth/v1/callback`），而 `signInWithOAuth` 的 `redirectTo` 指向自家 app 的 `/auth/callback` —— 兩者不同層，混淆會導致 OAuth 失敗（Stage 4 技術可行性 audit 必查）。

## 引用場景

- design.md 的「Google OAuth flow 序列」段
- specs/auth/spec.md 的 OAuth 登入 + callback requirement
- tasks.md 的「建 callback route」「Google Console 設定」task
- Stage 4 安全 audit（redirect URI 雙層、PKCE vs implicit flow）
- 被 REF-004 引用（OAuth 登入後產生的 auth.uid() 是 RLS policy 的主體）

## 風險 / Caveat

- 預設 `signInWithOAuth({provider:'google'})` 不帶 redirectTo 是 implicit flow（適合純 client）；Server-Side Auth **必須**用 PKCE + callback route，否則 server 端拿不到 session。
- 取得 Google refresh token 需額外 `queryParams: { access_type: 'offline', prompt: 'consent' }`；本 change MVP 若不需要長期 Google API access，可不加，避免每次都強制重新授權。
- Client Secret 屬機密，只存 Supabase Dashboard / 環境變數，禁止 hardcode 或進前端 bundle。
