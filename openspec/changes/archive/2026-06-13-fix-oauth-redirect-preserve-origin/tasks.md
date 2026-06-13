# Tasks — fix-oauth-redirect-preserve-origin

## 1. 環境校準與基線 [PRE]

- [ ] 1.1 確認本機 dev 環境可正常 npm run dev（不要中斷使用者既有 hot reload；user 自己跑 task 5 時順帶確認）
- [ ] 1.2 確認 Supabase OAuth 白名單目前條目（記下原狀以利 task 5 rollback 判斷；user 自己 dashboard 查）

## 2. 新增 helper

- [x] 2.1 建 `src/lib/auth/googleLogin.ts`，匯出 `signInWithGoogle({ nextPath? })` 與 `buildNext(currentPath)` 與 `UNSAFE_NEXT_PREFIXES` 常數
- [x] 2.2 實作 `buildNext`：以 `UNSAFE_NEXT_PREFIXES.some(p => currentPath.startsWith(p))` 判斷 → 命中 fallback `/profile`，否則回傳 `currentPath`
- [x] 2.3 實作 `signInWithGoogle`：預設 `nextPath = window.location.pathname + window.location.search`（SSR fallback `/profile`），`encodeURIComponent` 後組 `redirectTo: ${origin}/auth/callback?next=${encoded}`
- [x] 2.4 helper 加 JSDoc 一行說明用途與「為什麼要過濾 unsafe prefix」

## 3. 替換 4 個入口

- [x] 3.1 `src/components/LoginModal.tsx`：移除 inline `signInWithOAuth`，改呼叫 `signInWithGoogle()`，保留 `loginPending` state 與錯誤處理
- [x] 3.2 `src/app/HomeClient.tsx`：同 3.1（注意 import 路徑改 `@/lib/auth/googleLogin`，移除 dynamic import `@/lib/supabase/client`，改靜態 import helper）
- [x] 3.3 `src/app/profile/ProfileClient.tsx:687-696` `handleGoogleLogin`：同 3.1
- [x] 3.4 `src/components/AuthShelvedButtons.tsx`：同 3.1（dead code 一併改）
- [x] 3.5 全檔 grep 確認再無遺漏的 `signInWithOAuth` 入口：`grep -rn 'signInWithOAuth' src/` → 應僅命中 `src/lib/auth/googleLogin.ts` 一處

## 4. 單元測試

- [x] 4.1 建 `src/lib/auth/googleLogin.test.ts`（vitest），測 `buildNext`：
  - 輸入 `/browse` → 回 `/browse`
  - 輸入 `/browse?query=foo` → 回 `/browse?query=foo`
  - 輸入 `/auth/callback` → 回 `/profile`
  - 輸入 `/auth/error?reason=xxx` → 回 `/profile`
  - 輸入 `/developer/tags-manager` → 回 `/profile`
  - 輸入 `/` → 回 `/`
  - 輸入 `/player/abc123` → 回 `/player/abc123`
- [x] 4.2 `npx vitest run src/lib/auth/googleLogin.test.ts` 全綠
- [x] 4.3 [SKIP IF 專案無 vitest 設定] 若 vitest 未配置，改寫 `src/lib/auth/__manual__/googleLogin.manual.md` 列同樣案例供手動 console 驗證；補 task 4.4 確認測試框架狀態

## 5. 手動驗證流程（dev 環境，待 user 親跑）

- [ ] 5.1 從 `/browse` 點任一玩家卡的「複製 UID」→ LoginModal 出現 → 點 Google 登入 → 完成 OAuth → **驗證**：URL 回到 `/browse`（含原 query 參數，若有）
- [ ] 5.2 從 `/`（首頁）點雲朵展開 starmap → 點 Google 登入 → **驗證**：回到 `/`
- [ ] 5.3 從 `/profile` 守門面板點 Continue with Google → **驗證**：回到 `/profile`
- [ ] 5.4 手動構造異常：在瀏覽器網址列輸入 `/auth/callback?next=https://evil.example/`（OAuth 完成回 callback 時）→ **驗證**：被 `safeRedirectPath` 同源檢查擋下 fallback `/`
- [ ] 5.5 截圖 / 文字記錄上述 4 個驗證結果，寫入 `notes/latest.md`

## 6. 既有 spec 對齊與 lint

- [x] 6.1 `npx tsc --noEmit` 通過
- [x] 6.2 `npm run lint` 通過
- [x] 6.3 `openspec validate fix-oauth-redirect-preserve-origin --strict` 通過

## 7. 驗收整合記錄

- [x] 7.1 在 `notes/latest.md` 末尾追加本 change 的 apply 完成記錄（含 5.1-5.4 驗證結果）
- [ ] 7.2 提示使用者實機（行動裝置）跑一次完整 flow（建議：手機開展示館 → 點卡 → 登入 → 確認回到展示館），結果回報後標 7.2 完成
