---
affects_consumers: []
---

# OAuth 登入完成後保留來源頁面（不再一律跳回 /profile）

## Why

使用者反饋：在「展示館」(`/browse`) 點玩家卡觸發 LoginModal 完成 Google 登入後，被丟離展示館導向 `/profile`，失去原本探索的脈絡，操作不連貫。

EXPLORE 階段定位根因（程式碼診斷，非外部技術調研，故未建 REF）：

- `src/app/auth/callback/route.ts:5-22` 的 `safeRedirectPath()` **已支援** `?next=` 參數做精準回跳，預設 fallback 為 `/profile`。
- 但**全站 4 個 `signInWithOAuth` 入口的 `redirectTo` 全部寫死** `${origin}/auth/callback`，沒帶 `?next=`：
  - `src/components/LoginModal.tsx:26-40`（被 `OverwatchSquare` 用於 `/browse` 卡片互動）
  - `src/app/HomeClient.tsx:60-69`（首頁 `/` 雲朵 starmap 隱藏入口）
  - `src/app/profile/ProfileClient.tsx:687-696`（`/profile` 守門面板）
  - `src/components/AuthShelvedButtons.tsx:31-45`（dead code，備份元件）
- 結果：callback 一律拿到 `next=null`，全部 fallback 到 `/profile`。

`/profile` 入口剛好「巧合對齊」（fallback 是 /profile），但 `/browse` 與 `/` 入口都會丟掉脈絡。

### 缺口錨定

- 程式碼層面已有錨點：callback 端 `safeRedirectPath` 設計時已預留 `?next=` 通道（含同源驗證與 protocol-relative 防護），缺的是呼叫端配合寫入 next。
- 既有 spec `auth-ux/spec.md` 「LoginModal 彈窗登入」Scenario 第 47 行明確示意 `redirectTo: window.location.origin + '/auth/callback'`（不含 next），需要 update 為包含 next 的版本，並新增「登入完成後保留來源頁面」requirement。

## What Changes

1. **新增 helper** `src/lib/auth/googleLogin.ts`：暴露 `signInWithGoogle({ nextPath? })`，內部：
   - 預設 `nextPath = window.location.pathname + window.location.search`
   - 過濾 unsafe prefix（`/auth/*`、`/developer/*`）以避免 callback 迴圈或被丟去守門頁
   - `encodeURIComponent` 後組 `redirectTo: ${origin}/auth/callback?next=${encoded}`
   - 呼叫 `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })`

2. **4 個入口改呼叫 helper**：
   - `LoginModal.tsx`、`HomeClient.tsx`、`ProfileClient.tsx`、`AuthShelvedButtons.tsx`
   - dead code（`AuthShelvedButtons.tsx`）一併改，避免未來重掛載再踩坑

3. **保留 callback 端 `safeRedirectPath` 不動**（深度防禦：同源驗證 + protocol-relative 防護 + parse 失敗 fallback `/`）。

4. **Spec delta**（`auth-ux` capability）：
   - **ADDED**：「OAuth 登入完成後保留來源頁面」requirement
   - **MODIFIED**：「LoginModal 彈窗登入」Scenario 47 行的 `redirectTo` 範例改為含 `?next=` 形式

## Non-Goals

- 不動登出（`window.location.href = "/"`）與刪除帳號跳轉——語意上「離開狀態」回首頁合理。
- 不切換 OAuth provider、不加多 provider、不改 PKCE flow。
- 不改 callback 端 `safeRedirectPath` 邏輯（已正確）。
- 不引入新依賴。

## Impact

- 受影響 capability：`auth-ux`
- 受影響檔案（5 個）：
  - **新增**：`src/lib/auth/googleLogin.ts`
  - **修改**：`src/components/LoginModal.tsx`、`src/app/HomeClient.tsx`、`src/app/profile/ProfileClient.tsx`、`src/components/AuthShelvedButtons.tsx`
- 知識點：無新增 REF（程式碼路徑診斷，非外部技術調研）
- 純前端行為修正，無 DB migration、無 server-side 變更
- Supabase OAuth 白名單兼容性：Supabase 對 `redirectTo` 用 prefix match，`/auth/callback?next=...` 仍命中既有白名單條目 `/auth/callback`（design.md D2 詳述）
