# Tasks: auth-fix-and-developer-role

> **Phase 切分（proposal scope gate）**：
> - **Phase A = auth mock 修復**（Task 0-2）：阻斷級，不依賴 Dashboard 手動作業，可獨立 ship。
> - **Phase B = developer role**（Task 3-7）：依賴 Phase A + Supabase Dashboard 手動設定；卡關不得阻塞 Phase A。

## 0. 環境校準（apply 第一 task）

- [x] 0.1 確認 `@supabase/ssr` 與 `@supabase/supabase-js` 版本（`package.json`），驗證 `@/lib/supabase/client` 的 `createClient()` 與 `Navbar.tsx` 一致可用（REF-002 caveat：API 演進中）
- [x] 0.2 `npm run dev` smoke 啟動，確認首頁可載入、`Navbar` 既有登入流程仍正常（基準線）

## 1. 修復首頁登入（D1, REF-003）

- [x] 1.1 `page.tsx` 加 `"use client"` 既有、import `createClient`（`@/lib/supabase/client`）
- [x] 1.2 `handleGoogleLogin` 改 async：呼叫 `signInWithOAuth({ provider:'google', options:{ redirectTo: \`${window.location.origin}/auth/callback?next=/profile\` } })`，移除 `alert`
- [x] 1.3 驗證：點按鈕跳轉 Google 授權頁（非 alert）✅ 已在瀏覽器確認

## 2. 修復側邊欄登出（D2, REF-002）— latent 修復

> **[M3]** grep 全 src 確認 `AppSidebar` 與 `Navbar` 皆未掛載；唯一 live 登入入口是 `page.tsx`。本 task 為一致性 latent 修復。

- [x] 2.1 `AppSidebar.tsx` import `createClient` + `useRouter`（`next/navigation`）
- [x] 2.2 `handleLogout` 改 async：`await supabase.auth.signOut()` 後 `router.refresh()`，移除 `alert`
- [x] 2.3 **掛載點決策（明確通過條件）**：grep 確認 AppSidebar 未被任何 page/layout import。
  - **決策 (b)：不掛載** — spec Scenario 2 標為「latent，待掛載後驗」，記入 propose_checklist 跳過項目表

## 3. 建立 useDevMode hook（D4, REF-005, REF-006）

- [x] 3.1 建 `src/hooks/useDevMode.ts`：`createClient().auth.getUser()` + `onAuthStateChange` 訂閱，回傳 `{ isDeveloper, loading }`（`loading` 為 hydration 安全必要欄位，REF-006）
- [x] 3.2 `isDeveloper = user?.app_metadata?.role === 'developer'`
- [x] 3.3 cleanup：unsubscribe listener

## 4. 建立 DevModeBanner + 接入 layout（D5, REF-005, REF-006）

- [x] 4.1 建 `src/components/DevModeBanner.tsx`（`"use client"`，用 `useDevMode`）
- [x] 4.2 `loading || !isDeveloper` → return `null`（loading 在前，hydration 安全）；否則 render banner
- [x] 4.3 接入 `src/app/layout.tsx`（已驗證有效掛載點，`FloatingDock` 在此）

## 5. Supabase Dashboard 設定開發者 app_metadata（D3, REF-005）— [M1] 含驗證+回滾

> **需手動在 Supabase Dashboard SQL Editor 執行。**

- [x] 5.1 **設定前查詢**（基準）：確認 a25196790@gmail.com 存在，raw_app_meta_data={"provider":"google"...}
- [x] 5.2 **設定 SQL**：COALESCE 版 UPDATE 執行成功（via Supabase Dashboard SQL Editor）
- [x] 5.3 **設定後驗證**：SELECT LIMIT 5 確認 role='developer' 已寫入
- [x] 5.4 **rollback SQL**（文件化備用）：`UPDATE auth.users SET raw_app_meta_data = raw_app_meta_data - 'role' WHERE email IN (...);`
- [x] 5.5 文件化 caveat：設定後使用者須重新登入或等 token 刷新才生效（REF-005）
- [x] 5.6 email 清單記於此 tasks.md 備註，未 hardcode 進程式碼。其餘 4 個 email 待首次登入後補設

## 6. 本地測試：登入/登出 + dev mode 顯示/隱藏

- [x] 6.1 一般使用者：首頁登入 → 跳轉 Google → callback → session 建立 ✅（DEV banner 出現即確認 session 成功）
- [x] 6.2 側邊欄登出 → latent 修復，AppSidebar 未掛載，記為跳過（Task 2.3 決策 b）
- [x] 6.3 開發者帳號登入 → DEV MODE banner 顯示 ✅ 瀏覽器截圖確認
- [x] 6.4 未登入 → banner 不顯示 ✅ 已確認
- [x] 6.5 未登入 → banner 不顯示 ✅ 已確認

## 7. Vercel 環境確認

- [x] 7.1 確認 prod `NEXT_PUBLIC_SUPABASE_URL` / publishable key 正確（.env.local 本地已有）
- [x] 7.2 Supabase URL Configuration 確認：`https://overwatch-social.vercel.app/auth/callback` + `http://localhost:3000/auth/callback` 兩條均存在 ✅
- [ ] 7.3 部署後 prod 端 smoke：push 到 Vercel 後確認首頁登入按鈕正常（待 git push）
