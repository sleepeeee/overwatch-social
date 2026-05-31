# Design: google-oauth-supabase-auth

> Stage 3 設計草稿。技術選擇皆鏈接 Stage 1 REF（rationale 表）。

## Rationale 表（技術選擇 ↔ prior work）

| 技術選擇 | 決策 | 依據（REF / 理由） |
|---|---|---|
| Auth + DB 套件 | `@supabase/supabase-js` + `@supabase/ssr` | REF-002（Next.js App Router 官方 server-side auth 路徑） |
| Client 分層 | browser / server / middleware 三角色分離 | REF-002（Server Component 不能寫 cookie，token 刷新須在 middleware） |
| Server 端授權檢查 | 一律 `getClaims()`，禁用 `getSession()` 當授權依據 | REF-002（getClaims 每次驗 JWT 簽章；getSession 不保證重驗） |
| 登入方式 | Google OAuth，**PKCE flow** + `/auth/callback` route | REF-003（Server-Side Auth 必須 PKCE + exchangeCodeForSession，否則 server 拿不到 session） |
| 資料授權 | Postgres RLS：anon-SELECT + authenticated-own-row | REF-004（公開 key 場景唯一授權邊界；對應「廣場公開、僅本人可改」） |
| `auth.uid()` 寫法 | 包成 `(select auth.uid())` | REF-004（per-statement 快取，效能） |
| 環境變數命名 | `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | REF-002（publishable key 新命名取代 anon key） |

## Supabase client 分層架構（REF-002）

```
src/lib/supabase/
├── client.ts   # createBrowserClient — Client Components（登入按鈕、即時 UI）
└── server.ts   # createServerClient + cookies() — Server Components / Actions / Route Handlers
src/middleware.ts  # getClaims() 刷新 token，cookie 寫回 request + response
```

- `/profile` 的儲存改為 **Server Action**：用 server client + `getClaims()` 取 user id，寫入 `profiles`（user_id = 該 id）。
- 登入按鈕（Navbar）用 browser client 觸發 `signInWithOAuth`。

## Google OAuth flow 序列（REF-003）

```
使用者點登入 → browser: signInWithOAuth({provider:'google',
                          options:{redirectTo: <app>/auth/callback}})
  → 轉跳 Google 同意畫面（scopes: openid, email, profile）
  → Google 回跳 Supabase /auth/v1/callback（Google Console 設定的 redirect URI）
  → Supabase 帶 code 回跳 app /auth/callback
  → app/auth/callback/route.ts: exchangeCodeForSession(code) → 寫 session cookie
  → redirect 回 next（預設 /profile）
```

> **雙層 redirect URI 釐清**（REF-003 必查坑）：Google Console 填 Supabase 的 `/auth/v1/callback`；`signInWithOAuth` 的 `redirectTo` 填 app 自家的 `/auth/callback`。兩者不同層。

## profiles 表 schema（REF-004，對應 OWPlayerCard）

```sql
create table profiles (
  user_id        uuid primary key references auth.users(id) on delete cascade,
  server         text not null,
  battle_tag     text not null,
  is_tag_visible boolean not null default true,
  selected_heroes text[]  not null default '{}',   -- 最多 3，app 層驗
  tags            text[]  not null default '{}',    -- 最多 3
  message         text    not null default '',      -- 限 100 字，app 層驗
  languages       text[]  not null default '{}',
  mic_status      text    not null default 'mic-on',-- mic-on|listen-only|mic-off
  social_channels jsonb   not null default '{}',    -- {discord?,steam?,x?,line?}
  mbti            text,                              -- nullable
  updated_at      timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "profiles public read"
  on profiles for select to anon, authenticated using (true);

create policy "profiles insert own"
  on profiles for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "profiles update own"
  on profiles for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
```

> **設計取捨 — `social_channels` 用 jsonb**：貼合現有 TS 型別 `social_channels: {discord?,steam?,x?,line?}`，避免拆 4 欄 + null 處理；代價是 DB 層難下欄位約束（由 app 層驗）。MVP 採 jsonb；若日後需按平台查詢再正規化。

## MVP 範圍邊界（Stage 5 收斂）

**做：** Google OAuth 登入/登出、`/profile` 登入後讀寫自己的 profile、`/browse` 從 profiles 讀公開名片、RLS、middleware token 刷新。

**不做（明確排除，避免範圍蔓延）：** Email/密碼登入、玩家詳細頁 `/player/[id]`、搜尋/篩選後端化、頭像上傳（Storage）、Google refresh token、即時訂閱（Realtime）。

## 風險與緩解

| 風險 | 緩解 |
|---|---|
| RLS enable 後漏建 policy → 整表打不開（REF-004 坑） | apply Task 1 環境校準 smoke：未登入查 SELECT 應成功、寫入應被拒 |
| 雙層 redirect URI 設錯 → OAuth 失敗（REF-003 坑） | smoke：完整跑一次登入 flow，driver 驗證 callback 換到 session |
| Server Component 誤用 browser client → 登入態漏失（REF-002） | client 分層檔名強制區分；code review 檢查 import 來源 |
| `getSession()` 被當授權依據 | 安全 audit 全域 grep 禁用模式 |
