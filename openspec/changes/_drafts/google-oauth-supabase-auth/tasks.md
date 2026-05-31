# Tasks: google-oauth-supabase-auth

> Task 1 為環境校準（§7 規定）。涉及完整 OAuth flow 的 e2e 驗證 wall-clock 可能 > 1hr，建議先跑 §X4 smoke（Task 1）。

## 1. 環境校準與 smoke（先行，驗證假設）
- [ ] 1.1 安裝 `@supabase/supabase-js` + `@supabase/ssr`，鎖定版本到 package.json
- [ ] 1.2 驗證 `@supabase/ssr` 提供 `getClaims()`（API 版本校準，REF-002 caveat）
- [ ] 1.3 建立 Supabase 專案，設定 `.env.local`（URL + publishable key，不進 git）
- [ ] 1.4 smoke：建一張測試 profile + 啟 RLS + 建 public_profiles view → anon 查 `profiles` 整表應被拒/空、anon 查 `public_profiles` 應成功且 is_tag_visible=false 時 battle_tag 已遮蔽、未登入寫入應被拒（驗 RLS + view 雙層生效，REF-004 坑）

## 2. Supabase client 分層（REF-002）
- [ ] 2.1 `src/lib/supabase/client.ts`（createBrowserClient）
- [ ] 2.2 `src/lib/supabase/server.ts`（createServerClient + cookies）
- [ ] 2.3 `src/middleware.ts`（getClaims 刷新 token，cookie 寫回 request+response）
- [ ] 2.4 [Next.js 16 相容校準] 確認 (a) middleware 檔名為 `middleware.ts`、export default 形式符合 Next.js 16 API；(b) 全域 grep `cookies()` call sites，所有地方改成 `await cookies()`；(c) 確認 `config.matcher` 排除 `/_next/static`、`/_next/image`、`/favicon.ico`、`/auth/callback`；(d) `npm run build` 無型別錯誤

## 3. Google OAuth 登入（REF-003）
- [ ] 3.1 Google Cloud Console 建 OAuth Client（redirect URI 指向 Supabase `/auth/v1/callback`）
- [ ] 3.2 Supabase Dashboard 設定 Google provider（填 Client ID/Secret）
- [ ] 3.3 Navbar 登入/登出按鈕（browser client signInWithOAuth，redirectTo 指向 app `/auth/callback`）
- [ ] 3.4 `src/app/auth/callback/route.ts`（exchangeCodeForSession + 錯誤頁 fallback + `next` 參數防 open redirect：先 URL decode，用 `new URL(next, origin)` parse，驗 `url.origin === origin` 且 pathname 以 `/` 開頭且不含 `//`，驗證失敗 fallback `/`）
- [ ] 3.5 smoke：完整跑一次 Google 登入 flow，驗 server 端 getClaims 拿到身分

## 4. profiles 表與 migration（REF-004）
- [ ] 4.1 撰寫 migration SQL：建 profiles 表（對應 OWPlayerCard）
- [ ] 4.2 enable RLS + 3 條 policy（authenticated SELECT own / insert own / update own）；**不加 public SELECT policy**
- [ ] 4.3 建立 `public_profiles` view：SELECT 除 social_channels 外的欄位，並對 is_tag_visible=false 的 row 遮蔽 battle_tag 為 '隱藏#xxxx'（DB 層隱私保護）
- [ ] 4.4 smoke：用 anon key 直接查 profiles 整表應被 RLS 拒絕；查 public_profiles 應回傳遮蔽後結果

## 5. /profile 改 Supabase 讀寫（取代 localStorage）
- [ ] 5.1 載入：登入後從 profiles 讀本人名片（無則預設值）
- [ ] 5.2 儲存：改為 Server Action 寫 Supabase（getClaims 取 user_id）
- [ ] 5.3 未登入：提示登入、隱藏儲存功能
- [ ] 5.4 移除 localStorage('ow_social_user_card') 讀寫路徑

## 6. /browse 改 Supabase 資料源
- [ ] 6.1 從 `public_profiles` view 查廣場名片（取代 mockPlayers），不直接查 `profiles` 表
- [ ] 6.2 驗證 DB view 已在資料層遮蔽：前端不得有自行遮蔽 battle_tag 的邏輯（遮蔽責任在 DB 層）
- [ ] 6.3 （可選）保留 mock 作冷啟動 fallback

## 7. 驗收整合
- [ ] 7.1 `openspec validate google-oauth-supabase-auth --strict` 通過
- [ ] 7.2 安全複查：全域 grep 無 getSession 當授權依據、無 hardcode secret
- [ ] 7.3 §6.7 apply 完成審查（codex_dispatch apply_review）
