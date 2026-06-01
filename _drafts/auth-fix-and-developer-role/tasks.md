# Tasks: auth-fix-and-developer-role

> **Phase 切分（proposal scope gate）**：
> - **Phase A = auth mock 修復**（Task 0-2）：阻斷級，不依賴 Dashboard 手動作業，可獨立 ship。
> - **Phase B = developer role**（Task 3-7）：依賴 Phase A + Supabase Dashboard 手動設定；卡關不得阻塞 Phase A。

## 0. 環境校準（apply 第一 task）

- [ ] 0.1 確認 `@supabase/ssr` 與 `@supabase/supabase-js` 版本（`package.json`），驗證 `@/lib/supabase/client` 的 `createClient()` 與 `Navbar.tsx` 一致可用（REF-002 caveat：API 演進中）
- [ ] 0.2 `npm run dev` smoke 啟動，確認首頁可載入、`Navbar` 既有登入流程仍正常（基準線）

## 1. 修復首頁登入（D1, REF-003）

- [ ] 1.1 `page.tsx` 加 `"use client"` 既有、import `createClient`（`@/lib/supabase/client`）
- [ ] 1.2 `handleGoogleLogin` 改 async：呼叫 `signInWithOAuth({ provider:'google', options:{ redirectTo: \`${window.location.origin}/auth/callback?next=/profile\` } })`，移除 `alert`
- [ ] 1.3 驗證：點按鈕跳轉 Google 授權頁（非 alert）

## 2. 修復側邊欄登出（D2, REF-002）— latent 修復

> **[M3]** grep 全 src 確認 `AppSidebar` 與 `Navbar` 皆未掛載；唯一 live 登入入口是 `page.tsx`。本 task 為一致性 latent 修復。

- [ ] 2.1 `AppSidebar.tsx` import `createClient` + `useRouter`（`next/navigation`）
- [ ] 2.2 `handleLogout` 改 async：`await supabase.auth.signOut()` 後 `router.refresh()`，移除 `alert`
- [ ] 2.3 **掛載點決策（明確通過條件）**：grep 確認 `AppSidebar` mount file 與 render path。二選一並記錄：
  - (a) 若決定掛載 → 指定掛載點（須在 router context）→ 補 smoke：登入後點 sidebar logout → session 清除
  - (b) 若決定不掛載 → spec Scenario 2 標為「latent，待掛載後驗」並記入 propose_checklist 跳過項目表，**不假裝勾選**

## 3. 建立 useDevMode hook（D4, REF-005, REF-006）

- [ ] 3.1 建 `src/hooks/useDevMode.ts`：`createClient().auth.getUser()` + `onAuthStateChange` 訂閱，回傳 `{ isDeveloper, loading }`（`loading` 為 hydration 安全必要欄位，REF-006）
- [ ] 3.2 `isDeveloper = user?.app_metadata?.role === 'developer'`
- [ ] 3.3 cleanup：unsubscribe listener

## 4. 建立 DevModeBanner + 接入 layout（D5, REF-005, REF-006）

- [ ] 4.1 建 `src/components/DevModeBanner.tsx`（`"use client"`，用 `useDevMode`）
- [ ] 4.2 `loading || !isDeveloper` → return `null`（loading 在前，hydration 安全）；否則 render banner
- [ ] 4.3 接入 `src/app/layout.tsx`（已驗證有效掛載點，`FloatingDock` 在此）

## 5. Supabase Dashboard 設定開發者 app_metadata（D3, REF-005）— [M1] 含驗證+回滾

- [ ] 5.1 **設定前查詢**（基準）：`SELECT id, email, raw_app_meta_data FROM auth.users WHERE email IN (...);` 記錄既有 metadata（確認非 null、結構正確）
- [ ] 5.2 **設定 SQL**（`||` 合併，保留既有鍵）：`UPDATE auth.users SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role":"developer"}' WHERE email IN (...);`（`COALESCE` 防既有值為 null）
- [ ] 5.3 **設定後驗證**：重跑 5.1 SELECT，確認 `raw_app_meta_data->>'role' = 'developer'` 且其他既有鍵未遺失
- [ ] 5.4 **rollback SQL**（文件化備用）：`UPDATE auth.users SET raw_app_meta_data = raw_app_meta_data - 'role' WHERE email IN (...);`
- [ ] 5.5 文件化 caveat：設定後使用者須重新登入或等 token 刷新才生效（REF-005）
- [ ] 5.6 記錄哪些 email 被設為 developer 於文件（位置：`docs/dev-roles.md` 或 change 內），**不提交真實 email、不 hardcode 進程式碼**（用佔位或私有記錄）

## 6. 本地測試：登入/登出 + dev mode 顯示/隱藏

- [ ] 6.1 一般使用者：首頁登入 → 跳轉 Google → callback → 登入態（spec Scenario 1）
- [ ] 6.2 側邊欄登出 → session 清除 → 回未登入態（spec Scenario 2）
- [ ] 6.3 開發者帳號登入 → banner 顯示（spec Scenario 3）
- [ ] 6.4 一般使用者登入 → banner 不顯示（spec Scenario 4）
- [ ] 6.5 未登入 → banner 不顯示（spec Scenario 5）

## 7. Vercel 環境確認

- [ ] 7.1 確認 prod `NEXT_PUBLIC_SUPABASE_URL` / publishable key 正確（REF-002 命名）
- [ ] 7.2 確認 Supabase Google provider 的 redirect URL 含 prod 網域（REF-003）
- [ ] 7.3 部署後 prod 端 smoke：首頁登入按鈕跳轉正常
